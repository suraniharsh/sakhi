import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CyclePrediction, CycleStatistics } from '../../types/cycle';
import { predictionService } from '../../services/predictionService';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export interface CyclePredictionsProps {
  onError: (message: string) => void;
}

export const CyclePredictions: React.FC<CyclePredictionsProps> = ({ onError }) => {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState<CyclePrediction | null>(null);
  const [statistics, setStatistics] = useState<CycleStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const [predictionData, statsData] = await Promise.all([
          predictionService.generatePrediction(user.uid),
          predictionService.updateStatistics(user.uid)
        ]);

        setPrediction(predictionData);
        setStatistics(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!prediction || !statistics) {
    return (
      <div className="text-gray-600 text-center p-4">
        Not enough cycle data to generate predictions.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Next Period Prediction */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Next Period Prediction
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Expected Start</span>
            <span className="font-medium">
              {prediction.nextPeriodStart.toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Expected End</span>
            <span className="font-medium">
              {prediction.nextPeriodEnd.toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Prediction Confidence</span>
            <div className="flex items-center">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${prediction.confidence}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-purple-500"
                />
              </div>
              <span className="ml-2 font-medium">{prediction.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cycle Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Your Cycle Statistics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600">Average Cycle Length</div>
            <div className="text-2xl font-semibold text-purple-700">
              {Math.round(statistics.averageCycleLength)} days
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600">Cycles Logged</div>
            <div className="text-2xl font-semibold text-purple-700">
              {statistics.totalCyclesLogged}
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600">Shortest Cycle</div>
            <div className="text-2xl font-semibold text-purple-700">
              {Math.round(statistics.shortestCycle)} days
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600">Longest Cycle</div>
            <div className="text-2xl font-semibold text-purple-700">
              {Math.round(statistics.longestCycle)} days
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500 text-center">
          Last updated: {statistics.lastCalculated.toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
}; 