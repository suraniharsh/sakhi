import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, ChartBarIcon, HeartIcon, MoonIcon, SunIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { format, differenceInDays, isAfter, isSameDay } from 'date-fns';
import { CycleCalendar } from '../components/cycle/CycleCalendar';
import { PeriodLogForm } from '../components/cycle/PeriodLogForm';
import { CycleCalculationService, type CycleDay, type PeriodLog } from '../services/CycleCalculationService';
import { CycleDataService } from '../services/CycleDataService';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

export const CyclePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showLogForm, setShowLogForm] = useState(false);
  const [logDate, setLogDate] = useState<Date | null>(null);
  const [cycleDays, setCycleDays] = useState<CycleDay[]>([]);
  const [cycleService] = useState(() => new CycleCalculationService());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const dataService = user ? new CycleDataService(user.uid) : null;

  const loadPeriodLogs = async () => {
    if (!dataService) {
      console.log('No data service available');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Fetching period logs...');
      const logs = await dataService.getPeriodLogs();
      console.log('Fetched logs:', logs);
      
      // Clear existing logs and add new ones
      cycleService.clearLogs();
      
      // Sort logs by date before adding
      const sortedLogs = logs.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
      console.log('Sorted logs:', sortedLogs);
      
      sortedLogs.forEach(log => {
        // Ensure dates are properly converted
        const periodLog: PeriodLog = {
          ...log,
          startDate: new Date(log.startDate),
          endDate: new Date(log.endDate)
        };
        console.log('Adding log:', periodLog);
        cycleService.addPeriodLog(periodLog);
      });

      // Update predictions
      const predictions = cycleService.predictNextCycle(new Date());
      console.log('Generated predictions:', predictions);
      setCycleDays(predictions);

      if (logs.length === 0) {
        console.log('No logs found');
        toast.error('No period logs found. Please add your first period log.');
      } else {
        // Only show success message on initial load
        if (cycleDays.length === 0) {
          console.log('Initial load complete');
          toast.success('Cycle data loaded successfully');
        }
      }
    } catch (error) {
      console.error('Error loading period logs:', error);
      toast.error('Failed to load your cycle data. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add auto-refresh for data
  useEffect(() => {
    console.log('User state changed:', user);
    if (user) {
      loadPeriodLogs();
      
      // Refresh data every 5 minutes
      const intervalId = setInterval(loadPeriodLogs, 5 * 60 * 1000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const handleLogSubmit = async (log: PeriodLog) => {
    if (!dataService) return;

    try {
      setIsSaving(true);
      
      // Validate dates
      if (log.endDate < log.startDate) {
        toast.error('End date cannot be before start date');
        return;
      }

      // Save to Firebase
      await dataService.savePeriodLog(log);
      
      // Update local state
      cycleService.addPeriodLog({
        ...log,
        startDate: new Date(log.startDate),
        endDate: new Date(log.endDate)
      });
      
      // Update predictions
      const predictions = cycleService.predictNextCycle(new Date());
      setCycleDays(predictions);
      
      // Close form and show success message
      setShowLogForm(false);
      setLogDate(null);
      toast.success('Period log saved successfully');

      // Reload data to ensure everything is in sync
      loadPeriodLogs();
    } catch (error) {
      console.error('Error saving period log:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save period log');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDateDoubleClick = (date: Date) => {
    setLogDate(date);
    setShowLogForm(true);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <p className="text-gray-500 text-lg">Please log in to view your cycle</p>
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

  const getNextPeriodDate = (): Date | null => {
    if (cycleDays.length === 0) return null;
    const today = new Date();
    const futurePeriods = cycleDays
      .filter(day => day.phase === 'period' && isAfter(day.date, today))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    return futurePeriods[0]?.date || null;
  };

  const getLastPeriodDate = (): Date | null => {
    if (cycleDays.length === 0) return null;
    const today = new Date();
    const pastPeriods = cycleDays
      .filter(day => day.phase === 'period' && !isAfter(day.date, today))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    return pastPeriods[0]?.date || null;
  };

  const getCurrentPhase = (): string => {
    const today = new Date();
    const currentDay = cycleDays.find(day => 
      isSameDay(day.date, today)
    );

    if (!currentDay) return 'Regular';
    return currentDay.phase.charAt(0).toUpperCase() + currentDay.phase.slice(1);
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase.toLowerCase()) {
      case 'period':
        return <MoonIcon className="w-6 h-6 text-pink-500" />;
      case 'fertile':
        return <SunIcon className="w-6 h-6 text-purple-500" />;
      case 'ovulation':
        return <HeartIcon className="w-6 h-6 text-purple-600" />;
      default:
        return <ChartBarIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getFertilityInfo = () => {
    const info = cycleService.getFertilityInfo(new Date());
    const nextFertileStart = info.nextFertileStart ? new Date(info.nextFertileStart) : null;
    const nextOvulation = info.nextOvulation ? new Date(info.nextOvulation) : null;

    return {
      isFertile: info.isFertile,
      isOvulation: info.isOvulation,
      nextFertileStart,
      nextOvulation
    };
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Not predicted';
    return format(date, 'dd/MM/yyyy');
  };

  const formatDateRange = (start: Date | null, end: Date | null): string => {
    if (!start || !end) return 'Not predicted';
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getDaysUntilNextPeriod = (): { days: number; message: string } => {
    const nextPeriod = getNextPeriodDate();
    if (!nextPeriod) return { days: 0, message: 'Not enough data' };

    const today = new Date();
    if (isSameDay(nextPeriod, today)) {
      return { days: 0, message: 'Period expected today' };
    }

    const days = differenceInDays(nextPeriod, today);
    return {
      days,
      message: days === 1 ? '1 day until next period' : `${days} days until next period`
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-800">
            Cycle Tracker
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLogForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Log Period</span>
          </motion.button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <CycleCalendar
                selectedDate={selectedDate}
                cycleDays={cycleDays}
                onDateChange={setSelectedDate}
                onMonthChange={(date) => setSelectedDate(date)}
                onDateDoubleClick={handleDateDoubleClick}
              />
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            {/* Current Phase and Countdown Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Current Phase Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Current Phase</h2>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                    {getPhaseIcon(getCurrentPhase())}
                  </div>
                  <p className="text-gray-500 text-sm">You are in your</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{getCurrentPhase()}</p>
                  <p className="text-pink-500 font-medium">Phase</p>
                </div>
              </motion.div>

              {/* Countdown Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Countdown</h2>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                    <CalendarDaysIcon className="w-6 h-6 text-pink-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-800 mb-1">
                    {getDaysUntilNextPeriod().days}
                  </p>
                  <p className="text-gray-500 text-sm">Days Until</p>
                  <p className="text-pink-500 font-medium">Next Period</p>
                </div>
              </motion.div>
            </div>

            {/* Cycle Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Cycle Summary</h2>
              <div className="space-y-4">
                <div className="bg-pink-50 rounded-lg p-4">
                  <p className="text-sm text-pink-600 font-medium">Last Period</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatDate(getLastPeriodDate())}
                  </p>
                </div>
                <div className="bg-pink-50/70 rounded-lg p-4">
                  <p className="text-sm text-pink-600 font-medium">Next Period</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatDate(getNextPeriodDate())}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Fertility Window Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <HeartIcon className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-semibold text-gray-800">Fertility Window</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Next Fertile Window</p>
                  <p className="text-lg font-medium text-gray-800">
                    {formatDate(getFertilityInfo().nextFertileStart)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Next Ovulation</p>
                  <p className="text-lg font-medium text-gray-800">
                    {formatDate(getFertilityInfo().nextOvulation)}
                  </p>
                </div>
                <div className="pt-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getFertilityInfo().isFertile ? 'bg-purple-500' : 'bg-gray-300'}`} />
                    <p className="text-sm text-gray-600">
                      {getFertilityInfo().isFertile ? 'Currently in fertile window' : 'Not in fertile window'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className={`w-3 h-3 rounded-full ${getFertilityInfo().isOvulation ? 'bg-purple-600' : 'bg-gray-300'}`} />
                    <p className="text-sm text-gray-600">
                      {getFertilityInfo().isOvulation ? 'Ovulation day' : 'Not ovulation day'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Tips Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
            >
              <h2 className="text-xl font-semibold mb-4">Quick Tips</h2>
              <div className="space-y-3">
                <p className="text-sm opacity-90">
                  • Track your period regularly for better predictions
                </p>
                <p className="text-sm opacity-90">
                  • Your fertile window is the best time to conceive
                </p>
                <p className="text-sm opacity-90">
                  • Ovulation day is when you're most fertile
                </p>
                <p className="text-sm opacity-90">
                  • Stay hydrated and maintain a healthy diet
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Period Log Form Modal */}
      <AnimatePresence>
        {showLogForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <PeriodLogForm
              onSubmit={handleLogSubmit}
              onCancel={() => {
                setShowLogForm(false);
                setLogDate(null);
              }}
              initialDate={logDate}
              isSubmitting={isSaving}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};