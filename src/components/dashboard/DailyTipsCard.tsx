import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LightBulbIcon, ArrowPathIcon, ExclamationCircleIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { TipsService } from '../../services/TipsService';
import { SavedTipsModal } from './SavedTipsModal';

interface Tip {
  title: string;
  content: string;
  category: 'health' | 'wellness' | 'nutrition' | 'exercise' | 'mindfulness';
}

// Fallback tips if Gemini API fails
const DAILY_TIPS: Tip[] = [
  {
    title: "Stay Hydrated",
    content: "During your period, drinking plenty of water helps reduce bloating and cramps. Aim for 8-10 glasses daily.",
    category: "health"
  },
  {
    title: "Exercise Gently",
    content: "Light exercises like yoga or walking can help ease menstrual pain and boost your mood through endorphin release.",
    category: "exercise"
  },
  {
    title: "Iron-Rich Foods",
    content: "Include iron-rich foods like leafy greens, lean meats, and legumes to replenish iron lost during menstruation.",
    category: "nutrition"
  },
  {
    title: "Heat Therapy",
    content: "Apply a heating pad to your lower abdomen to help relieve menstrual cramps and muscle tension.",
    category: "wellness"
  },
  {
    title: "Mindful Breathing",
    content: "Practice deep breathing exercises to reduce stress and help manage period-related anxiety.",
    category: "mindfulness"
  },
  {
    title: "Regular Sleep Schedule",
    content: "Maintain a consistent sleep schedule to help regulate your menstrual cycle and improve overall well-being.",
    category: "wellness"
  },
  {
    title: "Calcium Intake",
    content: "Increase calcium intake during your period to help reduce mood swings and decrease menstrual pain.",
    category: "nutrition"
  },
  {
    title: "Avoid Caffeine",
    content: "Reduce caffeine intake during your period as it can increase anxiety and worsen cramps.",
    category: "health"
  },
  {
    title: "Gentle Stretching",
    content: "Practice gentle stretching exercises to relieve lower back pain and improve circulation.",
    category: "exercise"
  },
  {
    title: "Self-Care Time",
    content: "Take time for self-care activities that help you relax and reduce stress during your cycle.",
    category: "mindfulness"
  }
];

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

export const DailyTipsCard: React.FC<{ currentPhase?: string }> = ({ currentPhase }) => {
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipsService, setTipsService] = useState<TipsService | null>(null);
  const [savedTips, setSavedTips] = useState<Tip[]>([]);
  const [showAllTips, setShowAllTips] = useState(false);
  const [displayedTips, setDisplayedTips] = useState<Tip[]>([]);
  const [isSavedTipsModalOpen, setIsSavedTipsModalOpen] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  // Initialize TipsService with API key
  useEffect(() => {
    const initializeTipsService = () => {
      try {
        // Use your Gemini API key here
        // You can get one from https://makersuite.google.com/app/apikey
        const apiKey = "AIzaSyDGXXnJPGZKlrFXX_Hy_Ub_8nxQXNwVVJE"; // Replace with your actual API key
        
        if (!apiKey) {
          console.error('No API key available');
          setApiKeyMissing(true);
          setError('Gemini API key not found. Using fallback tips.');
          return;
        }
        
        console.log('Initializing TipsService with API key');
        const service = new TipsService(apiKey);
        setTipsService(service);
        setApiKeyMissing(false);
      } catch (err) {
        console.error('Failed to initialize TipsService:', err);
        setApiKeyMissing(true);
        setError('Unable to connect to Gemini API. Using fallback tips.');
      }
    };

    initializeTipsService();
    
    // Get a tip immediately after initializing
    setTimeout(() => {
      getRandomTip();
    }, 500);
  }, []);

  // Load saved tips from localStorage
  useEffect(() => {
    const loadSavedTips = () => {
      try {
        const saved = localStorage.getItem('savedTips');
        if (saved) {
          setSavedTips(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading saved tips:', error);
      }
    };
    loadSavedTips();
  }, []);

  const handleSaveTip = (tip: Tip) => {
    if (!tip) return;
    
    try {
      const newSavedTips = [...savedTips];
      const tipExists = newSavedTips.some(
        (savedTip) => savedTip.title === tip.title && savedTip.content === tip.content
      );

      if (!tipExists) {
        newSavedTips.push(tip);
        setSavedTips(newSavedTips);
        localStorage.setItem('savedTips', JSON.stringify(newSavedTips));
        alert('Tip saved successfully!');
      } else {
        alert('This tip is already saved!');
      }
    } catch (error) {
      console.error('Error saving tip:', error);
      alert('Failed to save tip. Please try again.');
    }
  };

  const handleDeleteSavedTip = (index: number) => {
    try {
      const newSavedTips = [...savedTips];
      newSavedTips.splice(index, 1);
      setSavedTips(newSavedTips);
      localStorage.setItem('savedTips', JSON.stringify(newSavedTips));
    } catch (error) {
      console.error('Error deleting saved tip:', error);
    }
  };

  const getRandomTip = async () => {
    setLoading(true);
    setError(null);
    setShowAllTips(false);

    try {
      let tip: Tip;
      
      if (tipsService && !apiKeyMissing) {
        console.log('Attempting to fetch tip from Gemini');
        try {
          tip = await tipsService.getDailyTip(currentPhase);
          console.log('Successfully received tip from Gemini:', tip);
        } catch (geminiError) {
          console.error('Gemini API error:', geminiError);
          console.log('Falling back to local tips due to API error');
          const randomIndex = Math.floor(Math.random() * DAILY_TIPS.length);
          tip = DAILY_TIPS[randomIndex];
          setError('Could not connect to Gemini API. Using fallback tip.');
        }
      } else {
        console.log('Using fallback tip (service not available)');
        const randomIndex = Math.floor(Math.random() * DAILY_TIPS.length);
        tip = DAILY_TIPS[randomIndex];
        if (!error) {
          setError('Gemini API not available. Using fallback tip.');
        }
      }

      setCurrentTip(tip);
      setDisplayedTips([tip]);
    } catch (error) {
      console.error('Error in getRandomTip:', error);
      const randomIndex = Math.floor(Math.random() * DAILY_TIPS.length);
      const fallbackTip = DAILY_TIPS[randomIndex];
      setCurrentTip(fallbackTip);
      setDisplayedTips([fallbackTip]);
      setError('Failed to get online tip. Using fallback tip.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllTips = () => {
    setShowAllTips(true);
    setDisplayedTips(DAILY_TIPS);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <LightBulbIcon className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-800">
              {currentPhase ? `${currentPhase} Phase Tips` : 'Daily Wellness Tips'}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            {apiKeyMissing && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Offline Mode</span>
            )}
            <button
              onClick={() => setIsSavedTipsModalOpen(true)}
              className="text-gray-500 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              aria-label="View saved tips"
            >
              <BookmarkIcon className="w-5 h-5" />
            </button>
            <button
              onClick={getRandomTip}
              className="text-gray-500 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              aria-label="Get new tip"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center space-x-2 text-red-600">
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {displayedTips.map((tip, index) => (
            <div
              key={`${tip.title}-${index}`}
              className={`${getCategoryBg(tip.category)} rounded-xl p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-medium ${getCategoryColor(tip.category)}`}>
                  {tip.title}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryBg(tip.category)} ${getCategoryColor(tip.category)}`}>
                  {tip.category}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{tip.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={handleViewAllTips}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            View All Tips
          </button>
          <button
            onClick={() => currentTip && handleSaveTip(currentTip)}
            className="w-full py-2 px-4 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg transition-colors text-sm font-medium"
          >
            Save Tips
          </button>
        </div>
      </motion.div>

      <SavedTipsModal
        isOpen={isSavedTipsModalOpen}
        onClose={() => setIsSavedTipsModalOpen(false)}
        savedTips={savedTips}
        onDeleteTip={handleDeleteSavedTip}
      />
    </>
  );
}; 