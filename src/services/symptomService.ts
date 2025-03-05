import { 
  collection, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  setDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  SymptomLog, 
  FirestoreSymptomLog, 
  PhysicalStats,
  DailySymptomSummary 
} from '../types/symptoms';
import { v4 as uuidv4 } from 'uuid';

interface CreateSymptomLog {
  userId: string;
  symptoms: string[];
  moods: string[];
  physicalStats: PhysicalStats;
  notes: string;
}

export const SymptomService = {
  async addSymptomLog(userId: string, log: CreateSymptomLog) {
    try {
      const docRef = await addDoc(collection(db, 'symptomLogs'), {
        ...log,
        userId,
        date: Timestamp.fromDate(new Date())
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding symptom log:', error);
      throw error;
    }
  },

  async updateSymptomLog(logId: string, updates: Partial<SymptomLog>) {
    try {
      const docRef = doc(db, 'symptomLogs', logId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating symptom log:', error);
      throw error;
    }
  },

  async getDailyLogs(userId: string, startDate: Date, endDate: Date): Promise<SymptomLog[]> {
    try {
      const q = query(
        collection(db, 'symptomLogs'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: (data.date as Timestamp).toDate()
        } as SymptomLog;
      });
    } catch (error) {
      console.error('Error getting daily logs:', error);
      throw error;
    }
  },

  async getDailySummary(userId: string, date: Date): Promise<DailySymptomSummary> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, 'symptomLogs'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: (data.date as Timestamp).toDate()
        } as SymptomLog;
      });

      if (logs.length === 0) {
        return {
          date: date.toISOString(),
          symptoms: [],
          moods: [],
          physicalStats: {
            temperature: undefined,
            weight: undefined,
            bloodPressure: undefined
          },
          notes: ''
        };
      }

      // Combine all logs for the day
      return {
        date: date.toISOString(),
        symptoms: [...new Set(logs.flatMap(log => log.symptoms))],
        moods: [...new Set(logs.flatMap(log => log.moods))],
        physicalStats: logs[0].physicalStats,
        notes: logs.map(log => log.notes).filter(Boolean).join('\n')
      };
    } catch (error) {
      console.error('Error getting daily summary:', error);
      throw error;
    }
  }
}; 