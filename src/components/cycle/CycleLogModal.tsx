import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CycleDay } from '../../hooks/useCycleData';

interface CycleLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CycleDay) => Promise<void>;
  defaultDate?: Date;
}

export const CycleLogModal: React.FC<CycleLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultDate = new Date(),
}) => {
  const [date, setDate] = useState(defaultDate);
  const [type, setType] = useState<CycleDay['type']>('period');
  const [intensity, setIntensity] = useState<CycleDay['intensity']>('medium');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave({
        date,
        type,
        ...(type === 'period' ? { intensity } : {})
      });
      onClose();
    } catch (error) {
      console.error('Error saving cycle data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-display font-semibold text-gray-800 mb-6">
              Log Cycle Data
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={date.toISOString().split('T')[0]}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['period', 'fertile', 'ovulation'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`
                        py-2 px-4 rounded-lg text-sm font-medium
                        transition-all duration-200 transform hover:scale-105
                        ${type === t
                          ? 'bg-pink-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {type === 'period' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flow Intensity
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['light', 'medium', 'heavy'] as const).map((i) => (
                      <button
                        key={i}
                        onClick={() => setIntensity(i)}
                        className={`
                          py-2 px-4 rounded-lg text-sm font-medium
                          transition-all duration-200 transform hover:scale-105
                          ${intensity === i
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        {i.charAt(0).toUpperCase() + i.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 px-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`
                    flex-1 py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-500
                    text-white rounded-lg transform transition-all duration-200
                    ${isSaving ? 'opacity-75 cursor-not-allowed' : 'hover:from-pink-600 hover:to-purple-600 hover:scale-105'}
                  `}
                >
                  {isSaving ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </div>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}; 