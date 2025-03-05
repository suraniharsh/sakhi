import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { BirthControlLog } from '../../services/BirthControlService';

interface BirthControlLogFormProps {
  methodId: string;
  initialLog: BirthControlLog | null;
  onSave: (log: Omit<BirthControlLog, 'id'>) => void;
  onCancel: () => void;
}

export const BirthControlLogForm: React.FC<BirthControlLogFormProps> = ({
  methodId,
  initialLog,
  onSave,
  onCancel,
}) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [taken, setTaken] = useState(true);
  const [skipped, setSkipped] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialLog) {
      setDate(format(initialLog.date, 'yyyy-MM-dd'));
      setTaken(initialLog.taken);
      setSkipped(initialLog.skipped);
      
      if (initialLog.takenTime) {
        setTime(initialLog.takenTime);
      }
      
      if (initialLog.notes) {
        setNotes(initialLog.notes);
      }
    }
  }, [initialLog]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!date) {
      newErrors.date = 'Date is required';
    }

    if (taken && !time) {
      newErrors.time = 'Time is required when marked as taken';
    }

    if (taken && skipped) {
      newErrors.status = 'Birth control cannot be both taken and skipped';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const logData: Omit<BirthControlLog, 'id'> = {
      methodId,
      date: new Date(date),
      taken,
      skipped,
    };

    if (taken && time) {
      logData.takenTime = time;
    }

    if (notes.trim()) {
      logData.notes = notes.trim();
    }

    onSave(logData);
  };

  const handleStatusChange = (status: 'taken' | 'skipped' | 'none') => {
    if (status === 'taken') {
      setTaken(true);
      setSkipped(false);
    } else if (status === 'skipped') {
      setTaken(false);
      setSkipped(true);
    } else {
      setTaken(false);
      setSkipped(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialLog ? 'Edit Log' : 'Add Birth Control Log'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => handleStatusChange('taken')}
                  className={`flex-1 py-2 px-3 rounded-lg ${
                    taken
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  Taken
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('skipped')}
                  className={`flex-1 py-2 px-3 rounded-lg ${
                    skipped
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  Skipped
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('none')}
                  className={`flex-1 py-2 px-3 rounded-lg ${
                    !taken && !skipped
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  Other
                </button>
              </div>
              {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
            </div>

            {taken && (
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Taken
                </label>
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time}</p>}
              </div>
            )}

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Add any additional notes here..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {initialLog ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 