export interface PregnancyData {
  id: string;
  userId: string;
  lastPeriodDate: Date;
  conceptionDate?: Date;
  dueDate: Date;
  currentWeek: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyMilestone {
  week: number;
  babySize: {
    fruit: string;
    lengthCm: number;
    weightGrams: number;
  };
  babyDevelopment: string[];
  motherChanges: string[];
  nutritionTips: string[];
  exerciseTips: string[];
  warningSymptoms: string[];
}

export interface PregnancyJournal {
  id: string;
  userId: string;
  pregnancyId: string;
  date: Date;
  week: number;
  mood: string;
  symptoms: string[];
  notes: string;
  weight?: number; // in kg
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PregnancySettings {
  userId: string;
  weightUnit: 'kg' | 'lb';
  lengthUnit: 'cm' | 'in';
  weeklyReminders: boolean;
  appointmentReminders: boolean;
  nutritionReminders: boolean;
} 