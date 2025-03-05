import React from 'react';
import { DailySymptomSummary, Symptom, Mood } from '../../types/symptoms';
import { motion } from 'framer-motion';

interface DailySummaryViewProps {
  summary: DailySymptomSummary;
  symptoms: Symptom[];
  moods: Mood[];
  onExport: () => void;
}

export const DailySummaryView: React.FC<DailySummaryViewProps> = ({
  summary,
  symptoms: masterSymptoms,
  moods: masterMoods,
  onExport
}) => {
  const getSymptomName = (id: string) => {
    const symptom = masterSymptoms.find(s => s.id === id);
    return symptom ? symptom.name : id;
  };

  const getMoodName = (id: string) => {
    const mood = masterMoods.find(m => m.id === id);
    return mood ? mood.name : id;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Daily Summary for {new Date(summary.date).toLocaleDateString()}
        </h2>
        <button
          onClick={onExport}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Export PDF
        </button>
      </div>

      {/* Symptoms */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Symptoms</h3>
        <div className="flex flex-wrap gap-2">
          {summary.symptoms.length > 0 ? (
            summary.symptoms.map((symptomId) => (
              <span
                key={symptomId}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {getSymptomName(symptomId)}
              </span>
            ))
          ) : (
            <p className="text-gray-500">No symptoms recorded</p>
          )}
        </div>
      </div>

      {/* Moods */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Moods</h3>
        <div className="flex flex-wrap gap-2">
          {summary.moods.length > 0 ? (
            summary.moods.map((moodId) => (
              <span
                key={moodId}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {getMoodName(moodId)}
              </span>
            ))
          ) : (
            <p className="text-gray-500">No moods recorded</p>
          )}
        </div>
      </div>

      {/* Physical Stats */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Physical Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          {summary.physicalStats.temperature && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Temperature</p>
              <p className="text-lg font-medium">{summary.physicalStats.temperature}°C</p>
            </div>
          )}
          {summary.physicalStats.weight && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Weight</p>
              <p className="text-lg font-medium">{summary.physicalStats.weight} kg</p>
            </div>
          )}
          {summary.physicalStats.bloodPressure && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Blood Pressure</p>
              <p className="text-lg font-medium">{summary.physicalStats.bloodPressure}</p>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {summary.notes && (
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Notes</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{summary.notes}</p>
        </div>
      )}
    </motion.div>
  );
}; 