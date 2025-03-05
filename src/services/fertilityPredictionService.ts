import { CycleLog } from '../types/cycle';
import {
  FertilityWindow,
  OvulationPrediction,
  FertilityType,
  FertilityPhase,
  FertilityStats,
  DailyFertilityStatus
} from '../types/fertility';

export class FertilityPredictionService {
  private static readonly MINIMUM_CYCLES_FOR_PREDICTION = 3;
  private static readonly HIGHLY_FERTILE_WINDOW = 3; // days before ovulation
  private static readonly FERTILE_WINDOW = 5; // days around ovulation
  private static readonly AVERAGE_LUTEAL_PHASE = 14; // days
  private static readonly SPERM_SURVIVAL_DAYS = 5;
  private static readonly EGG_SURVIVAL_HOURS = 24;

  /**
   * Calculate fertility statistics based on historical cycle data
   */
  static calculateFertilityStats(cycles: CycleLog[]): FertilityStats {
    if (cycles.length < this.MINIMUM_CYCLES_FOR_PREDICTION) {
      throw new Error('Insufficient cycle data for prediction');
    }

    const cycleLengths = cycles.map(cycle => 
      cycle.endDate ? 
        Math.round((cycle.endDate.getTime() - cycle.startDate.getTime()) / (1000 * 60 * 60 * 24)) :
        0
    ).filter(length => length > 0);

    // Estimate ovulation days (14 days before next period)
    const ovulationDays = cycles.map((cycle, index) => {
      if (index === cycles.length - 1) return null;
      const nextCycle = cycles[index + 1];
      const cycleLength = Math.round(
        (nextCycle.startDate.getTime() - cycle.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return cycleLength - this.AVERAGE_LUTEAL_PHASE;
    }).filter((day): day is number => day !== null);

    // Calculate cycle regularity (0-1)
    const avgCycleLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const cycleVariance = cycleLengths.reduce((acc, len) => 
      acc + Math.pow(len - avgCycleLength, 2), 0) / cycleLengths.length;
    const cycleRegularity = Math.max(0, Math.min(1, 1 - (Math.sqrt(cycleVariance) / avgCycleLength)));

    // Calculate confidence level based on regularity and number of cycles
    const confidenceLevel = Math.min(
      1,
      (cycleRegularity * 0.7 + Math.min(cycles.length / 12, 1) * 0.3)
    );

    return {
      averageOvulationDay: Math.round(
        ovulationDays.reduce((a, b) => a + b, 0) / ovulationDays.length
      ),
      cycleRegularity,
      confidenceLevel,
      lastCalculated: new Date(),
      historicalData: {
        ovulationDays,
        cycleLengths,
        lutealPhaseLengths: ovulationDays.map(day => this.AVERAGE_LUTEAL_PHASE)
      }
    };
  }

  /**
   * Predict next ovulation and fertility windows
   */
  static predictNextOvulation(
    cycles: CycleLog[],
    stats: FertilityStats
  ): OvulationPrediction {
    const lastCycle = cycles[0];
    const expectedOvulationDate = new Date(lastCycle.startDate);
    expectedOvulationDate.setDate(
      expectedOvulationDate.getDate() + stats.averageOvulationDay
    );

    // Calculate fertility windows
    const fertilityWindows: FertilityWindow[] = [
      // Highly fertile window (3 days before ovulation)
      {
        start: new Date(expectedOvulationDate.getTime() - (this.HIGHLY_FERTILE_WINDOW * 24 * 60 * 60 * 1000)),
        end: expectedOvulationDate,
        type: FertilityType.HIGHLY_FERTILE,
        probability: 0.3
      },
      // Fertile window (includes ovulation day and day after)
      {
        start: expectedOvulationDate,
        end: new Date(expectedOvulationDate.getTime() + (2 * 24 * 60 * 60 * 1000)),
        type: FertilityType.FERTILE,
        probability: 0.2
      },
      // Less fertile window
      {
        start: new Date(expectedOvulationDate.getTime() - ((this.HIGHLY_FERTILE_WINDOW + 2) * 24 * 60 * 60 * 1000)),
        end: new Date(expectedOvulationDate.getTime() - (this.HIGHLY_FERTILE_WINDOW * 24 * 60 * 60 * 1000)),
        type: FertilityType.LESS_FERTILE,
        probability: 0.1
      }
    ];

    return {
      expectedDate: expectedOvulationDate,
      confidence: stats.confidenceLevel,
      fertilityWindows
    };
  }

  /**
   * Calculate daily fertility status for a given date range
   */
  static calculateDailyFertilityStatus(
    startDate: Date,
    endDate: Date,
    prediction: OvulationPrediction
  ): DailyFertilityStatus[] {
    const dailyStatus: DailyFertilityStatus[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const status: DailyFertilityStatus = {
        date: new Date(currentDate),
        phase: this.determineFertilityPhase(currentDate, prediction),
        probability: this.calculateDailyProbability(currentDate, prediction),
        notes: this.generateDailyNotes(currentDate, prediction)
      };

      dailyStatus.push(status);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailyStatus;
  }

  /**
   * Determine fertility phase for a given date
   */
  private static determineFertilityPhase(
    date: Date,
    prediction: OvulationPrediction
  ): FertilityPhase {
    const daysDiff = Math.round(
      (date.getTime() - prediction.expectedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) return FertilityPhase.OVULATION;
    if (daysDiff < 0 && daysDiff >= -5) return FertilityPhase.FOLLICULAR;
    if (daysDiff > 0 && daysDiff <= 14) return FertilityPhase.LUTEAL;
    return FertilityPhase.FOLLICULAR;
  }

  /**
   * Calculate probability of conception for a given date
   */
  private static calculateDailyProbability(
    date: Date,
    prediction: OvulationPrediction
  ): number {
    const window = prediction.fertilityWindows.find(w => 
      date >= w.start && date <= w.end
    );
    return window ? window.probability * prediction.confidence : 0;
  }

  /**
   * Generate helpful notes for a given date
   */
  private static generateDailyNotes(
    date: Date,
    prediction: OvulationPrediction
  ): string[] {
    const notes: string[] = [];
    const daysDiff = Math.round(
      (date.getTime() - prediction.expectedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      notes.push('Ovulation day - highest chance of conception');
      notes.push('Egg survives for about 24 hours after release');
    } else if (daysDiff >= -3 && daysDiff < 0) {
      notes.push('Highly fertile days - recommended for conception');
      notes.push('Sperm can survive up to 5 days in fertile cervical mucus');
    }

    return notes;
  }
} 