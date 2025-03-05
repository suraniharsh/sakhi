import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { addDays, format, parse } from 'date-fns';
import type { PeriodLog } from '../../services/CycleCalculationService';

interface PeriodLogFormProps {
  onSubmit: (log: PeriodLog) => void;
  onCancel: () => void;
  initialDate?: Date | null;
  isSubmitting?: boolean;
}

export const PeriodLogForm: React.FC<PeriodLogFormProps> = ({
  onSubmit,
  onCancel,
  initialDate = null,
  isSubmitting = false
}) => {
  const calculateEndDate = (start: Date) => addDays(start, 6);
  
  const [startDate, setStartDate] = useState(initialDate || new Date());
  const [endDate, setEndDate] = useState(calculateEndDate(initialDate || new Date()));
  const [flow, setFlow] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [isCustomEndDate, setIsCustomEndDate] = useState(false);

  useEffect(() => {
    if (initialDate) {
      setStartDate(initialDate);
      setEndDate(calculateEndDate(initialDate));
      setIsCustomEndDate(false);
    }
  }, [initialDate]);

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    if (!isCustomEndDate) {
      setEndDate(calculateEndDate(date));
    }
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
    setIsCustomEndDate(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    onSubmit({
      startDate,
      endDate,
      flow
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Log Period</h2>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          <XMarkIcon className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate.toISOString().split('T')[0]}
                onChange={(e) => handleStartDateChange(new Date(e.target.value))}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50"
              />
              <div className="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none">
                <span className="text-sm text-gray-500">
                  {format(startDate, 'dd/MM/yyyy')}
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomEndDate(false);
                  setEndDate(calculateEndDate(startDate));
                }}
                disabled={isSubmitting}
                className={`text-xs ${!isCustomEndDate ? 'text-pink-600 font-medium' : 'text-gray-500 hover:text-pink-600'}`}
              >
                Auto (6 days)
              </button>
            </div>
            <div className="relative">
              <input
                type="date"
                value={endDate.toISOString().split('T')[0]}
                onChange={(e) => handleEndDateChange(new Date(e.target.value))}
                min={startDate.toISOString().split('T')[0]}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50"
              />
              <div className="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none">
                <span className="text-sm text-gray-500">
                  {format(endDate, 'dd/MM/yyyy')}
                </span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flow Intensity
            </label>
            <div className="flex space-x-4">
              {(['light', 'medium', 'heavy'] as const).map((intensity) => (
                <button
                  key={intensity}
                  type="button"
                  onClick={() => setFlow(intensity)}
                  disabled={isSubmitting}
                  className={`
                    flex-1 py-2 px-4 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${
                      flow === intensity
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                    disabled:opacity-50
                  `}
                >
                  {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 
              text-white rounded-lg hover:shadow-lg transition-all duration-200
              disabled:opacity-50 relative
            `}
          >
            {isSubmitting ? (
              <>
                <span className="opacity-0">Save</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}; 