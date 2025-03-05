export interface TemperatureData {
  date: Date;
  value: number;
  phase: 'follicular' | 'ovulation' | 'luteal' | 'menstrual';
}

export interface SymptomCorrelation {
  symptom: string;
  frequency: number;
  relatedSymptoms: Array<{
    symptom: string;
    correlation: number; // -1 to 1
  }>;
  cyclePhaseDistribution: {
    follicular: number;
    ovulation: number;
    luteal: number;
    menstrual: number;
  };
}

export interface CycleAnalysis {
  averageCycleLength: number;
  averagePeriodLength: number;
  regularityScore: number; // 0-100
  ovulationPredictability: number; // 0-100
  temperatureShiftDetected: boolean;
  lutealPhaseLength: number;
}

export interface HealthInsight {
  id: string;
  userId: string;
  type: 'symptom' | 'cycle' | 'temperature' | 'general';
  title: string;
  description: string;
  recommendation: string;
  severity: 'info' | 'warning' | 'alert';
  createdAt: Date;
  relatedData?: {
    symptoms?: string[];
    dates?: Date[];
    values?: number[];
  };
}

export interface InsightSummary {
  userId: string;
  lastAnalysis: Date;
  cycleAnalysis: CycleAnalysis;
  topSymptomCorrelations: SymptomCorrelation[];
  recentInsights: HealthInsight[];
  temperatureStats: {
    averageBasal: number;
    postOvulationShift: number;
    hasEnoughData: boolean;
  };
} 