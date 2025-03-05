import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CycleCalculationService } from '../../services/CycleCalculationService';
import { CycleDataService } from '../../services/CycleDataService';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { format, differenceInDays, isAfter } from 'date-fns';

interface CycleSummaryData {
  averageCycleLength: number;
  averagePeriodLength: number;
  lastPeriodDate: Date | null;
  nextPeriodDate: Date | null;
  totalCycles: number;
  lastActivity: {
    type: string;
    date: Date;
  } | null;
}

export const CycleSummaryCard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<CycleSummaryData | null>(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const dataService = new CycleDataService(user.uid);
        const periodLogs = await dataService.getPeriodLogs();

        if (periodLogs.length === 0) {
          setError('No period data available');
          return;
        }

        const today = new Date();
        const cycleService = new CycleCalculationService();
        periodLogs.forEach(log => cycleService.addPeriodLog(log));
        const cycleDays = cycleService.predictNextCycle(today);

        // Calculate last period date
        const pastPeriods = cycleDays
          .filter(day => day.phase === 'period' && !isAfter(day.date, today))
          .sort((a, b) => b.date.getTime() - a.date.getTime());
        
        const lastPeriodDate = pastPeriods[0]?.date || null;

        // Calculate next period date
        const futurePeriods = cycleDays
          .filter(day => day.phase === 'period' && isAfter(day.date, today))
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        const nextPeriodDate = futurePeriods[0]?.date || null;

        // Calculate average cycle length
        let totalCycleDays = 0;
        let validCycles = 0;
        for (let i = 0; i < periodLogs.length - 1; i++) {
          const cycleDays = differenceInDays(
            periodLogs[i].startDate,
            periodLogs[i + 1].startDate
          );
          if (cycleDays >= 21 && cycleDays <= 35) {
            totalCycleDays += cycleDays;
            validCycles++;
          }
        }
        const averageCycleLength = validCycles > 0 
          ? Math.round(totalCycleDays / validCycles)
          : 28;

        // Calculate average period length
        let totalPeriodDays = 0;
        periodLogs.forEach(log => {
          const periodDays = differenceInDays(log.endDate, log.startDate) + 1;
          if (periodDays >= 3 && periodDays <= 10) {
            totalPeriodDays += periodDays;
          }
        });
        const averagePeriodLength = periodLogs.length > 0 
          ? Math.round(totalPeriodDays / periodLogs.length)
          : 5;

        setSummaryData({
          averageCycleLength,
          averagePeriodLength,
          lastPeriodDate,
          nextPeriodDate,
          totalCycles: periodLogs.length,
          lastActivity: periodLogs.length > 0 ? {
            type: 'Period logged',
            date: periodLogs[0].startDate
          } : null
        });
      } catch (err) {
        setError('Failed to load cycle data');
        console.error('Error fetching cycle data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-6 flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error || !summaryData) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="text-center text-gray-500">
          {error || 'Unable to load cycle summary'}
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Not available';
    return format(date, 'MMM dd, yyyy');
  };

  const getDaysUntil = (date: Date | null): string => {
    if (!date) return '';
    const days = differenceInDays(date, new Date());
    if (days === 0) return 'Today';
    return `in ${days} ${days === 1 ? 'day' : 'days'}`;
  };

  const getTimeAgo = (date: Date): string => {
    const days = differenceInDays(new Date(), date);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 14) return '1 week ago';
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Cycle Summary</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-3">
            <ChartBarIcon className="w-5 h-5 text-pink-500" />
            <h3 className="font-medium text-gray-800">Cycle Statistics</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Average Length</p>
              <p className="text-lg font-semibold text-gray-800">
                {summaryData.averageCycleLength} days
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Period Duration</p>
              <p className="text-lg font-semibold text-gray-800">
                {summaryData.averagePeriodLength} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-3">
            <CalendarIcon className="w-5 h-5 text-pink-500" />
            <h3 className="font-medium text-gray-800">Period Dates</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Last Period</p>
                <p className="font-medium text-gray-800">{formatDate(summaryData.lastPeriodDate)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Next Period</p>
                <p className="font-medium text-gray-800">{formatDate(summaryData.nextPeriodDate)}</p>
              </div>
              <span className="text-sm text-pink-500">{getDaysUntil(summaryData.nextPeriodDate)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-3">
            <ClockIcon className="w-5 h-5 text-pink-500" />
            <h3 className="font-medium text-gray-800">Recent Activity</h3>
          </div>
          <div className="space-y-2">
            {summaryData.lastActivity && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{summaryData.lastActivity.type}</span>
                <span className="text-gray-500">{getTimeAgo(summaryData.lastActivity.date)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Cycles Logged</span>
              <span className="text-gray-500">{summaryData.totalCycles}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 