import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths } from 'date-fns';
import { BirthControlMethod, BirthControlLog } from '../../services/BirthControlService';

interface BirthControlStatsProps {
  method: BirthControlMethod;
  logs: BirthControlLog[];
  onClose: () => void;
}

export const BirthControlStats: React.FC<BirthControlStatsProps> = ({
  method,
  logs,
  onClose,
}) => {
  const [adherenceRate, setAdherenceRate] = useState<number>(0);
  const [missedDoses, setMissedDoses] = useState<number>(0);
  const [consecutiveDays, setConsecutiveDays] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [monthlyCalendar, setMonthlyCalendar] = useState<Array<{ date: Date; status: 'taken' | 'skipped' | 'none' | 'future' }>>([]);

  useEffect(() => {
    calculateStats();
    generateMonthlyCalendar();
  }, [logs, selectedMonth]);

  const calculateStats = () => {
    // Calculate adherence rate
    if (logs.length === 0) {
      setAdherenceRate(100);
      setMissedDoses(0);
      setConsecutiveDays(0);
      return;
    }

    const takenCount = logs.filter(log => log.taken).length;
    const adherence = (takenCount / logs.length) * 100;
    setAdherenceRate(adherence);

    // Calculate missed doses
    const missed = logs.filter(log => !log.taken && log.skipped).length;
    setMissedDoses(missed);

    // Calculate consecutive days
    const sortedLogs = [...logs].sort((a, b) => b.date.getTime() - a.date.getTime());
    let consecutive = 0;
    
    for (let i = 0; i < sortedLogs.length; i++) {
      if (sortedLogs[i].taken) {
        consecutive++;
        
        // Check if the next log is consecutive
        if (i < sortedLogs.length - 1) {
          const currentDate = new Date(sortedLogs[i].date);
          const nextDate = new Date(sortedLogs[i + 1].date);
          const dayDiff = differenceInDays(currentDate, nextDate);
          
          if (dayDiff !== 1) {
            break;
          }
        }
      } else {
        break;
      }
    }
    
    setConsecutiveDays(consecutive);
  };

  const generateMonthlyCalendar = () => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const today = new Date();
    
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const calendarDays = days.map(date => {
      // Find log for this day
      const log = logs.find(l => isSameDay(new Date(l.date), date));
      
      // Determine status
      let status: 'taken' | 'skipped' | 'none' | 'future' = 'none';
      
      if (date > today) {
        status = 'future';
      } else if (log) {
        status = log.taken ? 'taken' : log.skipped ? 'skipped' : 'none';
      }
      
      return { date, status };
    });
    
    setMonthlyCalendar(calendarDays);
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Don't allow going beyond current month
    if (nextMonth <= new Date()) {
      setSelectedMonth(nextMonth);
    }
  };

  const getStatusColor = (status: 'taken' | 'skipped' | 'none' | 'future') => {
    switch (status) {
      case 'taken':
        return 'bg-green-500 text-white';
      case 'skipped':
        return 'bg-red-500 text-white';
      case 'future':
        return 'bg-gray-200 text-gray-400';
      default:
        return 'bg-gray-100 text-gray-500';
    }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Birth Control Statistics</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-purple-50 rounded-xl p-4">
            <h3 className="font-medium text-purple-800">{method.name}</h3>
            <div className="flex items-center mt-1 text-sm text-purple-600">
              <span className="mr-2">{getMethodTypeLabel(method.type)}</span>
              <span>•</span>
              <span className="ml-2">{getFrequencyLabel(method.frequency)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Started on {format(method.startDate, 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-sm text-gray-500">Adherence</div>
            <div className={`text-xl font-bold ${
              adherenceRate >= 90 ? 'text-green-500' : 
              adherenceRate >= 75 ? 'text-yellow-500' : 
              'text-red-500'
            }`}>
              {Math.round(adherenceRate)}%
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-sm text-gray-500">Missed</div>
            <div className="text-xl font-bold text-red-500">{missedDoses}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-sm text-gray-500">Streak</div>
            <div className="text-xl font-bold text-blue-500">{consecutiveDays} days</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-700">Monthly View</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousMonth}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                &lt;
              </button>
              <span className="text-sm font-medium">
                {format(selectedMonth, 'MMMM yyyy')}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                &gt;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={index} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
            
            {/* Fill in empty spaces for first week */}
            {Array.from({ length: new Date(monthlyCalendar[0]?.date || selectedMonth).getDay() }).map((_, index) => (
              <div key={`empty-start-${index}`} className="h-8"></div>
            ))}
            
            {monthlyCalendar.map((day, index) => (
              <div
                key={index}
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs ${getStatusColor(day.status)}`}
                title={`${format(day.date, 'MMM d, yyyy')}: ${day.status}`}
              >
                {format(day.date, 'd')}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span>Taken</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span>Skipped</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-100 mr-1"></div>
            <span>No Record</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 