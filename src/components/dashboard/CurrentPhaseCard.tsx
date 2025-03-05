import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  ClipboardDocumentListIcon, 
  AcademicCapIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { CycleCalculationService, CyclePhase, PHASE_INFO } from '../../services/CycleCalculationService';
import { CycleDataService } from '../../services/CycleDataService';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, isSameDay, isAfter } from 'date-fns';

export const CurrentPhaseCard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phaseData, setPhaseData] = useState<{
    phase: CyclePhase;
    dayOfCycle: number;
    daysUntilNextPhase: number;
    nextPeriodIn: number;
    lastPeriodDays: number;
    phaseInfo: typeof PHASE_INFO[CyclePhase];
  } | null>(null);

  useEffect(() => {
    const fetchCycleData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const dataService = new CycleDataService(user.uid);
        const periodLogs = await dataService.getPeriodLogs();

        if (periodLogs.length === 0) {
          setError('No period data available');
          return;
        }

        const today = new Date();
        const cycleService = new CycleCalculationService();
        periodLogs.forEach(log => cycleService.addPeriodLog(log));
        const cycleDays = cycleService.predictNextCycle(today);

        // Find current phase from cycle days
        const currentDay = cycleDays.find(day => isSameDay(day.date, today));
        let currentPhase: CyclePhase;

        if (!currentDay) {
          currentPhase = 'luteal'; // Default phase
        } else {
          switch (currentDay.phase) {
            case 'period':
              currentPhase = 'menstrual';
              break;
            case 'ovulation':
              currentPhase = 'ovulation';
              break;
            case 'fertile':
              currentPhase = 'follicular';
              break;
            default:
              currentPhase = 'luteal';
          }
        }

        // Get last period date
        const pastPeriods = cycleDays
          .filter(day => day.phase === 'period' && !isAfter(day.date, today))
          .sort((a, b) => b.date.getTime() - a.date.getTime());
        
        const lastPeriodDate = pastPeriods[0]?.date;
        const lastPeriodDays = lastPeriodDate 
          ? differenceInDays(today, lastPeriodDate)
          : 0;

        // Calculate day of cycle
        const dayOfCycle = lastPeriodDays + 1;

        // Find next phase change
        const futureDays = cycleDays
          .filter(day => isAfter(day.date, today))
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        // Find the next phase that's different from current
        let nextPhaseDay = null;
        let currentPhaseType = currentDay?.phase || 'unknown';
        
        for (const day of futureDays) {
          if (day.phase !== currentPhaseType) {
            nextPhaseDay = day;
            break;
          }
        }

        const daysUntilNextPhase = nextPhaseDay 
          ? differenceInDays(nextPhaseDay.date, today)
          : 0;

        // Find next period (using same method as Cycle Tracker)
        const futurePeriods = cycleDays
          .filter(day => day.phase === 'period' && isAfter(day.date, today))
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        const nextPeriod = futurePeriods[0];
        const nextPeriodIn = nextPeriod 
          ? differenceInDays(nextPeriod.date, today)
          : 0;

        setPhaseData({
          phase: currentPhase,
          dayOfCycle,
          daysUntilNextPhase,
          nextPeriodIn,
          lastPeriodDays,
          phaseInfo: PHASE_INFO[currentPhase]
        });
      } catch (err) {
        setError('Failed to load cycle data');
        console.error('Error fetching cycle data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCycleData();
  }, [user]);

  const handleTrackSymptoms = () => {
    navigate('/symptoms');
  };

  const handleLearnMore = () => {
    navigate('/insights');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center justify-center min-h-[300px] w-full max-w-md">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (error || !phaseData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-md">
        <div className="text-center text-gray-500">
          <p>{error || 'Unable to calculate cycle phase'}</p>
          <button 
            onClick={() => navigate('/cycle')}
            className="mt-4 text-pink-500 hover:text-pink-600 flex items-center justify-center space-x-2 mx-auto"
          >
            <CalendarIcon className="w-5 h-5" />
            <span>Log Your Period</span>
          </button>
        </div>
      </div>
    );
  }

  const { from, to } = CycleCalculationService.getPhaseColor(phaseData.phase);
  const phaseIcon = CycleCalculationService.getPhaseIcon(phaseData.phase);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-md"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Current Phase</h2>
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-pink-500" />
          <span className="text-sm text-gray-500">
            Day {phaseData.dayOfCycle} of {phaseData.phaseInfo.duration}
          </span>
        </div>
      </div>

      <div className={`bg-gradient-to-r ${from} ${to} rounded-xl p-5 text-white`}>
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <span className="text-2xl">{phaseIcon}</span>
          </div>
          <div>
            <h3 className="text-2xl font-semibold">{phaseData.phaseInfo.name}</h3>
            <p className="text-pink-100">{phaseData.phaseInfo.description}</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium mb-2 flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5" />
              <span>What to expect</span>
            </h4>
            <ul className="space-y-2 text-sm text-pink-100">
              {phaseData.phaseInfo.symptoms.map((symptom, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <HeartIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTrackSymptoms}
            className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl py-2.5 px-4 text-sm font-medium flex items-center justify-center space-x-2 group"
          >
            <ClipboardDocumentListIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Track Symptoms</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLearnMore}
            className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl py-2.5 px-4 text-sm font-medium flex items-center justify-center space-x-2 group"
          >
            <AcademicCapIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Learn More</span>
          </motion.button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="bg-pink-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Last Period</p>
          <p className="font-medium text-gray-800">
            {phaseData.lastPeriodDays === 0 ? 'Today' : 
             `${phaseData.lastPeriodDays} ${phaseData.lastPeriodDays === 1 ? 'day' : 'days'} ago`}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Next Period</p>
          <p className="font-medium text-gray-800">
            {phaseData.nextPeriodIn === 0 ? 'Today' :
             `in ${phaseData.nextPeriodIn} ${phaseData.nextPeriodIn === 1 ? 'day' : 'days'}`}
          </p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Phase Change</p>
          <p className="font-medium text-gray-800">
            {phaseData.daysUntilNextPhase === 0 ? 'Today' :
             `in ${phaseData.daysUntilNextPhase} ${phaseData.daysUntilNextPhase === 1 ? 'day' : 'days'}`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}; 