import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '../ui/Tooltip';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { CycleDay } from '../../services/CycleCalculationService';

interface CycleCalendarProps {
  selectedDate: Date;
  cycleDays: CycleDay[];
  onDateChange: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  onDateDoubleClick?: (date: Date) => void;
}

export const CycleCalendar: React.FC<CycleCalendarProps> = ({
  selectedDate,
  cycleDays,
  onDateChange,
  onMonthChange,
  onDateDoubleClick
}) => {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => {
    onMonthChange(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(selectedDate, 1));
  };

  const getCycleDay = (date: Date): CycleDay | undefined => {
    return cycleDays.find(day => isSameDay(day.date, date));
  };

  const getDayStyle = (date: Date): string => {
    if (!isSameMonth(date, monthStart)) {
      return 'text-gray-400';
    }

    const cycleDay = getCycleDay(date);
    if (!cycleDay) {
      return 'text-gray-700 hover:bg-gray-100';
    }

    switch (cycleDay.phase) {
      case 'period':
        return `bg-gradient-to-br ${
          cycleDay.intensity === 'heavy'
            ? 'from-pink-500 to-pink-600'
            : cycleDay.intensity === 'medium'
            ? 'from-pink-400 to-pink-500'
            : 'from-pink-300 to-pink-400'
        } text-white`;
      case 'fertile':
        return 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800';
      case 'ovulation':
        return 'bg-gradient-to-br from-purple-400 to-purple-500 text-white';
      default:
        return 'text-gray-700 hover:bg-gray-100';
    }
  };

  const getTooltipContent = (date: Date) => {
    const cycleDay = getCycleDay(date);
    if (!cycleDay) return '';

    switch (cycleDay.phase) {
      case 'period':
        return `Period day (${cycleDay.intensity || 'normal'} flow)`;
      case 'fertile':
        return 'Fertile window';
      case 'ovulation':
        return 'Ovulation day';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 font-sans border border-gray-100">
      <motion.div 
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-display font-semibold text-gray-800 tracking-tight">
          {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </h2>
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgb(253 242 248)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevMonth}
            className="p-2.5 rounded-full transition-all duration-300 hover:shadow-md"
          >
            <ChevronLeftIcon className="w-5 h-5 text-pink-500" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgb(253 242 248)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextMonth}
            className="p-2.5 rounded-full transition-all duration-300 hover:shadow-md"
          >
            <ChevronRightIcon className="w-5 h-5 text-pink-500" />
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-7 gap-6 mb-6">
        {DAYS.map(day => (
          <motion.div 
            key={day} 
            className="text-center text-sm font-medium text-gray-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {day}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-4">
        {daysInMonth.map((date, index) => (
          <motion.div
            key={date.toISOString()}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            className="aspect-square relative"
          >
            {date && (
              <Tooltip content={getTooltipContent(date)}>
                <motion.button
                  whileHover={{ scale: 1.15, translateY: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDateChange(date)}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onDoubleClick={() => onDateDoubleClick?.(date)}
                  className={`
                    w-full h-full flex items-center justify-center 
                    rounded-full text-base font-medium
                    transition-all duration-300 ease-in-out
                    ${getDayStyle(date)}
                    ${isSameDay(date, selectedDate) ? 'ring-4 ring-pink-500 ring-opacity-70 border-2 border-pink-500 shadow-lg shadow-pink-200/50' : ''}
                    ${hoveredDate && isSameDay(date, hoveredDate) ? 'shadow-xl scale-105' : ''}
                    hover:shadow-xl min-w-[40px] min-h-[40px]
                  `}
                >
                  <span className={`
                    relative z-20 flex items-center justify-center
                    w-8 h-8 rounded-full
                    ${getCycleDay(date) ? 'text-gray-800 font-bold' : 'text-gray-600'}
                    ${isSameDay(date, selectedDate) ? 'font-bold' : ''}
                    transition-all duration-300
                  `}>
                    {format(date, 'd')}
                  </span>
                </motion.button>
              </Tooltip>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="mt-8 grid grid-cols-3 gap-6 text-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <div className="flex items-center group cursor-help">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 
                         border-2 border-pink-300/50 ring-3 ring-pink-200 ring-opacity-50 
                         shadow-md shadow-pink-200/30 mr-3 
                         group-hover:scale-110 transition-transform duration-300" />
          <span className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">Period</span>
        </div>
        <div className="flex items-center group cursor-help">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 
                         border-2 border-purple-300/50 ring-2 ring-purple-200 ring-opacity-40 
                         shadow-md shadow-purple-100/30 mr-3 
                         group-hover:scale-110 transition-transform duration-300" />
          <span className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">Fertile Window</span>
        </div>
        <div className="flex items-center group cursor-help">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 
                         border-2 border-purple-400/50 ring-4 ring-purple-300 ring-opacity-50 
                         shadow-md shadow-purple-200/30 mr-3 
                         group-hover:scale-110 transition-transform duration-300" />
          <span className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">Ovulation</span>
        </div>
      </motion.div>
    </div>
  );
}; 