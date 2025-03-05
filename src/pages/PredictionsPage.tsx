import React, { useState, useEffect } from 'react';
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
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, differenceInDays } from 'date-fns';
import { CycleCalculationService, type PeriodLog } from '../services/CycleCalculationService';
import { CycleDataService } from '../services/CycleDataService';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface CycleTrend {
  date: string;
  cycleLength: number;
  periodLength: number;
}

interface SymptomData {
  name: string;
  value: number;
  color: string;
}

export const PredictionsPage: React.FC = () => {
  const [periodLogs, setPeriodLogs] = useState<PeriodLog[]>([]);
  const [cycleTrends, setCycleTrends] = useState<CycleTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cycleService] = useState(() => new CycleCalculationService());
  const { user } = useAuth();

  const COLORS = ['#FF69B4', '#8B5CF6', '#EC4899', '#9333EA', '#DB2777'];

  // Sample symptom data - in a real app, this would come from user logs
  const symptomData: SymptomData[] = [
    { name: 'Cramps', value: 65, color: '#FF69B4' },
    { name: 'Headache', value: 45, color: '#8B5CF6' },
    { name: 'Mood Swings', value: 55, color: '#EC4899' },
    { name: 'Fatigue', value: 40, color: '#9333EA' },
    { name: 'Bloating', value: 35, color: '#DB2777' }
  ];

  useEffect(() => {
    if (user) {
      loadPeriodData();
    }
  }, [user]);

  const loadPeriodData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const dataService = new CycleDataService(user.uid);
      const logs = await dataService.getPeriodLogs();
      
      // Sort logs by date
      const sortedLogs = logs.sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      setPeriodLogs(sortedLogs);
      
      // Calculate cycle trends
      const trends: CycleTrend[] = [];
      for (let i = 1; i < sortedLogs.length; i++) {
        const currentLog = sortedLogs[i];
        const previousLog = sortedLogs[i - 1];
        
        const cycleLength = differenceInDays(
          new Date(currentLog.startDate),
          new Date(previousLog.startDate)
        );
        
        const periodLength = differenceInDays(
          new Date(currentLog.endDate),
          new Date(currentLog.startDate)
        ) + 1;

        trends.push({
          date: format(new Date(currentLog.startDate), 'MMM dd'),
          cycleLength,
          periodLength
        });
      }

      setCycleTrends(trends);
    } catch (error) {
      console.error('Error loading period data:', error);
      toast.error('Failed to load prediction data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverageCycleLength = (): number => {
    if (cycleTrends.length === 0) return 28;
    const sum = cycleTrends.reduce((acc, curr) => acc + curr.cycleLength, 0);
    return Math.round(sum / cycleTrends.length);
  };

  const calculateAveragePeriodLength = (): number => {
    if (cycleTrends.length === 0) return 5;
    const sum = cycleTrends.reduce((acc, curr) => acc + curr.periodLength, 0);
    return Math.round(sum / cycleTrends.length);
  };

  const getRegularityScore = (): number => {
    if (cycleTrends.length < 2) return 0;
    
    const variations = cycleTrends.map(trend => Math.abs(trend.cycleLength - calculateAverageCycleLength()));
    const averageVariation = variations.reduce((a, b) => a + b) / variations.length;
    
    // Convert variation to a 0-100 score (lower variation = higher score)
    return Math.max(0, Math.min(100, 100 - (averageVariation * 10)));
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <p className="text-gray-500 text-lg">Please log in to view predictions</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-gray-800 mb-8">
          Cycle Predictions & Analysis
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cycle Length Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Cycle Length Trends</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cycleTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="cycleLength"
                    stroke="#FF69B4"
                    strokeWidth={2}
                    dot={{ fill: '#FF69B4' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Period Duration Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Period Duration Analysis</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cycleTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="periodLength" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Cycle Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Cycle Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-pink-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-pink-600 mb-2">Average Cycle</p>
                <p className="text-3xl font-bold text-gray-800">
                  {calculateAverageCycleLength()}
                  <span className="text-sm ml-1">days</span>
                </p>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-purple-600 mb-2">Average Period</p>
                <p className="text-3xl font-bold text-gray-800">
                  {calculateAveragePeriodLength()}
                  <span className="text-sm ml-1">days</span>
                </p>
              </div>
              <div className="bg-pink-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-pink-600 mb-2">Regularity Score</p>
                <p className="text-3xl font-bold text-gray-800">
                  {getRegularityScore()}
                  <span className="text-sm ml-1">%</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Symptom Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Symptom Analysis</h2>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={symptomData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {symptomData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">Symptoms</p>
                  <p className="text-sm text-gray-500">Distribution</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {symptomData.map((symptom, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: symptom.color }} />
                  <span className="text-sm text-gray-600">{symptom.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Health Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-3xl shadow-xl p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Health Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">Cycle Regularity</h3>
              <p className="text-sm opacity-90">
                Your cycles are {getRegularityScore() > 80 ? 'very regular' : 'somewhat irregular'}. 
                {getRegularityScore() > 80 
                  ? ' This is a positive sign for your hormonal health.'
                  : ' Consider tracking potential lifestyle factors that might affect your cycle.'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">Period Duration</h3>
              <p className="text-sm opacity-90">
                Your average period length is {calculateAveragePeriodLength()} days, which is
                {calculateAveragePeriodLength() >= 3 && calculateAveragePeriodLength() <= 7 
                  ? ' within the normal range.'
                  : ' outside the typical range. Consider consulting a healthcare provider.'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-600 to-purple-500 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">Fertility Window</h3>
              <p className="text-sm opacity-90">
                Based on your cycle length of {calculateAverageCycleLength()} days, 
                your fertile window typically occurs between days {Math.max(8, calculateAverageCycleLength() - 19)} 
                and {Math.max(14, calculateAverageCycleLength() - 13)} of your cycle.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 