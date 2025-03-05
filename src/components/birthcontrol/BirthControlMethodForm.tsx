import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { BirthControlMethod } from '../../services/BirthControlService';

interface BirthControlMethodFormProps {
  initialMethod: BirthControlMethod | null;
  onSave: (method: Omit<BirthControlMethod, 'id'>) => void;
  onCancel: () => void;
}

export const BirthControlMethodForm: React.FC<BirthControlMethodFormProps> = ({
  initialMethod,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<BirthControlMethod['type']>('pill');
  const [frequency, setFrequency] = useState<BirthControlMethod['frequency']>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderDays, setReminderDays] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialMethod) {
      setName(initialMethod.name);
      setType(initialMethod.type);
      setFrequency(initialMethod.frequency);
      setStartDate(format(initialMethod.startDate, 'yyyy-MM-dd'));
      if (initialMethod.endDate) {
        setEndDate(format(initialMethod.endDate, 'yyyy-MM-dd'));
      }
      if (initialMethod.reminderTime) {
        setReminderTime(initialMethod.reminderTime);
      }
      if (initialMethod.reminderDays) {
        setReminderDays(initialMethod.reminderDays);
      }
      if (initialMethod.notes) {
        setNotes(initialMethod.notes);
      }
      setActive(initialMethod.active);
    }
  }, [initialMethod]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (frequency === 'weekly' && reminderDays.length === 0) {
      newErrors.reminderDays = 'Please select at least one day for weekly reminders';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const methodData: Omit<BirthControlMethod, 'id'> = {
      name,
      type,
      frequency,
      startDate: new Date(startDate),
      active,
    };

    if (endDate) {
      methodData.endDate = new Date(endDate);
    }

    if (reminderTime) {
      methodData.reminderTime = reminderTime;
    }

    if (frequency === 'weekly' && reminderDays.length > 0) {
      methodData.reminderDays = reminderDays;
    }

    if (notes.trim()) {
      methodData.notes = notes.trim();
    }

    onSave(methodData);
  };

  const handleReminderDayToggle = (day: string) => {
    if (reminderDays.includes(day)) {
      setReminderDays(reminderDays.filter(d => d !== day));
    } else {
      setReminderDays([...reminderDays, day]);
    }
  };

  const weekdays = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialMethod ? 'Edit Birth Control Method' : 'Add Birth Control Method'}
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Method Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., My Birth Control Pill"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as BirthControlMethod['type'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="pill">Pill</option>
                <option value="patch">Patch</option>
                <option value="ring">Ring</option>
                <option value="injection">Injection</option>
                <option value="implant">Implant</option>
                <option value="iud">IUD</option>
                <option value="condom">Condom</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as BirthControlMethod['frequency'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Every 3 months</option>
                <option value="yearly">Yearly</option>
                <option value="multi-year">Multi-year</option>
                <option value="as-needed">As needed</option>
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-1">
                Reminder Time
              </label>
              <input
                type="time"
                id="reminderTime"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {frequency === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {weekdays.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleReminderDayToggle(day.value)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        reminderDays.includes(day.value)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {errors.reminderDays && (
                  <p className="mt-1 text-sm text-red-500">{errors.reminderDays}</p>
                )}
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

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 text-purple-600 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                Active (currently using this method)
              </label>
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
              {initialMethod ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 