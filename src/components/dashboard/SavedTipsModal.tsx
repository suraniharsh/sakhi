import React from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Tip {
  title: string;
  content: string;
  category: 'health' | 'wellness' | 'nutrition' | 'exercise' | 'mindfulness';
}

interface SavedTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTips: Tip[];
  onDeleteTip: (index: number) => void;
}

const getCategoryColor = (category: Tip['category']) => {
  switch (category) {
    case 'health':
      return 'text-pink-500';
    case 'wellness':
      return 'text-purple-500';
    case 'nutrition':
      return 'text-green-500';
    case 'exercise':
      return 'text-blue-500';
    case 'mindfulness':
      return 'text-indigo-500';
    default:
      return 'text-gray-500';
  }
};

const getCategoryBg = (category: Tip['category']) => {
  switch (category) {
    case 'health':
      return 'bg-pink-50';
    case 'wellness':
      return 'bg-purple-50';
    case 'nutrition':
      return 'bg-green-50';
    case 'exercise':
      return 'bg-blue-50';
    case 'mindfulness':
      return 'bg-indigo-50';
    default:
      return 'bg-gray-50';
  }
};

export const SavedTipsModal: React.FC<SavedTipsModalProps> = ({
  isOpen,
  onClose,
  savedTips,
  onDeleteTip,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Saved Tips</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {savedTips.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No saved tips yet. Save some tips to see them here!
          </div>
        ) : (
          <div className="space-y-4">
            {savedTips.map((tip, index) => (
              <div
                key={`${tip.title}-${index}`}
                className={`${getCategoryBg(tip.category)} rounded-xl p-4 relative group`}
              >
                <button
                  onClick={() => onDeleteTip(index)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <TrashIcon className="w-5 h-5 text-red-500 hover:text-red-600" />
                </button>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-medium ${getCategoryColor(tip.category)}`}>
                    {tip.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getCategoryBg(
                      tip.category
                    )} ${getCategoryColor(tip.category)}`}
                  >
                    {tip.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{tip.content}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}; 