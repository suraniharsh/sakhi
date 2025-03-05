import React, { useState, useEffect } from 'react';
import { Symptom, Mood, PhysicalStats } from '../../types/symptoms';
import { SymptomService } from '../../services/symptomService';
import { motion } from 'framer-motion';
import debounce from 'lodash/debounce';

interface SymptomLoggerProps {
  userId: string;
  date: Date;
  symptoms: Symptom[];
  moods: Mood[];
  onSave: () => void;
}

export const SymptomLogger: React.FC<SymptomLoggerProps> = ({
  userId,
  date,
  symptoms: masterSymptoms,
  moods: masterMoods,
  onSave
}) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [physicalStats, setPhysicalStats] = useState<PhysicalStats>({});
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Debounced save function
  const debouncedSave = debounce(async () => {
    setIsSaving(true);
    try {
      await SymptomService.addSymptomLog(userId, {
        userId,
        symptoms: selectedSymptoms,
        moods: selectedMoods,
        physicalStats,
        notes
      });
      onSave();
    } catch (error) {
      console.error('Error saving symptom log:', error);
    } finally {
      setIsSaving(false);
    }
  }, 1000);

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, []);

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
    debouncedSave();
  };

  const handleMoodToggle = (moodId: string) => {
    setSelectedMoods(prev =>
      prev.includes(moodId)
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    );
    debouncedSave();
  };

  const handlePhysicalStatsChange = (key: keyof PhysicalStats, value: string) => {
    setPhysicalStats(prev => ({
      ...prev,
      [key]: value === '' ? undefined : key === 'bloodPressure' ? value : Number(value)
    }));
    debouncedSave();
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(event.target.value);
    debouncedSave();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Log Symptoms</h2>
        {isSaving && (
          <span className="text-sm text-gray-500">Saving...</span>
        )}
      </div>

      {/* Symptoms */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-3">Symptoms</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {masterSymptoms.map((symptom) => (
            <motion.button
              key={symptom.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSymptomToggle(symptom.id)}
              className={`p-3 rounded-md text-left transition-colors ${
                selectedSymptoms.includes(symptom.id)
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <p className="font-medium">{symptom.name}</p>
              <p className="text-sm opacity-75">Severity: {symptom.severity}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Moods */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-3">Moods</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {masterMoods.map((mood) => (
            <motion.button
              key={mood.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleMoodToggle(mood.id)}
              className={`p-3 rounded-md text-left transition-colors ${
                selectedMoods.includes(mood.id)
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <p className="font-medium">{mood.name}</p>
              <p className="text-sm opacity-75">Intensity: {mood.intensity}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Physical Stats */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-3">Physical Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Temperature (°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={physicalStats.temperature || ''}
              onChange={(e) => handlePhysicalStatsChange('temperature', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              placeholder="36.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={physicalStats.weight || ''}
              onChange={(e) => handlePhysicalStatsChange('weight', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              placeholder="60.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Blood Pressure
            </label>
            <input
              type="text"
              value={physicalStats.bloodPressure || ''}
              onChange={(e) => handlePhysicalStatsChange('bloodPressure', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              placeholder="120/80"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-3">Notes</h3>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          className="w-full h-32 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          placeholder="Add any additional notes or observations..."
        />
      </div>
    </motion.div>
  );
}; 