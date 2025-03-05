import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { SymptomLog, Symptom, Mood } from '../../types/symptoms';

interface SymptomTrendsProps {
  logs: SymptomLog[];
  symptoms: Symptom[];
  moods: Mood[];
  timeRange: 'week' | 'month' | '3months';
}

export const SymptomTrends: React.FC<SymptomTrendsProps> = ({
  logs,
  symptoms,
  moods,
  timeRange
}) => {
  const sortedLogs = useMemo(() => 
    [...logs].sort((a, b) => a.date.getTime() - b.date.getTime()),
    [logs]
  );

  // Prepare temperature data
  const temperatureData = useMemo(() => 
    sortedLogs
      .filter(log => log.physicalStats.temperature)
      .map(log => ({
        date: log.date.toLocaleDateString(),
        temperature: log.physicalStats.temperature
      })),
    [sortedLogs]
  );

  // Calculate symptom frequency
  const symptomFrequency = useMemo(() => {
    const frequency: Record<string, number> = {};
    sortedLogs.forEach(log => {
      log.symptoms.forEach(symptomId => {
        frequency[symptomId] = (frequency[symptomId] || 0) + 1;
      });
    });

    return Object.entries(frequency)
      .map(([id, count]) => ({
        name: symptoms.find(s => s.id === id)?.name || id,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);  // Top 10 symptoms
  }, [sortedLogs, symptoms]);

  // Calculate mood distribution
  const moodDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    sortedLogs.forEach(log => {
      log.moods.forEach(moodId => {
        distribution[moodId] = (distribution[moodId] || 0) + 1;
      });
    });

    return Object.entries(distribution)
      .map(([id, count]) => ({
        name: moods.find(m => m.id === id)?.name || id,
        count
      }))
      .sort((a, b) => b.count - a.count);
  }, [sortedLogs, moods]);

  return (
    <div className="space-y-8 p-6 bg-white rounded-xl shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Symptom Trends
        </h2>

        {/* Temperature Chart */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Temperature Variation
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Symptom Frequency */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Most Common Symptoms
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={symptomFrequency} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Distribution */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Mood Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pattern Analysis */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Pattern Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-purple-50 rounded-lg"
          >
            <h4 className="font-medium text-purple-700 mb-2">
              Most Active Times
            </h4>
            <p className="text-gray-600">
              Analysis of your most frequently reported symptoms and their timing.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-purple-50 rounded-lg"
          >
            <h4 className="font-medium text-purple-700 mb-2">
              Correlations
            </h4>
            <p className="text-gray-600">
              Potential connections between symptoms, moods, and physical stats.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Data shown for the last {timeRange === 'week' ? '7 days' : timeRange === 'month' ? '30 days' : '90 days'}
      </div>
    </div>
  );
}; 