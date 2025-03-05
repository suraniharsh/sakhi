import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SymptomLogger } from '../components/symptoms/SymptomLogger';
import { DailySummaryView } from '../components/symptoms/DailySummaryView';
import { SymptomTrends } from '../components/symptoms/SymptomTrends';
import { SymptomService } from '../services/symptomService';
import { ReportService } from '../services/reportService';
import { symptoms, moods } from '../data/masterData';
import { DailySymptomSummary, SymptomLog } from '../types/symptoms';
import { motion } from 'framer-motion';

export const SymptomTrackingPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months'>('week');
  const [dailySummary, setDailySummary] = useState<DailySymptomSummary | null>(null);
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Get daily summary
        const summary = await SymptomService.getDailySummary(user.uid, selectedDate);
        setDailySummary(summary);

        // Get logs for trends
        const endDate = new Date();
        const startDate = new Date();
        switch (timeRange) {
          case 'week':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'month':
            startDate.setDate(startDate.getDate() - 30);
            break;
          case '3months':
            startDate.setDate(startDate.getDate() - 90);
            break;
        }

        const logs = await SymptomService.getDailyLogs(user.uid, startDate, endDate);
        setLogs(logs);
      } catch (error) {
        console.error('Error loading symptom data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, selectedDate, timeRange]);

  const handleExportPDF = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/generateSymptomReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          endDate: new Date().toISOString(),
          includeStats: true,
          includeMoods: true,
          includeNotes: true
        })
      });

      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeRangeChange = (range: 'week' | 'month' | '3months') => {
    setTimeRange(range);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Please log in to track symptoms</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Date Selection */}
        <div className="flex justify-between items-center">
          <div className="space-x-4">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="3months">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Symptom Logger */}
        <SymptomLogger
          userId={user.uid}
          date={selectedDate}
          symptoms={symptoms}
          moods={moods}
          onSave={() => {
            // Refresh data after saving
            setSelectedDate(new Date(selectedDate));
          }}
        />

        {/* Daily Summary */}
        {dailySummary && (
          <DailySummaryView
            summary={dailySummary}
            symptoms={symptoms}
            moods={moods}
            onExport={handleExportPDF}
          />
        )}

        {/* Trends */}
        {logs.length > 0 && (
          <SymptomTrends
            logs={logs}
            symptoms={symptoms}
            moods={moods}
            timeRange={timeRange}
          />
        )}
      </motion.div>
    </div>
  );
}; 