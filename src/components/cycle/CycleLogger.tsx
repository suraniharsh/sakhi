import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FlowIntensity, Symptom } from '../../types/cycle';
import { cycleService } from '../../services/cycleService';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface CycleLoggerProps {
  onLogComplete: () => void;
  onError: (message: string) => void;
}

export const CycleLogger: React.FC<CycleLoggerProps> = ({ onLogComplete, onError }) => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [flow, setFlow] = useState<FlowIntensity>(FlowIntensity.MEDIUM);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSymptomToggle = (symptom: Symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !startDate) return;

    setIsLoading(true);
    setError(null);

    try {
      const cycleId = await cycleService.logCycle(
        user.uid,
        startDate,
        flow,
        selectedSymptoms,
        notes
      );

      if (endDate) {
        await cycleService.endCycle(cycleId, endDate);
      }

      onLogComplete();
      // Reset form
      setStartDate(new Date());
      setEndDate(null);
      setFlow(FlowIntensity.MEDIUM);
      setSelectedSymptoms([]);
      setNotes('');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to log cycle');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Log Your Cycle</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxDate={new Date()}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            End Date (Optional)
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            minDate={startDate || undefined}
            maxDate={new Date()}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Flow Intensity
          </label>
          <select
            value={flow}
            onChange={e => setFlow(e.target.value as FlowIntensity)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {Object.values(FlowIntensity).map(intensity => (
              <option key={intensity} value={intensity}>
                {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Symptoms
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(Symptom).map(symptom => (
              <label
                key={symptom}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSymptoms.includes(symptom)}
                  onChange={() => handleSymptomToggle(symptom)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  {symptom.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
            placeholder="Add any additional notes..."
          />
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 px-4 rounded-md text-white font-medium ${
            isLoading
              ? 'bg-purple-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {isLoading ? <LoadingSpinner size={24} /> : 'Log Cycle'}
        </motion.button>
      </form>
    </motion.div>
  );
}; 