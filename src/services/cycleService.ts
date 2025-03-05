import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { CycleLog, CyclePrediction, CycleStatistics, FlowIntensity, Symptom } from '../types/cycle';

const CYCLES_COLLECTION = 'cycles';
const PREDICTIONS_COLLECTION = 'predictions';
const STATISTICS_COLLECTION = 'statistics';

export const cycleService = {
  // Log a new cycle
  async logCycle(userId: string, startDate: Date, flow: FlowIntensity, symptoms: Symptom[] = [], notes?: string): Promise<string> {
    const cycleData: Omit<CycleLog, 'id'> = {
      userId,
      startDate,
      endDate: null,
      flow,
      symptoms,
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, CYCLES_COLLECTION), {
      ...cycleData,
      startDate: Timestamp.fromDate(startDate),
      createdAt: Timestamp.fromDate(cycleData.createdAt),
      updatedAt: Timestamp.fromDate(cycleData.updatedAt),
    });

    return docRef.id;
  },

  // End current cycle
  async endCycle(cycleId: string, endDate: Date): Promise<void> {
    const cycleRef = doc(db, CYCLES_COLLECTION, cycleId);
    await updateDoc(cycleRef, {
      endDate: Timestamp.fromDate(endDate),
      updatedAt: Timestamp.fromDate(new Date()),
    });
  },

  // Get user's cycle history
  async getCycleHistory(userId: string, limitCount: number = 12): Promise<CycleLog[]> {
    const cyclesQuery = query(
      collection(db, CYCLES_COLLECTION),
      where('userId', '==', userId),
      orderBy('startDate', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(cyclesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: (doc.data().startDate as Timestamp).toDate(),
      endDate: doc.data().endDate ? (doc.data().endDate as Timestamp).toDate() : null,
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
    })) as CycleLog[];
  },

  // Get latest prediction
  async getLatestPrediction(userId: string): Promise<CyclePrediction | null> {
    const predictionQuery = query(
      collection(db, PREDICTIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('lastUpdated', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(predictionQuery);
    if (snapshot.empty) return null;

    const predictionData = snapshot.docs[0].data();
    return {
      ...predictionData,
      nextPeriodStart: (predictionData.nextPeriodStart as Timestamp).toDate(),
      nextPeriodEnd: (predictionData.nextPeriodEnd as Timestamp).toDate(),
      lastUpdated: (predictionData.lastUpdated as Timestamp).toDate(),
    } as CyclePrediction;
  },

  // Get cycle statistics
  async getCycleStatistics(userId: string): Promise<CycleStatistics | null> {
    const statsQuery = query(
      collection(db, STATISTICS_COLLECTION),
      where('userId', '==', userId),
      limit(1)
    );

    const snapshot = await getDocs(statsQuery);
    if (snapshot.empty) return null;

    const statsData = snapshot.docs[0].data();
    return {
      ...statsData,
      lastCalculated: (statsData.lastCalculated as Timestamp).toDate(),
    } as CycleStatistics;
  },

  // Update symptoms for a cycle
  async updateSymptoms(cycleId: string, symptoms: Symptom[]): Promise<void> {
    const cycleRef = doc(db, CYCLES_COLLECTION, cycleId);
    await updateDoc(cycleRef, {
      symptoms,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  },

  // Update flow intensity
  async updateFlow(cycleId: string, flow: FlowIntensity): Promise<void> {
    const cycleRef = doc(db, CYCLES_COLLECTION, cycleId);
    await updateDoc(cycleRef, {
      flow,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  },
}; 