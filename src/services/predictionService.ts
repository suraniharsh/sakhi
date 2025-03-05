import { db } from '../config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { cycleService } from './cycleService';
import { CycleLog, CyclePrediction, CycleStatistics } from '../types/cycle';

const PREDICTIONS_COLLECTION = 'predictions';
const MIN_CYCLES_FOR_PREDICTION = 3;
const MAX_CYCLES_FOR_ANALYSIS = 12;

export const predictionService = {
  // Calculate average cycle length and standard deviation
  calculateCycleStats(cycles: CycleLog[]): { avgLength: number; stdDev: number } {
    if (cycles.length < MIN_CYCLES_FOR_PREDICTION) {
      throw new Error('Not enough cycle data for prediction');
    }

    const lengths = cycles
      .filter(cycle => cycle.endDate)
      .map(cycle => {
        const start = cycle.startDate.getTime();
        const end = cycle.endDate!.getTime();
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      });

    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    
    const variance = lengths.reduce((sum, len) => {
      const diff = len - avgLength;
      return sum + (diff * diff);
    }, 0) / lengths.length;

    return {
      avgLength,
      stdDev: Math.sqrt(variance)
    };
  },

  // Generate prediction for next cycle
  async generatePrediction(userId: string): Promise<CyclePrediction> {
    const cycles = await cycleService.getCycleHistory(userId, MAX_CYCLES_FOR_ANALYSIS);
    
    if (cycles.length < MIN_CYCLES_FOR_PREDICTION) {
      throw new Error('Not enough cycle data for prediction');
    }

    const { avgLength, stdDev } = this.calculateCycleStats(cycles);
    const lastCycle = cycles[0];
    const predictedStart = new Date(lastCycle.startDate.getTime() + (avgLength * 24 * 60 * 60 * 1000));
    const predictedEnd = new Date(predictedStart.getTime() + (avgLength * 24 * 60 * 60 * 1000));

    const prediction: Omit<CyclePrediction, 'id'> = {
      userId,
      nextPeriodStart: predictedStart,
      nextPeriodEnd: predictedEnd,
      confidence: this.calculateConfidence(stdDev, avgLength),
      basedOnCycles: cycles.length,
      averageCycleLength: avgLength,
      standardDeviation: stdDev,
      lastUpdated: new Date()
    };

    const docRef = await addDoc(collection(db, PREDICTIONS_COLLECTION), {
      ...prediction,
      nextPeriodStart: Timestamp.fromDate(predictedStart),
      nextPeriodEnd: Timestamp.fromDate(predictedEnd),
      lastUpdated: Timestamp.fromDate(prediction.lastUpdated)
    });

    return {
      id: docRef.id,
      ...prediction
    };
  },

  // Calculate prediction confidence based on standard deviation
  calculateConfidence(stdDev: number, avgLength: number): number {
    // Lower standard deviation relative to cycle length means higher confidence
    const variationCoefficient = stdDev / avgLength;
    
    // Convert to confidence percentage (0-100)
    // A variation coefficient of 0.1 (10%) or less is considered very good
    // A variation coefficient of 0.3 (30%) or more is considered poor
    const confidence = Math.max(0, Math.min(100, 100 * (1 - variationCoefficient / 0.3)));
    
    return Math.round(confidence);
  },

  // Update statistics for a user
  async updateStatistics(userId: string): Promise<CycleStatistics> {
    const cycles = await cycleService.getCycleHistory(userId, MAX_CYCLES_FOR_ANALYSIS);
    
    if (cycles.length < MIN_CYCLES_FOR_PREDICTION) {
      throw new Error('Not enough cycle data for statistics');
    }

    const { avgLength, stdDev } = this.calculateCycleStats(cycles);
    
    const stats: Omit<CycleStatistics, 'id'> = {
      userId,
      averageCycleLength: avgLength,
      shortestCycle: Math.min(...cycles.map(c => c.endDate ? 
        (c.endDate.getTime() - c.startDate.getTime()) / (1000 * 60 * 60 * 24) : Infinity)),
      longestCycle: Math.max(...cycles.map(c => c.endDate ? 
        (c.endDate.getTime() - c.startDate.getTime()) / (1000 * 60 * 60 * 24) : 0)),
      standardDeviation: stdDev,
      totalCyclesLogged: cycles.length,
      lastCalculated: new Date()
    };

    const docRef = await addDoc(collection(db, 'statistics'), {
      ...stats,
      lastCalculated: Timestamp.fromDate(stats.lastCalculated)
    });

    return {
      id: docRef.id,
      ...stats
    };
  }
}; 