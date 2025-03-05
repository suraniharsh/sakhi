import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  TemperatureData,
  SymptomCorrelation,
  CycleAnalysis,
  HealthInsight,
  InsightSummary
} from '../types/insights';

class HealthInsightService {
  private readonly INSIGHTS_COLLECTION = 'healthInsights';
  private readonly SUMMARY_COLLECTION = 'insightSummaries';

  // Analyze temperature data
  analyzeTemperature(temperatures: TemperatureData[]): {
    stats: { averageBasal: number; postOvulationShift: number; hasEnoughData: boolean };
    insights: HealthInsight[];
  } {
    if (temperatures.length < 14) {
      return {
        stats: { averageBasal: 0, postOvulationShift: 0, hasEnoughData: false },
        insights: []
      };
    }

    const sortedTemps = [...temperatures].sort((a, b) => a.date.getTime() - b.date.getTime());
    const averageBasal = this.calculateAverageBasal(sortedTemps);
    const postOvulationShift = this.detectTemperatureShift(sortedTemps);
    
    const insights: HealthInsight[] = [];
    
    if (postOvulationShift > 0.2) {
      insights.push({
        id: '', // Will be set when saved to Firestore
        userId: '', // Will be set when saved
        type: 'temperature',
        title: 'Temperature Shift Detected',
        description: 'A significant temperature rise has been detected, indicating possible ovulation.',
        recommendation: 'Continue tracking temperature to confirm ovulation pattern.',
        severity: 'info',
        createdAt: new Date(),
        relatedData: {
          dates: sortedTemps.map(t => t.date),
          values: sortedTemps.map(t => t.value)
        }
      });
    }

    return {
      stats: {
        averageBasal,
        postOvulationShift,
        hasEnoughData: true
      },
      insights
    };
  }

  // Analyze symptom correlations
  analyzeSymptoms(symptoms: Array<{ date: Date; symptoms: string[] }>): {
    correlations: SymptomCorrelation[];
    insights: HealthInsight[];
  } {
    const symptomMap = new Map<string, number>();
    const correlationMap = new Map<string, Map<string, number>>();
    
    // Count symptoms and build correlation pairs
    symptoms.forEach(day => {
      day.symptoms.forEach(s1 => {
        symptomMap.set(s1, (symptomMap.get(s1) || 0) + 1);
        
        day.symptoms.forEach(s2 => {
          if (s1 !== s2) {
            const s1Map = correlationMap.get(s1) || new Map<string, number>();
            s1Map.set(s2, (s1Map.get(s2) || 0) + 1);
            correlationMap.set(s1, s1Map);
          }
        });
      });
    });

    const correlations: SymptomCorrelation[] = [];
    const insights: HealthInsight[] = [];

    symptomMap.forEach((frequency, symptom) => {
      const relatedSymptoms = Array.from(correlationMap.get(symptom)?.entries() || [])
        .map(([related, count]) => ({
          symptom: related,
          correlation: count / frequency // Simplified correlation calculation
        }))
        .sort((a, b) => b.correlation - a.correlation)
        .slice(0, 3);

      correlations.push({
        symptom,
        frequency,
        relatedSymptoms,
        cyclePhaseDistribution: {
          follicular: 0.25, // Placeholder - would calculate from actual data
          ovulation: 0.25,
          luteal: 0.25,
          menstrual: 0.25
        }
      });

      // Generate insights for frequent symptoms
      if (frequency > symptoms.length * 0.5) {
        insights.push({
          id: '', // Will be set when saved
          userId: '', // Will be set when saved
          type: 'symptom',
          title: `Frequent ${symptom}`,
          description: `${symptom} has been reported in over 50% of your logs.`,
          recommendation: this.getSymptomRecommendation(symptom),
          severity: 'warning',
          createdAt: new Date(),
          relatedData: {
            symptoms: [symptom, ...relatedSymptoms.map(s => s.symptom)]
          }
        });
      }
    });

    return { correlations, insights };
  }

  // Analyze cycle patterns
  analyzeCycle(cycles: Array<{ startDate: Date; endDate: Date }>): {
    analysis: CycleAnalysis;
    insights: HealthInsight[];
  } {
    const cycleLengths = cycles.map(c => 
      Math.ceil((c.endDate.getTime() - c.startDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    const averageCycleLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const regularityScore = this.calculateRegularityScore(cycleLengths);

    const analysis: CycleAnalysis = {
      averageCycleLength,
      averagePeriodLength: 5, // Placeholder - would calculate from actual period data
      regularityScore,
      ovulationPredictability: regularityScore * 0.9, // Simplified calculation
      temperatureShiftDetected: true, // Placeholder - would be determined from temperature data
      lutealPhaseLength: 14 // Placeholder - would calculate from actual data
    };

    const insights: HealthInsight[] = [];

    if (regularityScore < 70) {
      insights.push({
        id: '', // Will be set when saved
        userId: '', // Will be set when saved
        type: 'cycle',
        title: 'Irregular Cycles Detected',
        description: 'Your cycle lengths have been varying significantly.',
        recommendation: 'Consider tracking additional factors like stress and sleep that might affect cycle regularity.',
        severity: 'info',
        createdAt: new Date(),
        relatedData: {
          values: cycleLengths
        }
      });
    }

    return { analysis, insights };
  }

  // Save insights to Firestore
  async saveInsights(userId: string, insights: HealthInsight[]): Promise<void> {
    const batch = insights.map(insight =>
      addDoc(collection(db, this.INSIGHTS_COLLECTION), {
        ...insight,
        userId,
        createdAt: serverTimestamp()
      })
    );

    await Promise.all(batch);
  }

  // Save insight summary
  async saveSummary(summary: Omit<InsightSummary, 'lastAnalysis'>): Promise<void> {
    await addDoc(collection(db, this.SUMMARY_COLLECTION), {
      ...summary,
      lastAnalysis: serverTimestamp()
    });
  }

  // Get recent insights
  async getRecentInsights(userId: string): Promise<HealthInsight[]> {
    const q = query(
      collection(db, this.INSIGHTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      where('createdAt', '>', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))) // Last 30 days
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate()
    })) as HealthInsight[];
  }

  // Private helper methods
  private calculateAverageBasal(temperatures: TemperatureData[]): number {
    return temperatures.reduce((sum, t) => sum + t.value, 0) / temperatures.length;
  }

  private detectTemperatureShift(temperatures: TemperatureData[]): number {
    // Simplified algorithm - in reality, would use more sophisticated detection
    const midPoint = Math.floor(temperatures.length / 2);
    const firstHalf = temperatures.slice(0, midPoint);
    const secondHalf = temperatures.slice(midPoint);

    const firstHalfAvg = firstHalf.reduce((sum, t) => sum + t.value, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, t) => sum + t.value, 0) / secondHalf.length;

    return secondHalfAvg - firstHalfAvg;
  }

  private calculateRegularityScore(cycleLengths: number[]): number {
    if (cycleLengths.length < 2) return 100;

    const avg = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / cycleLengths.length;
    const stdDev = Math.sqrt(variance);

    // Score decreases as standard deviation increases
    return Math.max(0, Math.min(100, 100 - (stdDev * 10)));
  }

  private getSymptomRecommendation(symptom: string): string {
    const recommendations: Record<string, string> = {
      'headache': 'Consider tracking water intake and stress levels. Regular exercise might help reduce frequency.',
      'cramps': 'Try gentle exercise, a heating pad, or over-the-counter pain relief. Consult your doctor if severe.',
      'fatigue': 'Focus on getting regular sleep and maintaining a balanced diet. Consider iron-rich foods.',
      'bloating': 'Try reducing salt intake and eating smaller, more frequent meals. Stay hydrated.',
      'mood changes': 'Practice stress-reduction techniques like meditation or yoga. Maintain regular exercise.',
      'acne': 'Keep skin clean and consider tracking food triggers. Consult a dermatologist if persistent.',
      'breast tenderness': 'Wear a supportive bra and consider reducing caffeine intake.',
      'nausea': 'Try eating small, frequent meals and staying hydrated. Ginger tea might help.'
    };

    return recommendations[symptom.toLowerCase()] || 
      'Track when this symptom occurs to identify potential triggers and patterns.';
  }
}

export const healthInsightService = new HealthInsightService(); 