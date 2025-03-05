import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { HealthInsight, InsightSummary, TemperatureData, SymptomCorrelation } from '../types/insights';
import { healthInsightService } from '../services/HealthInsightService';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export const HealthInsightsPage: React.FC = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [temperatureData, setTemperatureData] = useState<TemperatureData[]>([]);
  const [symptomCorrelations, setSymptomCorrelations] = useState<SymptomCorrelation[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const recentInsights = await healthInsightService.getRecentInsights(user.uid);
        setInsights(recentInsights);

        // Simulated data - in reality, would fetch from your data service
        setTemperatureData([
          { date: new Date('2024-03-01'), value: 36.5, phase: 'follicular' },
          { date: new Date('2024-03-02'), value: 36.4, phase: 'follicular' },
          { date: new Date('2024-03-03'), value: 36.6, phase: 'follicular' },
          { date: new Date('2024-03-04'), value: 36.7, phase: 'ovulation' },
          { date: new Date('2024-03-05'), value: 36.9, phase: 'ovulation' },
          { date: new Date('2024-03-06'), value: 37.0, phase: 'luteal' },
          { date: new Date('2024-03-07'), value: 37.1, phase: 'luteal' }
        ]);

        setSymptomCorrelations([
          {
            symptom: 'Headache',
            frequency: 8,
            relatedSymptoms: [
              { symptom: 'Fatigue', correlation: 0.7 },
              { symptom: 'Nausea', correlation: 0.5 }
            ],
            cyclePhaseDistribution: {
              follicular: 0.2,
              ovulation: 0.1,
              luteal: 0.5,
              menstrual: 0.2
            }
          },
          // Add more correlations as needed
        ]);
      } catch (error) {
        console.error('Error loading health insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const renderTemperatureChart = () => (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={temperatureData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} />
          <Tooltip
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
            formatter={(value) => [`${value}°C`, 'Temperature']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#EC4899"
            strokeWidth={2}
            dot={{ fill: '#EC4899' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderSymptomCorrelationChart = (correlation: SymptomCorrelation) => {
    const data = [
      { name: 'Follicular', value: correlation.cyclePhaseDistribution.follicular * 100 },
      { name: 'Ovulation', value: correlation.cyclePhaseDistribution.ovulation * 100 },
      { name: 'Luteal', value: correlation.cyclePhaseDistribution.luteal * 100 },
      { name: 'Menstrual', value: correlation.cyclePhaseDistribution.menstrual * 100 }
    ];

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart outerRadius={90} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis domain={[0, 100]} />
            <Radar
              name="Distribution"
              dataKey="value"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Please log in to view health insights</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Temperature Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6 mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Temperature Trends</h2>
            {renderTemperatureChart()}
          </motion.div>

          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent Insights</h2>
            <div className="space-y-4">
              {insights.map(insight => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg ${
                    insight.severity === 'alert' ? 'bg-red-50 border-l-4 border-red-500'
                    : insight.severity === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500'
                    : 'bg-blue-50 border-l-4 border-blue-500'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{insight.title}</h3>
                  <p className="text-gray-600 mt-1">{insight.description}</p>
                  <p className="text-gray-800 mt-2 font-medium">Recommendation:</p>
                  <p className="text-gray-600">{insight.recommendation}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div>
          {/* Symptom Correlations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Symptom Analysis</h2>
            {symptomCorrelations.map(correlation => (
              <div key={correlation.symptom} className="mb-8">
                <h3 className="font-medium text-gray-800 mb-4">{correlation.symptom}</h3>
                {renderSymptomCorrelationChart(correlation)}
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Commonly occurs with:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {correlation.relatedSymptoms.map(related => (
                      <span
                        key={related.symptom}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {related.symptom} ({Math.round(related.correlation * 100)}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6 mt-8"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Average Cycle Length</p>
                <p className="text-lg font-medium text-gray-900">28 days</p>
              </div>
              <div>
                <p className="text-gray-600">Cycle Regularity</p>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full"
                    style={{ width: '85%' }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">85% regular</p>
              </div>
              <div>
                <p className="text-gray-600">Most Common Symptoms</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                    Headache (8)
                  </span>
                  <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                    Fatigue (6)
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}; 