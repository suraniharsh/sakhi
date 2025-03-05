import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, isToday, isBefore } from 'date-fns';
import { 
  CalendarIcon, 
  PlusIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  BellAlertIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { BirthControlService, BirthControlMethod, BirthControlLog } from '../../services/BirthControlService';
import { BirthControlMethodForm } from './BirthControlMethodForm';
import { BirthControlLogForm } from './BirthControlLogForm';
import { BirthControlStats } from './BirthControlStats';

export const BirthControlTracker: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeMethod, setActiveMethod] = useState<BirthControlMethod | null>(null);
  const [logs, setLogs] = useState<BirthControlLog[]>([]);
  const [showMethodForm, setShowMethodForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingMethod, setEditingMethod] = useState<BirthControlMethod | null>(null);
  const [editingLog, setEditingLog] = useState<BirthControlLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adherenceRate, setAdherenceRate] = useState<number>(100);
  const [shouldTakeToday, setShouldTakeToday] = useState<boolean>(false);
  const [recentLogs, setRecentLogs] = useState<BirthControlLog[]>([]);

  const birthControlService = new BirthControlService();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const method = await birthControlService.getActiveBirthControlMethod();
      setActiveMethod(method);

      if (method) {
        const methodLogs = await birthControlService.getBirthControlLogs(method.id);
        setLogs(methodLogs);
        
        // Calculate adherence rate
        const rate = birthControlService.getAdherenceRate(methodLogs);
        setAdherenceRate(rate);
        
        // Check if should take today
        const shouldTake = birthControlService.shouldTakeToday(method, methodLogs);
        setShouldTakeToday(shouldTake);
        
        // Get recent logs (last 7 days)
        const recent = methodLogs.filter(log => {
          const logDate = new Date(log.date);
          const sevenDaysAgo = addDays(new Date(), -7);
          return logDate >= sevenDaysAgo;
        }).sort((a, b) => b.date.getTime() - a.date.getTime());
        
        setRecentLogs(recent);
      }
    } catch (err) {
      console.error('Error loading birth control data:', err);
      setError('Failed to load birth control data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMethod = async (method: Omit<BirthControlMethod, 'id'>) => {
    setLoading(true);
    try {
      if (editingMethod) {
        await birthControlService.updateBirthControlMethod(editingMethod.id, method);
      } else {
        await birthControlService.addBirthControlMethod(method);
      }
      setShowMethodForm(false);
      setEditingMethod(null);
      await loadData();
    } catch (err) {
      console.error('Error saving birth control method:', err);
      setError('Failed to save birth control method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLog = async (log: Omit<BirthControlLog, 'id'>) => {
    setLoading(true);
    try {
      if (editingLog) {
        await birthControlService.updateBirthControlLog(editingLog.id, log);
      } else {
        await birthControlService.logBirthControl(log);
      }
      setShowLogForm(false);
      setEditingLog(null);
      await loadData();
    } catch (err) {
      console.error('Error saving birth control log:', err);
      setError('Failed to save birth control log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogTaken = async () => {
    if (!activeMethod) return;
    
    setLoading(true);
    try {
      await birthControlService.logBirthControl({
        methodId: activeMethod.id,
        date: new Date(),
        taken: true,
        skipped: false,
        takenTime: format(new Date(), 'HH:mm'),
      });
      await loadData();
    } catch (err) {
      console.error('Error logging birth control taken:', err);
      setError('Failed to log birth control. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogSkipped = async () => {
    if (!activeMethod) return;
    
    setLoading(true);
    try {
      await birthControlService.logBirthControl({
        methodId: activeMethod.id,
        date: new Date(),
        taken: false,
        skipped: true,
      });
      await loadData();
    } catch (err) {
      console.error('Error logging birth control skipped:', err);
      setError('Failed to log birth control. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMethod = () => {
    setEditingMethod(activeMethod);
    setShowMethodForm(true);
  };

  const getMethodTypeLabel = (type: BirthControlMethod['type']) => {
    const labels: Record<BirthControlMethod['type'], string> = {
      pill: 'Pill',
      patch: 'Patch',
      ring: 'Ring',
      injection: 'Injection',
      implant: 'Implant',
      iud: 'IUD',
      condom: 'Condom',
      other: 'Other'
    };
    return labels[type] || 'Unknown';
  };

  const getFrequencyLabel = (frequency: BirthControlMethod['frequency']) => {
    const labels: Record<BirthControlMethod['frequency'], string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Every 3 months',
      yearly: 'Yearly',
      'multi-year': 'Multi-year',
      'as-needed': 'As needed'
    };
    return labels[frequency] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-800">Birth Control Tracker</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStats(true)}
            className="text-gray-500 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            aria-label="View statistics"
          >
            <ChartBarIcon className="w-5 h-5" />
          </button>
          {activeMethod && (
            <button
              onClick={handleEditMethod}
              className="text-gray-500 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              aria-label="Edit method"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {!activeMethod ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No active birth control method set up.</p>
          <button
            onClick={() => setShowMethodForm(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Birth Control Method
          </button>
        </div>
      ) : (
        <div>
          <div className="bg-purple-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-purple-800">{activeMethod.name}</h3>
                <div className="flex items-center mt-1 text-sm text-purple-600">
                  <span className="mr-2">{getMethodTypeLabel(activeMethod.type)}</span>
                  <span>•</span>
                  <span className="ml-2">{getFrequencyLabel(activeMethod.frequency)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Started on {format(activeMethod.startDate, 'MMM d, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-600">Adherence</div>
                <div className={`text-lg font-bold ${adherenceRate >= 90 ? 'text-green-500' : adherenceRate >= 75 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {Math.round(adherenceRate)}%
                </div>
              </div>
            </div>
          </div>

          {shouldTakeToday && (
            <div className="bg-blue-50 rounded-xl p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <BellAlertIcon className="w-6 h-6 text-blue-500 mr-3" />
                <div>
                  <h3 className="font-medium text-blue-800">Reminder</h3>
                  <p className="text-sm text-blue-600">Time to take your birth control today!</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleLogTaken}
                  className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleLogSkipped}
                  className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-700">Recent Activity</h3>
              <button
                onClick={() => {
                  setEditingLog(null);
                  setShowLogForm(true);
                }}
                className="text-xs text-purple-600 hover:text-purple-800"
              >
                Add Log
              </button>
            </div>
            
            {recentLogs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No recent logs found.</p>
            ) : (
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      log.taken ? 'bg-green-50' : log.skipped ? 'bg-red-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      {log.taken ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                      ) : log.skipped ? (
                        <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                      ) : (
                        <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
                      )}
                      <div>
                        <div className="text-sm font-medium">
                          {log.taken ? 'Taken' : log.skipped ? 'Skipped' : 'Logged'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isToday(log.date) 
                            ? `Today at ${log.takenTime || 'unknown time'}`
                            : format(log.date, 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingLog(log);
                        setShowLogForm(true);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setEditingLog(null);
                setShowLogForm(true);
              }}
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
            >
              Log Activity
            </button>
            <button
              onClick={() => setShowStats(true)}
              className="w-full py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-sm font-medium"
            >
              View Statistics
            </button>
          </div>
        </div>
      )}

      {showMethodForm && (
        <BirthControlMethodForm
          initialMethod={editingMethod}
          onSave={handleSaveMethod}
          onCancel={() => {
            setShowMethodForm(false);
            setEditingMethod(null);
          }}
        />
      )}

      {showLogForm && activeMethod && (
        <BirthControlLogForm
          methodId={activeMethod.id}
          initialLog={editingLog}
          onSave={handleSaveLog}
          onCancel={() => {
            setShowLogForm(false);
            setEditingLog(null);
          }}
        />
      )}

      {showStats && activeMethod && logs.length > 0 && (
        <BirthControlStats
          method={activeMethod}
          logs={logs}
          onClose={() => setShowStats(false)}
        />
      )}
    </motion.div>
  );
}; 