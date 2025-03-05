import { Timestamp } from 'firebase/firestore';

export enum CervicalMucusType {
  DRY = 'DRY',
  STICKY = 'STICKY',
  CREAMY = 'CREAMY',
  WATERY = 'WATERY',
  EGG_WHITE = 'EGG_WHITE'
}

export enum SexualActivity {
  NONE = 'NONE',
  PROTECTED = 'PROTECTED',
  UNPROTECTED = 'UNPROTECTED',
  HIGH_RISK = 'HIGH_RISK'
}

export interface PhysicalStats {
  temperature?: number;  // in Celsius
  weight?: number;      // in kg
  bmi?: number;
  cervicalMucus?: CervicalMucusType;
  sexualActivity?: SexualActivity;
  bloodPressure?: string;
}

export interface SymptomLog {
  id: string;
  userId: string;
  date: Date;
  symptoms: string[];  // Array of symptom IDs
  moods: string[];     // Array of mood IDs
  notes: string;
  physicalStats: PhysicalStats;
  createdAt: Date;
  updatedAt: Date;
}

// For Firestore
export interface FirestoreSymptomLog extends Omit<SymptomLog, 'date' | 'createdAt' | 'updatedAt'> {
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Symptom {
  id: string;
  category: SymptomCategory;
  name: string;
  severity: number;
}

export interface Mood {
  id: string;
  category: MoodCategory;
  name: string;
  intensity: number;
}

export enum SymptomCategory {
  PHYSICAL = 'physical',
  PAIN = 'pain',
  DIGESTIVE = 'digestive',
  SLEEP = 'sleep',
  SKIN = 'skin',
  REPRODUCTIVE = 'reproductive'
}

export enum MoodCategory {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  ENERGY = 'energy',
  ANXIETY = 'anxiety',
  DEPRESSION = 'depression'
}

export interface DailySymptomSummary {
  date: string;
  symptoms: string[];
  moods: string[];
  physicalStats: PhysicalStats;
  notes: string;
} 