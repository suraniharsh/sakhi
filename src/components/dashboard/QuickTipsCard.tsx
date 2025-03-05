import React from 'react';
import { motion } from 'framer-motion';
import { LightBulbIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Tip {
  title: string;
  description: string;
  category: 'health' | 'lifestyle' | 'nutrition';
}

export const QuickTipsCard: React.FC = () => {
  const [tips] = React.useState<Tip[]>([
    {
      title: "Stay Hydrated",
      description: "Drink at least 8 glasses of water today to help with bloating and cramps.",
      category: "health"
    },
    {
      title: "Light Exercise",
      description: "Try gentle yoga or walking to improve circulation and reduce discomfort.",
      category: "lifestyle"
    },
    {
      title: "Iron-Rich Foods",
      description: "Include leafy greens and lean proteins in your diet during menstruation.",
      category: "nutrition"
    }
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <LightBulbIcon className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-semibold text-gray-800">Daily Tips</h2>
        </div>
        <button className="text-gray-400 hover:text-pink-500 transition-colors duration-200">
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {tips.map((tip, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4"
          >
            <h3 className="font-medium text-gray-800 mb-2">{tip.title}</h3>
            <p className="text-sm text-gray-600">{tip.description}</p>
            <div className="mt-3 flex items-center">
              <span className="text-xs font-medium text-pink-500 px-2 py-1 bg-pink-50 rounded-full">
                {tip.category}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <button className="p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
          View All Tips
        </button>
        <button className="p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
          Save Tips
        </button>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl">
        <p className="text-sm text-pink-600 font-medium">
          Tips are personalized based on your cycle phase and symptoms.
        </p>
      </div>
    </motion.div>
  );
}; 