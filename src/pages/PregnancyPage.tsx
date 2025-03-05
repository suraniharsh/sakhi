import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PregnancyData, PregnancyJournal, PregnancySettings, WeeklyMilestone } from '../types/pregnancy';
import { pregnancyService } from '../services/PregnancyService';
import { motion, AnimatePresence } from 'framer-motion';

export const PregnancyPage: React.FC = () => {
  const { user } = useAuth();
  const [pregnancy, setPregnancy] = useState<PregnancyData | null>(null);
  const [milestone, setMilestone] = useState<WeeklyMilestone | null>(null);
  const [journalEntries, setJournalEntries] = useState<PregnancyJournal[]>([]);
  const [settings, setSettings] = useState<PregnancySettings | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [journalFormData, setJournalFormData] = useState({
    mood: '',
    symptoms: [] as string[],
    notes: '',
    weight: '',
    systolic: '',
    diastolic: ''
  });

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [pregnancyData, userSettings] = await Promise.all([
          pregnancyService.getPregnancyData(user.uid),
          pregnancyService.getSettings(user.uid)
        ]);

        setPregnancy(pregnancyData);
        setSettings(userSettings);

        if (pregnancyData) {
          const entries = await pregnancyService.getJournalEntries(pregnancyData.id);
          setJournalEntries(entries);

          const weekMilestone = pregnancyService.getMilestoneData(pregnancyData.currentWeek);
          setMilestone(weekMilestone);

          const personalizedInsights = pregnancyService.getPersonalizedInsights(
            pregnancyData.currentWeek,
            entries
          );
          setInsights(personalizedInsights);
        }
      } catch (error) {
        console.error('Error loading pregnancy data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleStartTracking = async () => {
    if (!user) return;

    try {
      const lastPeriodDate = new Date(); // You would get this from a date picker
      const pregnancyId = await pregnancyService.startPregnancyTracking(user.uid, lastPeriodDate);
      const pregnancyData = await pregnancyService.getPregnancyData(user.uid);
      setPregnancy(pregnancyData);
    } catch (error) {
      console.error('Error starting pregnancy tracking:', error);
    }
  };

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pregnancy) return;

    try {
      const entry: Omit<PregnancyJournal, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        pregnancyId: pregnancy.id,
        date: new Date(),
        week: pregnancy.currentWeek,
        mood: journalFormData.mood,
        symptoms: journalFormData.symptoms,
        notes: journalFormData.notes,
        ...(journalFormData.weight && {
          weight: Number(journalFormData.weight)
        }),
        ...(journalFormData.systolic && journalFormData.diastolic && {
          bloodPressure: {
            systolic: Number(journalFormData.systolic),
            diastolic: Number(journalFormData.diastolic)
          }
        })
      };

      await pregnancyService.addJournalEntry(entry);
      const entries = await pregnancyService.getJournalEntries(pregnancy.id);
      setJournalEntries(entries);
      setShowJournalForm(false);
      setJournalFormData({
        mood: '',
        symptoms: [],
        notes: '',
        weight: '',
        systolic: '',
        diastolic: ''
      });
    } catch (error) {
      console.error('Error adding journal entry:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Please log in to access pregnancy tracking</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!pregnancy) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Start Pregnancy Tracking
          </h1>
          <p className="text-gray-600 mb-8">
            Track your pregnancy journey with personalized insights and milestones
          </p>
          <button
            onClick={handleStartTracking}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Begin Tracking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Timeline View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6 mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Pregnancy Journey</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-pink-200"></div>
              <div className="space-y-8">
                {milestone && (
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-4 h-4 bg-pink-500 rounded-full -translate-x-1/2"></div>
                    <div className="bg-pink-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900">Week {milestone.week}</h3>
                      <div className="mt-2 space-y-2">
                        <p className="text-gray-600">
                          Baby is the size of a {milestone.babySize.fruit}
                          ({milestone.babySize.lengthCm}cm, {milestone.babySize.weightGrams}g)
                        </p>
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-800">Baby's Development</h4>
                          <ul className="mt-2 list-disc list-inside text-gray-600">
                            {milestone.babyDevelopment.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Journal Entries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Pregnancy Journal</h2>
              <button
                onClick={() => setShowJournalForm(true)}
                className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                Add Entry
              </button>
            </div>

            <AnimatePresence>
              {showJournalForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleJournalSubmit}
                  className="mb-8 bg-pink-50 rounded-lg p-6"
                >
                  {/* Form fields here */}
                </motion.form>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              {journalEntries.map(entry => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">Week {entry.week}</h3>
                      <p className="text-sm text-gray-500">{entry.date.toLocaleDateString()}</p>
                    </div>
                    <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                      {entry.mood}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{entry.notes}</p>
                  {entry.symptoms.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {entry.symptoms.map(symptom => (
                        <span
                          key={symptom}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div>
          {/* Insights and Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Insights & Tips</h2>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg"
                >
                  <p className="text-blue-800">{insight}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6 mt-8"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Due Date</p>
                <p className="text-lg font-medium text-gray-900">
                  {pregnancy.dueDate.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Current Week</p>
                <p className="text-lg font-medium text-gray-900">
                  Week {pregnancy.currentWeek}
                </p>
              </div>
              {journalEntries[0]?.weight && (
                <div>
                  <p className="text-gray-600">Latest Weight</p>
                  <p className="text-lg font-medium text-gray-900">
                    {journalEntries[0].weight} {settings?.weightUnit}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}; 