import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export type CycleDay = {
  date: Date;
  type: 'period' | 'fertile' | 'ovulation';
  intensity?: 'light' | 'medium' | 'heavy';
};

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface CycleData {
  cycleDays: CycleDay[];
  cyclePhase: CyclePhase;
  cycleLength: number;
  lastPeriod: Date | null;
  nextPeriod: Date | null;
  regularityScore: number;
  loading: boolean;
}

export const useCycleData = () => {
  const { user } = useAuth();
  const [cycleData, setCycleData] = useState<CycleData>({
    cycleDays: [],
    cyclePhase: 'follicular',
    cycleLength: 28,
    lastPeriod: null,
    nextPeriod: null,
    regularityScore: 85,
    loading: true
  });

  useEffect(() => {
    if (!user) return;

    const loadCycleData = async () => {
      try {
        // For demo purposes, setting some sample cycle days
        const today = new Date();
        const days: CycleDay[] = [];
        
        // Add period days
        for (let i = 0; i < 5; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          days.push({
            date,
            type: 'period',
            intensity: i < 2 ? 'heavy' : i < 4 ? 'medium' : 'light'
          });
        }

        // Add fertile days
        for (let i = 12; i < 16; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          days.push({
            date,
            type: 'fertile'
          });
        }

        // Add ovulation day
        const ovulationDate = new Date(today);
        ovulationDate.setDate(today.getDate() + 14);
        days.push({
          date: ovulationDate,
          type: 'ovulation'
        });

        const next = new Date(today);
        next.setDate(today.getDate() + 28);

        setCycleData({
          cycleDays: days,
          cyclePhase: 'menstrual',
          cycleLength: 28,
          lastPeriod: today,
          nextPeriod: next,
          regularityScore: 85,
          loading: false
        });
      } catch (error) {
        console.error('Error loading cycle data:', error);
        setCycleData(prev => ({ ...prev, loading: false }));
      }
    };

    loadCycleData();
  }, [user]);

  const calculatePhase = (date: Date): CyclePhase => {
    const cycleDay = cycleData.cycleDays.find(day => 
      day.date.toDateString() === date.toDateString()
    );

    if (cycleDay?.type === 'period') return 'menstrual';
    if (cycleDay?.type === 'ovulation') return 'ovulation';
    if (cycleDay?.type === 'fertile') return 'follicular';
    return 'luteal';
  };

  const getPhaseDescription = (phase: CyclePhase): string => {
    switch (phase) {
      case 'menstrual':
        return 'Your body is shedding the uterine lining. Focus on rest and self-care.';
      case 'follicular':
        return 'Estrogen levels are rising. Energy levels typically increase during this phase.';
      case 'ovulation':
        return 'Peak fertility window. You may notice increased energy and improved mood.';
      case 'luteal':
        return 'Progesterone rises. You might experience premenstrual symptoms.';
    }
  };

  const addCycleDay = async (day: CycleDay) => {
    try {
      // Here you would typically make an API call to save the cycle day
      setCycleData(prev => ({
        ...prev,
        cycleDays: [...prev.cycleDays, day]
      }));
    } catch (error) {
      console.error('Error adding cycle day:', error);
      throw error;
    }
  };

  const updateCycleDay = async (date: Date, updates: Partial<CycleDay>) => {
    try {
      // Here you would typically make an API call to update the cycle day
      setCycleData(prev => ({
        ...prev,
        cycleDays: prev.cycleDays.map(day =>
          day.date.toDateString() === date.toDateString()
            ? { ...day, ...updates }
            : day
        )
      }));
    } catch (error) {
      console.error('Error updating cycle day:', error);
      throw error;
    }
  };

  const deleteCycleDay = async (date: Date) => {
    try {
      // Here you would typically make an API call to delete the cycle day
      setCycleData(prev => ({
        ...prev,
        cycleDays: prev.cycleDays.filter(day =>
          day.date.toDateString() !== date.toDateString()
        )
      }));
    } catch (error) {
      console.error('Error deleting cycle day:', error);
      throw error;
    }
  };

  return {
    ...cycleData,
    calculatePhase,
    getPhaseDescription,
    addCycleDay,
    updateCycleDay,
    deleteCycleDay
  };
}; 