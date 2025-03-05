import { firestore } from '../firebase/config';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export interface BirthControlMethod {
  id: string;
  name: string;
  type: 'pill' | 'patch' | 'ring' | 'injection' | 'implant' | 'iud' | 'condom' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'multi-year' | 'as-needed';
  startDate: Date;
  endDate?: Date;
  reminderTime?: string;
  reminderDays?: string[];
  notes?: string;
  active: boolean;
}

export interface BirthControlLog {
  id: string;
  methodId: string;
  date: Date;
  taken: boolean;
  skipped: boolean;
  notes?: string;
  takenTime?: string;
}

export class BirthControlService {
  private userId: string | null = null;

  constructor() {
    const auth = getAuth();
    this.userId = auth.currentUser?.uid || null;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  // Birth Control Methods CRUD
  async addBirthControlMethod(method: Omit<BirthControlMethod, 'id'>): Promise<string> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    try {
      const methodData = {
        ...method,
        userId: this.userId,
        startDate: Timestamp.fromDate(method.startDate),
        endDate: method.endDate ? Timestamp.fromDate(method.endDate) : null,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(firestore, 'birthControlMethods'), methodData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding birth control method:', error);
      throw error;
    }
  }

  async getBirthControlMethods(): Promise<BirthControlMethod[]> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    try {
      const methodsQuery = query(
        collection(firestore, 'birthControlMethods'),
        where('userId', '==', this.userId)
        // Removed orderBy to avoid index requirement
      );

      const querySnapshot = await getDocs(methodsQuery);
      const methods = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          type: data.type,
          frequency: data.frequency,
          startDate: data.startDate.toDate(),
          endDate: data.endDate ? data.endDate.toDate() : undefined,
          reminderTime: data.reminderTime,
          reminderDays: data.reminderDays,
          notes: data.notes,
          active: data.active,
        };
      });
      
      // Sort by startDate descending in memory
      methods.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
      
      return methods;
    } catch (error) {
      console.error('Error getting birth control methods:', error);
      throw error;
    }
  }

  async getActiveBirthControlMethod(): Promise<BirthControlMethod | null> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    try {
      const methodsQuery = query(
        collection(firestore, 'birthControlMethods'),
        where('userId', '==', this.userId),
        where('active', '==', true)
      );

      const querySnapshot = await getDocs(methodsQuery);
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        type: data.type,
        frequency: data.frequency,
        startDate: data.startDate.toDate(),
        endDate: data.endDate ? data.endDate.toDate() : undefined,
        reminderTime: data.reminderTime,
        reminderDays: data.reminderDays,
        notes: data.notes,
        active: data.active,
      };
    } catch (error) {
      console.error('Error getting active birth control method:', error);
      throw error;
    }
  }

  async updateBirthControlMethod(id: string, updates: Partial<BirthControlMethod>): Promise<void> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    try {
      const updateData: any = { ...updates };
      
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }
      
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(updates.endDate);
      }

      await updateDoc(doc(firestore, 'birthControlMethods', id), updateData);
    } catch (error) {
      console.error('Error updating birth control method:', error);
      throw error;
    }
  }

  async deleteBirthControlMethod(id: string): Promise<void> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    try {
      await deleteDoc(doc(firestore, 'birthControlMethods', id));
    } catch (error) {
      console.error('Error deleting birth control method:', error);
      throw error;
    }
  }

  // Birth Control Logs CRUD
  async logBirthControl(log: Omit<BirthControlLog, 'id'>): Promise<string> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    try {
      const logData = {
        ...log,
        userId: this.userId,
        date: Timestamp.fromDate(log.date),
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(firestore, 'birthControlLogs'), logData);
      return docRef.id;
    } catch (error) {
      console.error('Error logging birth control:', error);
      throw error;
    }
  }

  async getBirthControlLogs(methodId: string, startDate?: Date, endDate?: Date): Promise<BirthControlLog[]> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    try {
      // Use a simple query with no ordering to avoid index requirements
      const logsQuery = query(
        collection(firestore, 'birthControlLogs'),
        where('userId', '==', this.userId)
        // Removed orderBy to avoid index requirement
      );

      const querySnapshot = await getDocs(logsQuery);
      
      // Filter by methodId in memory
      let logs = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            methodId: data.methodId,
            date: data.date.toDate(),
            taken: data.taken,
            skipped: data.skipped,
            notes: data.notes,
            takenTime: data.takenTime,
          };
        })
        .filter(log => log.methodId === methodId);
      
      // Apply date filters in memory if needed
      if (startDate && endDate) {
        logs = logs.filter(log => 
          log.date >= startDate && log.date <= endDate
        );
      }
      
      // Sort by date descending in memory
      logs.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      return logs;
    } catch (error) {
      console.error('Error getting birth control logs:', error);
      throw error;
    }
  }

  async updateBirthControlLog(id: string, updates: Partial<BirthControlLog>): Promise<void> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    try {
      const updateData: any = { ...updates };
      
      if (updates.date) {
        updateData.date = Timestamp.fromDate(updates.date);
      }

      await updateDoc(doc(firestore, 'birthControlLogs', id), updateData);
    } catch (error) {
      console.error('Error updating birth control log:', error);
      throw error;
    }
  }

  async deleteBirthControlLog(id: string): Promise<void> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    try {
      await deleteDoc(doc(firestore, 'birthControlLogs', id));
    } catch (error) {
      console.error('Error deleting birth control log:', error);
      throw error;
    }
  }

  // Utility methods
  getAdherenceRate(logs: BirthControlLog[]): number {
    if (logs.length === 0) return 100;
    
    const takenCount = logs.filter(log => log.taken).length;
    return (takenCount / logs.length) * 100;
  }

  getMissedDoses(logs: BirthControlLog[], days: number = 30): BirthControlLog[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return logs
      .filter(log => !log.taken && log.date >= cutoffDate)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  shouldTakeToday(method: BirthControlMethod, logs: BirthControlLog[]): boolean {
    if (!method.active) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if already taken today
    const todayLog = logs.find(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime() && log.taken;
    });
    
    if (todayLog) return false;
    
    // Check if method is applicable today based on frequency
    switch (method.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        if (!method.reminderDays) return false;
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];
        return method.reminderDays.includes(dayOfWeek);
      case 'monthly':
        // Simplified logic - would need more complex rules for real implementation
        const dayOfMonth = today.getDate();
        const startDayOfMonth = method.startDate.getDate();
        return dayOfMonth === startDayOfMonth;
      default:
        return false;
    }
  }
} 