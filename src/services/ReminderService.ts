import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Reminder, ReminderHistory, ReminderSettings } from '../types/reminders';

class ReminderService {
  private readonly REMINDERS_COLLECTION = 'reminders';
  private readonly HISTORY_COLLECTION = 'reminderHistory';
  private readonly SETTINGS_COLLECTION = 'reminderSettings';

  // Create a new reminder
  async createReminder(reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.REMINDERS_COLLECTION), {
      ...reminder,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      nextDue: Timestamp.fromDate(reminder.nextDue)
    });
    return docRef.id;
  }

  // Update an existing reminder
  async updateReminder(id: string, reminder: Partial<Reminder>): Promise<void> {
    const docRef = doc(db, this.REMINDERS_COLLECTION, id);
    await updateDoc(docRef, {
      ...reminder,
      updatedAt: serverTimestamp()
    });
  }

  // Delete a reminder
  async deleteReminder(id: string): Promise<void> {
    await deleteDoc(doc(db, this.REMINDERS_COLLECTION, id));
  }

  // Get all reminders for a user
  async getUserReminders(userId: string): Promise<Reminder[]> {
    const q = query(
      collection(db, this.REMINDERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('nextDue', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      nextDue: (doc.data().nextDue as Timestamp).toDate(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate()
    })) as Reminder[];
  }

  // Log reminder history
  async logReminderHistory(history: Omit<ReminderHistory, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.HISTORY_COLLECTION), {
      ...history,
      deliveredAt: Timestamp.fromDate(history.deliveredAt),
      scheduledFor: Timestamp.fromDate(history.scheduledFor),
      snoozedUntil: history.snoozedUntil ? Timestamp.fromDate(history.snoozedUntil) : null
    });
    return docRef.id;
  }

  // Get reminder history for a user
  async getUserReminderHistory(userId: string): Promise<ReminderHistory[]> {
    const q = query(
      collection(db, this.HISTORY_COLLECTION),
      where('userId', '==', userId),
      orderBy('scheduledFor', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      deliveredAt: (doc.data().deliveredAt as Timestamp).toDate(),
      scheduledFor: (doc.data().scheduledFor as Timestamp).toDate(),
      snoozedUntil: doc.data().snoozedUntil ? (doc.data().snoozedUntil as Timestamp).toDate() : undefined
    })) as ReminderHistory[];
  }

  // Get or create user reminder settings
  async getUserSettings(userId: string): Promise<ReminderSettings> {
    const q = query(
      collection(db, this.SETTINGS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data() as ReminderSettings;
      return data;
    }

    // Create default settings if none exist
    const defaultSettings: ReminderSettings = {
      userId,
      discreetMode: false,
      defaultSnoozeTime: 15,
      notificationSound: true,
      vibration: true
    };

    await addDoc(collection(db, this.SETTINGS_COLLECTION), defaultSettings);
    return defaultSettings;
  }

  // Update user reminder settings
  async updateUserSettings(userId: string, settings: Partial<ReminderSettings>): Promise<void> {
    const q = query(
      collection(db, this.SETTINGS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await updateDoc(doc(db, this.SETTINGS_COLLECTION, snapshot.docs[0].id), settings);
    }
  }

  // Calculate next reminder date based on frequency
  calculateNextDue(reminder: Reminder): Date {
    const now = new Date();
    const [hours, minutes] = reminder.time.split(':').map(Number);
    let nextDue = new Date(now);
    nextDue.setHours(hours, minutes, 0, 0);

    if (nextDue <= now) {
      nextDue.setDate(nextDue.getDate() + 1);
    }

    switch (reminder.frequency) {
      case 'daily':
        return nextDue;
      
      case 'weekly':
        while (!reminder.days?.includes(nextDue.getDay())) {
          nextDue.setDate(nextDue.getDate() + 1);
        }
        return nextDue;
      
      case 'monthly':
        nextDue.setDate(reminder.date || 1);
        if (nextDue <= now) {
          nextDue.setMonth(nextDue.getMonth() + 1);
        }
        return nextDue;
      
      case 'custom':
        if (reminder.customInterval) {
          nextDue.setDate(nextDue.getDate() + reminder.customInterval);
        }
        return nextDue;
      
      default:
        return nextDue;
    }
  }
}

export const reminderService = new ReminderService(); 