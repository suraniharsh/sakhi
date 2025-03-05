import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, ChartBarIcon, BookOpenIcon } from '@heroicons/react/24/outline';

interface Symptom {
  name: string;
  intensity: number;
  date: Date;
}

export const MenopauseCard: React.FC = () => {
  const [symptoms, setSymptoms] = React.useState<Symptom[]>([
    { name: 'Hot Flashes', intensity: 3, date: new Date() },
    { name: 'Mood Changes', intensity: 2, date: new Date() },
    { name: 'Sleep Issues', intensity: 4, date: new Date() }
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <HeartIcon className="w-6 h-6 text-pink-500" />
        <h2 className="text-xl font-semibold text-gray-800">Menopause Support</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-800">Today's Symptoms</h3>
            <button className="text-pink-500 hover:text-pink-600 text-sm font-medium">
              Log New
            </button>
          </div>
          <div className="space-y-2">
            {symptoms.map((symptom, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                <span className="text-gray-700">{symptom.name}</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < symptom.intensity ? 'bg-pink-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-xl hover:bg-pink-50 transition-colors duration-200 group">
            <ChartBarIcon className="w-5 h-5 text-gray-400 group-hover:text-pink-500" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-pink-600">View Trends</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-xl hover:bg-pink-50 transition-colors duration-200 group">
            <BookOpenIcon className="w-5 h-5 text-gray-400 group-hover:text-pink-500" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-pink-600">Resources</span>
          </button>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <h3 className="font-medium text-gray-800 mb-2">Quick Tips</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Stay hydrated and maintain a cool environment</li>
            <li>• Practice relaxation techniques for better sleep</li>
            <li>• Regular exercise can help manage symptoms</li>
          </ul>
        </div>
      </div>

      <button className="w-full mt-6 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200">
        Schedule Consultation
      </button>
    </motion.div>
  );
}; 