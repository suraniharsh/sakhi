import { CycleLog } from './cycle';

export interface FertilityWindow {
  start: Date;
  end: Date;
  type: FertilityType;
  probability: number;
}

export interface OvulationPrediction {
  expectedDate: Date;
  confidence: number;
  fertilityWindows: FertilityWindow[];
}

export interface DailyFertilityStatus {
  date: Date;
  phase: FertilityPhase;
  probability: number;
  notes: string[];
}

export enum FertilityType {
  HIGHLY_FERTILE = 'HIGHLY_FERTILE',
  FERTILE = 'FERTILE',
  LESS_FERTILE = 'LESS_FERTILE',
  INFERTILE = 'INFERTILE'
}

export enum FertilityPhase {
  MENSTRUAL = 'MENSTRUAL',
  FOLLICULAR = 'FOLLICULAR',
  OVULATION = 'OVULATION',
  LUTEAL = 'LUTEAL'
}

export interface FertilityStats {
  averageOvulationDay: number;
  cycleRegularity: number; // 0-1, where 1 is highly regular
  lastCalculated: Date;
  confidenceLevel: number;
  historicalData: {
    ovulationDays: number[];
    cycleLengths: number[];
    lutealPhaseLengths: number[];
  };
}

export interface FertilityPDF {
  userId: string;
  generatedAt: Date;
  predictions: OvulationPrediction[];
  stats: FertilityStats;
  recommendations: string[];
  nextThreeMonths: DailyFertilityStatus[];
} 