import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, PlusIcon, CalendarIcon, HeartIcon, MoonIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format, addDays } from 'date-fns';
import { CycleCalculationService } from '../services/CycleCalculationService';
import { CycleDataService } from '../services/CycleDataService';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { notificationService } from '../services/NotificationService';

interface Reminder {
  id: string;
  type: 'period' | 'fertility' | 'ovulation';
  title: string;
  description: string;
  date: Date;
  enabled: boolean;
  daysInAdvance: number;
}

interface ReminderSetting {
  type: 'period' | 'fertility' | 'ovulation';
  enabled: boolean;
  daysInAdvance: number;
}

interface NotificationPreferences {
  periodNotifications: boolean;
  fertilityNotifications: boolean;
  ovulationNotifications: boolean;
  daysInAdvance: {
    period: number;
    fertility: number;
    ovulation: number;
  };
}

const OptionStyles = {
  option: `
    px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer
    flex items-center space-x-2 border-b border-gray-100 last:border-0
    hover:bg-pink-50 hover:text-pink-600
  `,
  selected: `
    bg-pink-50 text-pink-600
  `,
};

export const RemindersPage: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [settings, setSettings] = useState<ReminderSetting[]>([
    { type: 'period', enabled: true, daysInAdvance: 2 },
    { type: 'fertility', enabled: true, daysInAdvance: 1 },
    { type: 'ovulation', enabled: true, daysInAdvance: 1 }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [cycleService] = useState(() => new CycleCalculationService());
  const { user } = useAuth();
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    if (user) {
      loadReminders();
      loadNotificationPreferences();
    }
  }, [user]);

  const loadReminders = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const dataService = new CycleDataService(user.uid);
      const logs = await dataService.getPeriodLogs();
      
      // Clear existing logs and add new ones
      cycleService.clearLogs();
      logs.forEach(log => cycleService.addPeriodLog(log));

      // Generate predictions
      const predictions = cycleService.predictNextCycle();
      const fertilityInfo = cycleService.getFertilityInfo();

      // Create reminders based on predictions
      const newReminders: Reminder[] = [];

      // Next period reminder
      const nextPeriod = predictions.find(day => 
        day.phase === 'period' && day.date > new Date()
      );
      if (nextPeriod) {
        newReminders.push({
          id: 'next-period',
          type: 'period',
          title: 'Period Starting Soon',
          description: `Your next period is expected to start on ${format(nextPeriod.date, 'MMMM d, yyyy')}`,
          date: nextPeriod.date,
          enabled: true,
          daysInAdvance: 2
        });
      }

      // Fertility window reminder
      if (fertilityInfo.nextFertileStart) {
        newReminders.push({
          id: 'fertility-window',
          type: 'fertility',
          title: 'Fertility Window Starting',
          description: `Your fertile window begins on ${format(fertilityInfo.nextFertileStart, 'MMMM d, yyyy')}`,
          date: fertilityInfo.nextFertileStart,
          enabled: true,
          daysInAdvance: 1
        });
      }

      // Ovulation reminder
      if (fertilityInfo.nextOvulation) {
        newReminders.push({
          id: 'ovulation-day',
          type: 'ovulation',
          title: 'Ovulation Day',
          description: `Your ovulation day is expected on ${format(fertilityInfo.nextOvulation, 'MMMM d, yyyy')}`,
          date: fertilityInfo.nextOvulation,
          enabled: true,
          daysInAdvance: 1
        });
      }

      setReminders(newReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
      toast.error('Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotificationPreferences = async () => {
    if (!user) return;
    try {
      const prefs = await notificationService.getPreferences(user.uid);
      setNotificationPrefs(prefs);
      
      // Update settings based on preferences
      setSettings([
        { 
          type: 'period', 
          enabled: prefs.periodNotifications, 
          daysInAdvance: prefs.daysInAdvance.period 
        },
        { 
          type: 'fertility', 
          enabled: prefs.fertilityNotifications, 
          daysInAdvance: prefs.daysInAdvance.fertility 
        },
        { 
          type: 'ovulation', 
          enabled: prefs.ovulationNotifications, 
          daysInAdvance: prefs.daysInAdvance.ovulation 
        }
      ]);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      toast.error('Failed to load notification preferences');
    }
  };

  const toggleReminderSetting = async (type: 'period' | 'fertility' | 'ovulation') => {
    if (!user || !notificationPrefs) return;

    try {
      const newPrefs = { ...notificationPrefs };
      switch (type) {
        case 'period':
          newPrefs.periodNotifications = !newPrefs.periodNotifications;
          break;
        case 'fertility':
          newPrefs.fertilityNotifications = !newPrefs.fertilityNotifications;
          break;
        case 'ovulation':
          newPrefs.ovulationNotifications = !newPrefs.ovulationNotifications;
          break;
      }

      await notificationService.updatePreferences(user.uid, newPrefs);
      setNotificationPrefs(newPrefs);

      // Update local state
      setSettings(prevSettings =>
        prevSettings.map(setting =>
          setting.type === type
            ? { ...setting, enabled: !setting.enabled }
            : setting
        )
      );

      // Update reminders
      setReminders(prevReminders =>
        prevReminders.map(reminder =>
          reminder.type === type
            ? { ...reminder, enabled: !reminder.enabled }
            : reminder
        )
      );

      // Schedule or cancel notifications based on new settings
      const reminder = reminders.find(r => r.type === type);
      if (reminder && reminder.enabled) {
        await notificationService.scheduleNotification(
          user.uid,
          type,
          reminder.date,
          reminder.daysInAdvance
        );
      }

      toast.success('Notification settings updated');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    }
  };

  const updateDaysInAdvance = async (type: 'period' | 'fertility' | 'ovulation', days: number) => {
    if (!user || !notificationPrefs) return;

    try {
      const newPrefs = { 
        ...notificationPrefs,
        daysInAdvance: {
          ...notificationPrefs.daysInAdvance,
          [type]: days
        }
      };

      await notificationService.updatePreferences(user.uid, newPrefs);
      setNotificationPrefs(newPrefs);

      // Update local state
      setSettings(prevSettings =>
        prevSettings.map(setting =>
          setting.type === type
            ? { ...setting, daysInAdvance: days }
            : setting
        )
      );

      // Update reminders
      setReminders(prevReminders =>
        prevReminders.map(reminder =>
          reminder.type === type
            ? { ...reminder, daysInAdvance: days }
            : reminder
        )
      );

      // Reschedule notification with new timing
      const reminder = reminders.find(r => r.type === type);
      if (reminder && reminder.enabled) {
        await notificationService.scheduleNotification(
          user.uid,
          type,
          reminder.date,
          days
        );
      }

      toast.success('Notification timing updated');
    } catch (error) {
      console.error('Error updating notification timing:', error);
      toast.error('Failed to update notification timing');
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'period':
        return <MoonIcon className="w-6 h-6" />;
      case 'fertility':
        return <HeartIcon className="w-6 h-6" />;
      case 'ovulation':
        return <CalendarIcon className="w-6 h-6" />;
      default:
        return <BellIcon className="w-6 h-6" />;
    }
  };

  const getReminderColor = (type: string) => {
    switch (type) {
      case 'period':
        return 'from-pink-500 to-pink-600';
      case 'fertility':
        return 'from-purple-500 to-purple-600';
      case 'ovulation':
        return 'from-indigo-500 to-indigo-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <p className="text-gray-500 text-lg">Please log in to manage reminders</p>
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-800">
            Reminders
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Custom Reminder</span>
          </motion.button>
        </div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Notification Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {settings.map(setting => (
              <div
                key={setting.type}
                className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getIconForType(setting.type)}
                    <h3 className="font-semibold text-gray-800 capitalize">
                      {setting.type} Alerts
                    </h3>
                  </div>
                  <button
                    onClick={() => toggleReminderSetting(setting.type)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                      setting.enabled ? 'bg-pink-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        setting.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 font-medium">Notify me</label>
                  <div className="relative group">
                    <select
                      value={setting.daysInAdvance}
                      onChange={(e) => updateDaysInAdvance(setting.type, parseInt(e.target.value))}
                      className="w-full appearance-none bg-white rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 font-medium 
                        hover:border-pink-400 hover:bg-pink-50/30
                        focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:ring-opacity-50 
                        focus:outline-none transition-all duration-200
                        [&>option]:bg-white [&>option]:text-gray-800
                        [&>option]:py-2 [&>option]:px-4
                        [&>option:hover]:bg-pink-50 [&>option:hover]:text-pink-600
                        [&>option:checked]:bg-pink-50 [&>option:checked]:text-pink-600"
                    >
                      <option value={1} className={`${OptionStyles.option} ${setting.daysInAdvance === 1 ? OptionStyles.selected : ''}`}>
                        1 day before
                      </option>
                      <option value={2} className={`${OptionStyles.option} ${setting.daysInAdvance === 2 ? OptionStyles.selected : ''}`}>
                        2 days before
                      </option>
                      <option value={3} className={`${OptionStyles.option} ${setting.daysInAdvance === 3 ? OptionStyles.selected : ''}`}>
                        3 days before
                      </option>
                      <option value={5} className={`${OptionStyles.option} ${setting.daysInAdvance === 5 ? OptionStyles.selected : ''}`}>
                        5 days before
                      </option>
                      <option value={7} className={`${OptionStyles.option} ${setting.daysInAdvance === 7 ? OptionStyles.selected : ''}`}>
                        1 week before
                      </option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg 
                        className="w-5 h-5 text-gray-400 transition-colors duration-200 group-hover:text-pink-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Reminders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Upcoming Reminders</h2>
          <div className="space-y-4">
            {reminders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming reminders</p>
            ) : (
              reminders.map(reminder => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`bg-gradient-to-r ${getReminderColor(reminder.type)} text-white rounded-2xl p-6`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getIconForType(reminder.type)}
                      <div>
                        <h3 className="font-semibold">{reminder.title}</h3>
                        <p className="text-sm opacity-90">{reminder.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleReminderSetting(reminder.type)}
                      className="text-white opacity-80 hover:opacity-100"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm opacity-90">
                    <span>
                      Notification: {reminder.daysInAdvance} day{reminder.daysInAdvance > 1 ? 's' : ''} before
                    </span>
                    <span>
                      {format(addDays(reminder.date, -reminder.daysInAdvance), 'MMMM d, yyyy')}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 