import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, ArrowRightIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { BirthControlTracker } from '../birthcontrol/BirthControlTracker';
import { BirthControlService, BirthControlMethod, BirthControlLog } from '../../services/BirthControlService';
import { format } from 'date-fns';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const BirthControlCard: React.FC = () => {
  const [showFullTracker, setShowFullTracker] = useState(false);
  const [activeMethod, setActiveMethod] = useState<BirthControlMethod | null>(null);
  const [logs, setLogs] = useState<BirthControlLog[]>([]);
  const [adherenceRate, setAdherenceRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldTakeToday, setShouldTakeToday] = useState(false);

  useEffect(() => {
    const fetchBirthControlData = async () => {
      try {
        setLoading(true);
        const birthControlService = new BirthControlService();
        
        // Get active method
        const method = await birthControlService.getActiveBirthControlMethod();
        setActiveMethod(method);
        
        if (method) {
          // Get logs for the active method
          const methodLogs = await birthControlService.getBirthControlLogs(method.id);
          setLogs(methodLogs);
          
          // Calculate adherence rate
          const rate = birthControlService.getAdherenceRate(methodLogs);
          setAdherenceRate(rate);
          
          // Check if user should take birth control today
          const shouldTake = birthControlService.shouldTakeToday(method, methodLogs);
          setShouldTakeToday(shouldTake);
        }
      } catch (err) {
        console.error('Error loading birth control data:', err);
        setError('Failed to load birth control data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBirthControlData();
  }, []);

  const getMethodTypeLabel = (type: BirthControlMethod['type']) => {
    const typeLabels: Record<BirthControlMethod['type'], string> = {
      'pill': 'Birth Control Pill',
      'patch': 'Birth Control Patch',
      'ring': 'Vaginal Ring',
      'injection': 'Birth Control Shot',
      'implant': 'Contraceptive Implant',
      'iud': 'IUD',
      'condom': 'Condom',
      'other': 'Other Method'
    };
    return typeLabels[type];
  };

  const getFrequencyLabel = (frequency: BirthControlMethod['frequency']) => {
    const frequencyLabels: Record<BirthControlMethod['frequency'], string> = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Every 3 Months',
      'yearly': 'Yearly',
      'multi-year': 'Multi-Year',
      'as-needed': 'As Needed'
    };
    return frequencyLabels[frequency];
  };

  const renderSummary = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="medium" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-4">
          <p className="text-red-500">{error}</p>
          <p className="text-gray-600 mt-2">
            Track your birth control method, set reminders, and monitor your adherence.
          </p>
        </div>
      );
    }

    if (!activeMethod) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">
            No active birth control method found. Set up your birth control tracking to get started.
          </p>
        </div>
      );
    }

    const lastLog = logs.length > 0 ? logs[0] : null;

    return (
      <div className="py-2">
        <div className="mb-3">
          <h3 className="font-medium text-gray-700">{activeMethod.name}</h3>
          <p className="text-sm text-gray-500">
            {getMethodTypeLabel(activeMethod.type)} • {getFrequencyLabel(activeMethod.frequency)}
          </p>
        </div>
        
        {adherenceRate !== null && (
          <div className="flex items-center mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  adherenceRate >= 80 ? 'bg-green-500' : 
                  adherenceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`} 
                style={{ width: `${adherenceRate}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">{Math.round(adherenceRate)}%</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            {shouldTakeToday && (
              <div className="flex items-center text-sm text-blue-600">
                <span className="mr-1">Due today</span>
              </div>
            )}
            
            {lastLog && (
              <div className="text-xs text-gray-500">
                Last taken: {format(lastLog.date, 'MMM d, yyyy')}
              </div>
            )}
          </div>
          
          {shouldTakeToday && (
            <div className="flex space-x-2">
              <button 
                className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                onClick={() => setShowFullTracker(true)}
              >
                <CheckCircleIcon className="w-5 h-5" />
              </button>
              <button 
                className="p-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                onClick={() => setShowFullTracker(true)}
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-800">Birth Control</h2>
          </div>
        </div>

        {renderSummary()}

        <div className="text-center pt-4">
          <button
            onClick={() => setShowFullTracker(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Open Tracker
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </button>
        </div>
      </motion.div>

      {showFullTracker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <BirthControlTracker />
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowFullTracker(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 