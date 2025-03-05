export enum FlowIntensity {
  SPOTTING = 'spotting',
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  VERY_HEAVY = 'very_heavy'
}

export enum Symptom {
  CRAMPS = 'cramps',
  HEADACHE = 'headache',
  BLOATING = 'bloating',
  FATIGUE = 'fatigue',
  MOOD_SWINGS = 'mood_swings',
  BREAST_TENDERNESS = 'breast_tenderness',
  ACNE = 'acne',
  BACKACHE = 'backache',
  NAUSEA = 'nausea',
  INSOMNIA = 'insomnia',
  APPETITE_CHANGES = 'appetite_changes',
  DIGESTIVE_ISSUES = 'digestive_issues'
}

export enum CyclePhase {
  MENSTRUAL = 'menstrual',
  FOLLICULAR = 'follicular',
  OVULATION = 'ovulation',
  LUTEAL = 'luteal'
}

export interface CycleDay {
  date: Date;
  flow: FlowIntensity | null;
  symptoms: Symptom[];
  notes: string;
  phase: CyclePhase;
  temperature?: number; // Basal body temperature in Celsius
  mood?: number; // Scale of 1-5
}

export interface CycleLog {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date | null;
  flow: FlowIntensity;
  symptoms: Symptom[];
  notes?: string;
  days: CycleDay[];
  isRegular: boolean; // Determined by algorithm
  length: number | null; // Calculated when cycle ends
  createdAt: Date;
  updatedAt: Date;
}

export interface CyclePrediction {
  id: string;
  userId: string;
  nextPeriodStart: Date;
  nextPeriodEnd: Date;
  confidence: number; // 0-100
  basedOnCycles: number;
  averageCycleLength: number;
  standardDeviation: number;
  regularityScore: number; // 0-100
  phasesPrediction: {
    menstrual: { start: Date; end: Date };
    follicular: { start: Date; end: Date };
    ovulation: { start: Date; end: Date };
    luteal: { start: Date; end: Date };
  };
  lastUpdated: Date;
}

export interface CycleStatistics {
  id: string;
  userId: string;
  averageCycleLength: number;
  shortestCycle: number;
  longestCycle: number;
  standardDeviation: number;
  regularityScore: number;
  cycleHistory: {
    last3Months: number[];
    last6Months: number[];
    last12Months: number[];
  };
  symptoms: {
    [key in Symptom]: {
      frequency: number; // 0-100
      averageDayInCycle: number;
    };
  };
  flowPatterns: {
    [key in FlowIntensity]: {
      frequency: number; // 0-100
      averageDuration: number;
    };
  };
  totalCyclesLogged: number;
  lastCalculated: Date;
} 