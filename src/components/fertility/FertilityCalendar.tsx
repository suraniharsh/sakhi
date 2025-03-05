import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DailyFertilityStatus, FertilityPhase, FertilityType } from '../../types/fertility';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface FertilityCalendarProps {
  dailyStatus: DailyFertilityStatus[];
  onExportPDF: () => Promise<void>;
  isLoading?: boolean;
}

export const FertilityCalendar: React.FC<FertilityCalendarProps> = ({
  dailyStatus,
  onExportPDF,
  isLoading = false
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Group daily status by date
  const statusByDate = new Map(
    dailyStatus.map(status => [status.date.toISOString().split('T')[0], status])
  );

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add padding days from previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift(prevDate);
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add padding days from next month
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const getPhaseColor = (phase: FertilityPhase) => {
    switch (phase) {
      case FertilityPhase.OVULATION:
        return 'bg-purple-500 text-white';
      case FertilityPhase.FOLLICULAR:
        return 'bg-pink-100';
      case FertilityPhase.LUTEAL:
        return 'bg-blue-100';
      default:
        return 'bg-gray-50';
    }
  };

  const getProbabilityIndicator = (probability: number) => {
    if (probability >= 0.3) return '🟣'; // High
    if (probability >= 0.2) return '🔵'; // Medium
    if (probability >= 0.1) return '⚪'; // Low
    return '';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Fertility Calendar
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExportPDF}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
        >
          Export PDF Report
        </motion.button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h3 className="text-lg font-medium">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {days.map((date, index) => {
          const dateKey = date.toISOString().split('T')[0];
          const status = statusByDate.get(dateKey);
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className={`
                relative p-2 min-h-[80px] rounded-md cursor-pointer
                ${isCurrentMonth ? '' : 'opacity-50'}
                ${status ? getPhaseColor(status.phase) : 'bg-gray-50'}
              `}
              onClick={() => setSelectedDate(date)}
            >
              <div className="text-sm font-medium">
                {date.getDate()}
              </div>
              {status && (
                <div className="mt-1 text-xs">
                  <div>{getProbabilityIndicator(status.probability)}</div>
                  {status.notes.map((note, i) => (
                    <div key={i} className="truncate text-gray-600">
                      {note}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center">
          <span className="w-4 h-4 bg-purple-500 rounded-full mr-2" />
          <span>Ovulation Day</span>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 bg-pink-100 rounded-full mr-2" />
          <span>Follicular Phase</span>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 bg-blue-100 rounded-full mr-2" />
          <span>Luteal Phase</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Fertility: 🟣 High</span>
          <span>🔵 Medium</span>
          <span>⚪ Low</span>
        </div>
      </div>

      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg"
        >
          <h4 className="font-medium mb-2">
            {selectedDate.toLocaleDateString()}
          </h4>
          {statusByDate.get(selectedDate.toISOString().split('T')[0])?.notes.map((note, i) => (
            <p key={i} className="text-sm text-gray-600">{note}</p>
          ))}
        </motion.div>
      )}
    </div>
  );
}; 