import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PregnancyData, PregnancyJournal, PregnancySettings, WeeklyMilestone } from '../types/pregnancy';
import { milestoneData } from '../data/pregnancyMilestones';

class PregnancyService {
  private readonly PREGNANCY_COLLECTION = 'pregnancies';
  private readonly JOURNAL_COLLECTION = 'pregnancyJournals';
  private readonly SETTINGS_COLLECTION = 'pregnancySettings';

  // Calculate due date based on last period date
  calculateDueDate(lastPeriodDate: Date): Date {
    const dueDate = new Date(lastPeriodDate);
    dueDate.setDate(dueDate.getDate() + 280); // 40 weeks
    return dueDate;
  }

  // Calculate current pregnancy week
  calculateCurrentWeek(lastPeriodDate: Date): number {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastPeriodDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  }

  // Get milestone data for current week
  getMilestoneData(week: number): WeeklyMilestone | null {
    return milestoneData.find(m => m.week === week) || null;
  }

  // Start pregnancy tracking
  async startPregnancyTracking(userId: string, lastPeriodDate: Date): Promise<string> {
    const dueDate = this.calculateDueDate(lastPeriodDate);
    const currentWeek = this.calculateCurrentWeek(lastPeriodDate);

    const pregnancy: Omit<PregnancyData, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      lastPeriodDate,
      dueDate,
      currentWeek,
    };

    const docRef = await addDoc(collection(db, this.PREGNANCY_COLLECTION), {
      ...pregnancy,
      lastPeriodDate: Timestamp.fromDate(lastPeriodDate),
      dueDate: Timestamp.fromDate(dueDate),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  }

  // Get pregnancy data
  async getPregnancyData(userId: string): Promise<PregnancyData | null> {
    const q = query(
      collection(db, this.PREGNANCY_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      where('currentWeek', '<=', 42) // Only show active pregnancies
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      lastPeriodDate: (doc.data().lastPeriodDate as Timestamp).toDate(),
      dueDate: (doc.data().dueDate as Timestamp).toDate(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate()
    } as PregnancyData;
  }

  // Add journal entry
  async addJournalEntry(entry: Omit<PregnancyJournal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.JOURNAL_COLLECTION), {
      ...entry,
      date: Timestamp.fromDate(entry.date),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  }

  // Get journal entries
  async getJournalEntries(pregnancyId: string): Promise<PregnancyJournal[]> {
    const q = query(
      collection(db, this.JOURNAL_COLLECTION),
      where('pregnancyId', '==', pregnancyId),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: (doc.data().date as Timestamp).toDate(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate()
    })) as PregnancyJournal[];
  }

  // Get or create settings
  async getSettings(userId: string): Promise<PregnancySettings> {
    const q = query(
      collection(db, this.SETTINGS_COLLECTION),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as PregnancySettings;
    }

    const defaultSettings: PregnancySettings = {
      userId,
      weightUnit: 'kg',
      lengthUnit: 'cm',
      weeklyReminders: true,
      appointmentReminders: true,
      nutritionReminders: true
    };

    await addDoc(collection(db, this.SETTINGS_COLLECTION), defaultSettings);
    return defaultSettings;
  }

  // Update settings
  async updateSettings(userId: string, settings: Partial<PregnancySettings>): Promise<void> {
    const q = query(
      collection(db, this.SETTINGS_COLLECTION),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await updateDoc(doc(db, this.SETTINGS_COLLECTION, snapshot.docs[0].id), settings);
    }
  }

  // Get personalized insights
  getPersonalizedInsights(week: number, journalEntries: PregnancyJournal[]): string[] {
    const insights: string[] = [];
    const milestone = this.getMilestoneData(week);
    
    if (!milestone) return insights;

    // Add milestone-based insights
    insights.push(...milestone.nutritionTips);
    insights.push(...milestone.exerciseTips);

    // Add symptom-based insights
    const recentEntry = journalEntries[0];
    if (recentEntry?.symptoms?.includes('nausea')) {
      insights.push('Try eating small, frequent meals to help with morning sickness');
    }
    if (recentEntry?.symptoms?.includes('fatigue')) {
      insights.push('Consider taking short naps during the day to combat fatigue');
    }

    return insights;
  }
}

export const pregnancyService = new PregnancyService(); 