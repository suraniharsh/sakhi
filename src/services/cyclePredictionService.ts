import { CycleLog, CyclePrediction, CyclePhase, FlowIntensity } from '../types/cycle';

interface CycleAnalysis {
  mean: number;
  standardDeviation: number;
  regularityScore: number;
  isRegular: boolean;
}

export class CyclePredictionService {
  private static readonly REGULARITY_THRESHOLD = 0.15; // 15% variation coefficient for regularity
  private static readonly MIN_CYCLES_FOR_PREDICTION = 3;
  private static readonly TYPICAL_PHASE_LENGTHS = {
    menstrual: { min: 3, max: 7 },
    follicular: { min: 7, max: 14 },
    ovulation: { min: 1, max: 2 },
    luteal: { min: 12, max: 16 }
  };

  /**
   * Analyzes cycle patterns using statistical methods
   */
  private static analyzeCycles(cycles: CycleLog[]): CycleAnalysis {
    if (cycles.length < this.MIN_CYCLES_FOR_PREDICTION) {
      throw new Error('Not enough cycle data for analysis');
    }

    // Calculate cycle lengths
    const lengths = cycles
      .filter(cycle => cycle.endDate && cycle.length)
      .map(cycle => cycle.length!);

    // Calculate mean
    const mean = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;

    // Calculate standard deviation
    const variance = lengths.reduce((sum, len) => {
      const diff = len - mean;
      return sum + (diff * diff);
    }, 0) / lengths.length;
    const standardDeviation = Math.sqrt(variance);

    // Calculate regularity score
    const variationCoefficient = standardDeviation / mean;
    const regularityScore = Math.max(0, Math.min(100, 100 * (1 - variationCoefficient / 0.3)));
    const isRegular = variationCoefficient <= this.REGULARITY_THRESHOLD;

    return {
      mean,
      standardDeviation,
      regularityScore,
      isRegular
    };
  }

  /**
   * Predicts the next cycle using advanced statistical modeling
   */
  static predictNextCycle(cycles: CycleLog[]): Omit<CyclePrediction, 'id' | 'userId'> {
    const analysis = this.analyzeCycles(cycles);
    const lastCycle = cycles[0]; // Assuming cycles are sorted desc

    // Calculate next period start date using weighted average
    const recentCycles = cycles.slice(0, Math.min(6, cycles.length));
    const weights = recentCycles.map((_, i) => Math.pow(0.8, i)); // Exponential decay weights
    const weightedSum = recentCycles.reduce((sum, cycle, i) => sum + (cycle.length || analysis.mean) * weights[i], 0);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const predictedLength = weightedSum / totalWeight;

    const nextStart = new Date(lastCycle.startDate.getTime() + predictedLength * 24 * 60 * 60 * 1000);
    const nextEnd = new Date(nextStart.getTime() + analysis.mean * 24 * 60 * 60 * 1000);

    // Predict cycle phases
    const phasesPrediction = this.predictCyclePhases(nextStart, analysis.mean);

    // Calculate confidence based on multiple factors
    const confidence = this.calculatePredictionConfidence(analysis, cycles.length);

    return {
      nextPeriodStart: nextStart,
      nextPeriodEnd: nextEnd,
      confidence,
      basedOnCycles: cycles.length,
      averageCycleLength: analysis.mean,
      standardDeviation: analysis.standardDeviation,
      regularityScore: analysis.regularityScore,
      phasesPrediction,
      lastUpdated: new Date()
    };
  }

  /**
   * Predicts the timing of different cycle phases
   */
  private static predictCyclePhases(cycleStart: Date, cycleLength: number) {
    const totalPhaseLength = Object.values(this.TYPICAL_PHASE_LENGTHS)
      .reduce((sum, { min, max }) => sum + (min + max) / 2, 0);
    
    const scaleFactor = cycleLength / totalPhaseLength;

    let currentDate = new Date(cycleStart);
    const phases = {} as CyclePrediction['phasesPrediction'];

    // Calculate each phase
    for (const [phase, { min, max }] of Object.entries(this.TYPICAL_PHASE_LENGTHS)) {
      const avgLength = ((min + max) / 2) * scaleFactor;
      const start = new Date(currentDate);
      const end = new Date(currentDate.getTime() + avgLength * 24 * 60 * 60 * 1000);
      
      phases[phase as CyclePhase] = { start, end };
      currentDate = end;
    }

    return phases;
  }

  /**
   * Calculates prediction confidence based on multiple factors
   */
  private static calculatePredictionConfidence(
    analysis: CycleAnalysis,
    cycleCount: number
  ): number {
    // Base confidence from regularity
    let confidence = analysis.regularityScore;

    // Adjust based on number of cycles logged
    const cycleCountFactor = Math.min(1, (cycleCount - this.MIN_CYCLES_FOR_PREDICTION) / 9);
    confidence *= (0.7 + 0.3 * cycleCountFactor);

    // Adjust based on standard deviation relative to mean
    const variationPenalty = Math.max(0, 1 - analysis.standardDeviation / analysis.mean);
    confidence *= (0.8 + 0.2 * variationPenalty);

    return Math.round(Math.max(0, Math.min(100, confidence)));
  }

  /**
   * Analyzes flow patterns to detect irregularities
   */
  static analyzeFlowPatterns(cycles: CycleLog[]): Record<FlowIntensity, { frequency: number; avgDuration: number }> {
    const patterns: Record<FlowIntensity, { count: number; totalDays: number }> = 
      Object.values(FlowIntensity).reduce((acc, flow) => ({
        ...acc,
        [flow]: { count: 0, totalDays: 0 }
      }), {} as any);

    // Analyze each cycle's flow patterns
    cycles.forEach(cycle => {
      cycle.days.forEach(day => {
        if (day.flow) {
          patterns[day.flow].count++;
          patterns[day.flow].totalDays++;
        }
      });
    });

    // Calculate frequencies and average durations
    const totalDays = Object.values(patterns).reduce((sum, { totalDays }) => sum + totalDays, 0);
    return Object.entries(patterns).reduce((acc, [flow, { count, totalDays }]) => ({
      ...acc,
      [flow]: {
        frequency: Math.round((totalDays / (totalDays || 1)) * 100),
        avgDuration: count ? totalDays / count : 0
      }
    }), {} as Record<FlowIntensity, { frequency: number; avgDuration: number }>);
  }
} 