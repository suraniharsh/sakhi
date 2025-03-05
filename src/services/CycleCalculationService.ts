import { addDays, subDays, differenceInDays, isSameDay, isWithinInterval, isAfter, isBefore } from 'date-fns';

export interface PeriodLog {
  id?: string;
  startDate: Date;
  endDate: Date;
  flow: 'light' | 'medium' | 'heavy';
}

export interface CycleDay {
  date: Date;
  phase: 'period' | 'fertile' | 'ovulation' | 'unknown';
  intensity: 'light' | 'medium' | 'heavy' | 'none';
  prediction?: boolean;
}

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

interface PhaseInfo {
  name: string;
  description: string;
  symptoms: string[];
  duration: number;
}

export const PHASE_INFO: Record<CyclePhase, PhaseInfo> = {
  menstrual: {
    name: 'Menstrual Phase',
    description: 'Your period is here',
    symptoms: [
      'Menstrual flow',
      'Possible cramps',
      'May feel tired',
    ],
    duration: 5,
  },
  follicular: {
    name: 'Follicular Phase',
    description: 'Building up energy',
    symptoms: [
      'Increasing energy',
      'Enhanced mood',
      'Skin improvements',
    ],
    duration: 7,
  },
  ovulation: {
    name: 'Ovulation Phase',
    description: 'High fertility window',
    symptoms: [
      'Increased energy levels',
      'Peak fertility',
      'Heightened sense of well-being',
    ],
    duration: 4,
  },
  luteal: {
    name: 'Luteal Phase',
    description: 'Post-ovulation phase',
    symptoms: [
      'Possible mood changes',
      'Energy levels decreasing',
      'May experience PMS',
    ],
    duration: 12,
  },
};

export class CycleCalculationService {
  private periodLogs: PeriodLog[] = [];
  private readonly DEFAULT_CYCLE_LENGTH = 28;
  private readonly DEFAULT_PERIOD_LENGTH = 6;
  private readonly MIN_LOGS_FOR_PREDICTION = 1;

  clearLogs(): void {
    this.periodLogs = [];
  }

  addPeriodLog(log: PeriodLog): void {
    // Ensure dates are Date objects
    const newLog = {
      ...log,
      startDate: new Date(log.startDate),
      endDate: new Date(log.endDate)
    };
    this.periodLogs.push(newLog);
    
    // Sort logs by start date in descending order (newest first)
    this.periodLogs.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  private calculateAverageCycleLength(): number {
    if (this.periodLogs.length < 2) return this.DEFAULT_CYCLE_LENGTH;

    let totalDays = 0;
    let validCycles = 0;

    // Calculate cycle lengths between consecutive periods
    for (let i = 0; i < this.periodLogs.length - 1; i++) {
      const currentStart = this.periodLogs[i].startDate;
      const nextStart = this.periodLogs[i + 1].startDate;
      const cycleDays = differenceInDays(currentStart, nextStart);

      // Only count reasonable cycle lengths (21-35 days)
      if (cycleDays >= 21 && cycleDays <= 35) {
        totalDays += cycleDays;
        validCycles++;
      }
    }

    return validCycles > 0 ? Math.round(totalDays / validCycles) : this.DEFAULT_CYCLE_LENGTH;
  }

  private calculateAveragePeriodLength(): number {
    if (this.periodLogs.length === 0) return this.DEFAULT_PERIOD_LENGTH;

    let totalDays = 0;
    let validPeriods = 0;

    this.periodLogs.forEach(log => {
      const periodDays = differenceInDays(log.endDate, log.startDate) + 1;
      
      // Only count reasonable period lengths (3-10 days)
      if (periodDays >= 3 && periodDays <= 10) {
        totalDays += periodDays;
        validPeriods++;
      }
    });

    return validPeriods > 0 ? Math.round(totalDays / validPeriods) : this.DEFAULT_PERIOD_LENGTH;
  }

  predictNextCycle(fromDate: Date = new Date()): CycleDay[] {
    const cycleDays: CycleDay[] = [];
    
    // If no logs, return empty array
    if (this.periodLogs.length === 0) {
      console.log('No period logs available for predictions');
      return cycleDays;
    }

    console.log('Calculating predictions from:', fromDate);
    console.log('Available period logs:', this.periodLogs);

    // Add past periods first
    this.periodLogs.forEach(log => {
      const days = differenceInDays(log.endDate, log.startDate) + 1;
      for (let i = 0; i < days; i++) {
        const date = addDays(log.startDate, i);
        cycleDays.push({
          date,
          phase: 'period',
          intensity: i === 0 ? 'heavy' : i < 2 ? 'medium' : 'light',
          prediction: false
        });
      }
    });

    const mostRecentPeriod = this.periodLogs[0];
    const cycleLength = this.calculateAverageCycleLength();
    const periodLength = this.calculateAveragePeriodLength();

    console.log('Calculation parameters:', {
      mostRecentPeriod,
      cycleLength,
      periodLength
    });

    // Calculate next period start date
    let nextPeriodStart: Date;
    if (isAfter(fromDate, mostRecentPeriod.startDate)) {
      const daysSinceLastPeriod = differenceInDays(fromDate, mostRecentPeriod.startDate);
      const daysUntilNextPeriod = cycleLength - (daysSinceLastPeriod % cycleLength);
      nextPeriodStart = addDays(fromDate, daysUntilNextPeriod);
      console.log('Next period calculation:', {
        daysSinceLastPeriod,
        daysUntilNextPeriod,
        nextPeriodStart
      });
    } else {
      nextPeriodStart = mostRecentPeriod.startDate;
      console.log('Using most recent period as next start:', nextPeriodStart);
    }

    // Generate predictions for the next 3 cycles
    for (let cycle = 0; cycle < 3; cycle++) {
      const cycleStartDate = addDays(nextPeriodStart, cycle * cycleLength);
      console.log(`Generating predictions for cycle ${cycle + 1}, starting:`, cycleStartDate);
      
      // Period phase
      for (let day = 0; day < periodLength; day++) {
        const date = addDays(cycleStartDate, day);
        // Only add if not already a logged period
        if (!cycleDays.some(d => isSameDay(d.date, date))) {
          cycleDays.push({
            date,
            phase: 'period',
            intensity: day === 0 ? 'heavy' : day < 2 ? 'medium' : 'light',
            prediction: true
          });
        }
      }

      // Calculate ovulation (14 days before next period)
      const nextCycleStart = addDays(cycleStartDate, cycleLength);
      const ovulationDay = subDays(nextCycleStart, 14);
      console.log(`Cycle ${cycle + 1} ovulation day:`, ovulationDay);
      
      // Add fertile window (5 days before ovulation and ovulation day)
      for (let day = -5; day <= 0; day++) {
        const date = addDays(ovulationDay, day);
        if (!cycleDays.some(d => isSameDay(d.date, date))) {
          cycleDays.push({
            date,
            phase: day === 0 ? 'ovulation' : 'fertile',
            intensity: 'none',
            prediction: true
          });
        }
      }
    }

    // Sort days by date
    const sortedDays = cycleDays.sort((a, b) => a.date.getTime() - b.date.getTime());
    console.log('Generated cycle days:', sortedDays);
    return sortedDays;
  }

  getCurrentPhase(date: Date = new Date()): { phase: string; daysUntil: number } {
    if (this.periodLogs.length === 0) {
      return { phase: 'unknown', daysUntil: 0 };
    }

    const predictions = this.predictNextCycle(date);
    const currentDayPrediction = predictions.find(day => isSameDay(day.date, date));

    if (currentDayPrediction) {
      return {
        phase: currentDayPrediction.phase,
        daysUntil: 0
      };
    }

    // Find the next predicted phase change
    const nextPrediction = predictions.find(day => isAfter(day.date, date));
    if (nextPrediction) {
      return {
        phase: nextPrediction.phase,
        daysUntil: differenceInDays(nextPrediction.date, date)
      };
    }

    return { phase: 'unknown', daysUntil: 0 };
  }

  getPeriodLogs(): PeriodLog[] {
    return [...this.periodLogs];
  }

  getFertilityInfo(date: Date = new Date()): {
    isFertile: boolean;
    isOvulation: boolean;
    nextFertileStart?: Date;
    nextOvulation?: Date;
  } {
    if (this.periodLogs.length === 0) {
      return {
        isFertile: false,
        isOvulation: false
      };
    }

    const predictions = this.predictNextCycle(date);
    const currentDay = predictions.find(day => isSameDay(day.date, date));
    
    // Check current day status
    const isFertile = currentDay?.phase === 'fertile' || currentDay?.phase === 'ovulation';
    const isOvulation = currentDay?.phase === 'ovulation';

    // Find next fertile window and ovulation
    const futureDays = predictions.filter(day => isAfter(day.date, date));
    const nextFertileDay = futureDays.find(
      day => day.phase === 'fertile' || day.phase === 'ovulation'
    );
    const nextOvulationDay = futureDays.find(
      day => day.phase === 'ovulation'
    );

    return {
      isFertile,
      isOvulation,
      nextFertileStart: nextFertileDay?.date,
      nextOvulation: nextOvulationDay?.date
    };
  }

  static calculateCurrentPhase(lastPeriodDate: Date, cycleLength: number = 28): {
    phase: CyclePhase;
    dayOfCycle: number;
    daysUntilNextPhase: number;
    nextPeriodIn: number;
    phaseInfo: PhaseInfo;
  } {
    const today = new Date();
    const dayOfCycle = differenceInDays(today, lastPeriodDate) + 1;
    
    // Calculate phase based on typical cycle
    let phase: CyclePhase;
    let daysUntilNextPhase: number;

    if (dayOfCycle <= 5) {
      phase = 'menstrual';
      daysUntilNextPhase = 5 - dayOfCycle + 1;
    } else if (dayOfCycle <= 12) {
      phase = 'follicular';
      daysUntilNextPhase = 12 - dayOfCycle + 1;
    } else if (dayOfCycle <= 16) {
      phase = 'ovulation';
      daysUntilNextPhase = 16 - dayOfCycle + 1;
    } else {
      phase = 'luteal';
      daysUntilNextPhase = cycleLength - dayOfCycle + 1;
    }

    // Calculate days until next period
    const nextPeriodDate = addDays(lastPeriodDate, cycleLength);
    const nextPeriodIn = differenceInDays(nextPeriodDate, today);

    return {
      phase,
      dayOfCycle,
      daysUntilNextPhase,
      nextPeriodIn,
      phaseInfo: PHASE_INFO[phase],
    };
  }

  static getPhaseColor(phase: CyclePhase): {
    from: string;
    to: string;
  } {
    const colors = {
      menstrual: { from: 'from-red-400', to: 'to-red-500' },
      follicular: { from: 'from-blue-400', to: 'to-blue-500' },
      ovulation: { from: 'from-pink-500', to: 'to-purple-500' },
      luteal: { from: 'from-purple-400', to: 'to-purple-500' },
    };

    return colors[phase];
  }

  static getPhaseIcon(phase: CyclePhase): string {
    const icons = {
      menstrual: '🌊',
      follicular: '🌱',
      ovulation: '🌟',
      luteal: '🌙',
    };

    return icons[phase];
  }
} 