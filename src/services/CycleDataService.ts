import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { PeriodLog } from './CycleCalculationService';

export class CycleDataService {
  private userId: string;
  private collectionRef;

  constructor(userId: string) {
    this.userId = userId;
    this.collectionRef = collection(db, 'periodLogs');
  }

  private validatePeriodLog(log: PeriodLog): string | null {
    if (!log.startDate || !log.endDate) {
      return 'Start date and end date are required';
    }
    if (log.endDate < log.startDate) {
      return 'End date cannot be before start date';
    }
    if (!['light', 'medium', 'heavy'].includes(log.flow)) {
      return 'Invalid flow intensity';
    }
    return null;
  }

  async savePeriodLog(log: PeriodLog): Promise<string> {
    try {
      // Validate the log
      const validationError = this.validatePeriodLog(log);
      if (validationError) {
        throw new Error(validationError);
      }

      // Convert dates to Firestore Timestamps
      const docData = {
        userId: this.userId,
        startDate: Timestamp.fromDate(log.startDate),
        endDate: Timestamp.fromDate(log.endDate),
        flow: log.flow,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(this.collectionRef, docData);
      console.log('Period log saved successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving period log:', error);
      throw error;
    }
  }

  async getPeriodLogs(): Promise<PeriodLog[]> {
    try {
      // Try without ordering first
      const q = query(
        this.collectionRef,
        where('userId', '==', this.userId)
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`Retrieved ${querySnapshot.size} period logs`);
      
      const logs = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          startDate: (data.startDate as Timestamp).toDate(),
          endDate: (data.endDate as Timestamp).toDate(),
          flow: data.flow
        };
      });

      // Sort in memory instead of using orderBy
      return logs.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    } catch (error) {
      console.error('Error getting period logs:', error);
      throw error;
    }
  }

  async updatePeriodLog(logId: string, updates: Partial<PeriodLog>): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, logId);
      const updateData: any = {
        updatedAt: serverTimestamp()
      };
      
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(updates.endDate);
      }
      if (updates.flow) {
        updateData.flow = updates.flow;
      }
      
      await updateDoc(docRef, updateData);
      console.log('Period log updated successfully:', logId);
    } catch (error) {
      console.error('Error updating period log:', error);
      throw error;
    }
  }

  async deletePeriodLog(logId: string): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, logId);
      await deleteDoc(docRef);
      console.log('Period log deleted successfully:', logId);
    } catch (error) {
      console.error('Error deleting period log:', error);
      throw error;
    }
  }

  async deleteAllUserLogs(): Promise<void> {
    try {
      const q = query(this.collectionRef, where('userId', '==', this.userId));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`Deleted all period logs for user: ${this.userId}`);
    } catch (error) {
      console.error('Error deleting all period logs:', error);
      throw error;
    }
  }
} 