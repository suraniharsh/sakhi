import { Reminder, ReminderSettings } from '../types/reminders';
import { reminderService } from './ReminderService';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  actions?: { action: string; title: string; }[];
}

interface NotificationPreferences {
  enabled: boolean;
  periodNotifications: boolean;
  fertilityNotifications: boolean;
  ovulationNotifications: boolean;
  daysInAdvance: {
    period: number;
    fertility: number;
    ovulation: number;
  };
}

class NotificationService {
  private static instance: NotificationService;
  private hasPermission: boolean = false;

  private constructor() {
    this.checkPermission();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async checkPermission(): Promise<void> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
    }
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const docRef = doc(db, 'users', userId, 'settings', 'notifications');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as NotificationPreferences;
      }

      // Default preferences
      const defaultPreferences: NotificationPreferences = {
        enabled: true,
        periodNotifications: true,
        fertilityNotifications: true,
        ovulationNotifications: true,
        daysInAdvance: {
          period: 2,
          fertility: 1,
          ovulation: 1
        }
      };

      await setDoc(docRef, defaultPreferences);
      return defaultPreferences;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      throw error;
    }
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId, 'settings', 'notifications');
      await updateDoc(docRef, preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  private getDiscreetTitle(type: Reminder['type'], settings: ReminderSettings): string {
    if (!settings.discreetMode) {
      return type === 'period' ? 'Period Reminder'
        : type === 'ovulation' ? 'Ovulation Reminder'
        : type === 'pill' ? 'Medication Reminder'
        : 'Health Reminder';
    }

    return 'Reminder';
  }

  private getDiscreetMessage(reminder: Reminder, settings: ReminderSettings): string {
    if (!settings.discreetMode) {
      return reminder.message;
    }

    return 'Time for your scheduled reminder';
  }

  async showNotification(reminder: Reminder, settings: ReminderSettings): Promise<void> {
    if (!this.hasPermission) {
      await this.checkPermission();
    }

    if (!this.hasPermission) {
      console.log('Notification permission not granted');
      return;
    }

    const title = this.getDiscreetTitle(reminder.type, settings);
    const message = this.getDiscreetMessage(reminder, settings);

    const notification = new Notification(title, {
      body: message,
      silent: !settings.notificationSound,
      vibrate: settings.vibration ? [200, 100, 200] : undefined,
      tag: reminder.id, // Prevent duplicate notifications
      requireInteraction: true, // Keep notification until user interacts
    } as ExtendedNotificationOptions);

    notification.onclick = async () => {
      // Open the app when clicking the notification body
      window.focus();
      window.location.href = '/reminders';

      // Log the interaction
      await reminderService.logReminderHistory({
        reminderId: reminder.id,
        userId: reminder.userId,
        title,
        message,
        scheduledFor: reminder.nextDue,
        deliveredAt: new Date(),
        status: 'delivered'
      });
    };
  }

  async checkAndTriggerReminders(userId: string): Promise<void> {
    const settings = await reminderService.getUserSettings(userId);
    const reminders = await reminderService.getUserReminders(userId);
    const now = new Date();

    for (const reminder of reminders) {
      if (reminder.enabled && reminder.nextDue <= now) {
        await this.showNotification(reminder, settings);
        
        // Calculate and update next due date
        const nextDue = reminderService.calculateNextDue(reminder);
        await reminderService.updateReminder(reminder.id, { nextDue });
      }
    }
  }

  async sendNotification(
    title: string,
    options: NotificationOptions = {}
  ): Promise<void> {
    if (!this.hasPermission) {
      await this.checkPermission();
    }

    if (!this.hasPermission) {
      console.log('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async scheduleNotification(
    userId: string,
    type: 'period' | 'fertility' | 'ovulation',
    date: Date,
    daysInAdvance: number
  ): Promise<void> {
    const preferences = await this.getPreferences(userId);
    
    if (!preferences.enabled) return;
    
    switch (type) {
      case 'period':
        if (!preferences.periodNotifications) return;
        break;
      case 'fertility':
        if (!preferences.fertilityNotifications) return;
        break;
      case 'ovulation':
        if (!preferences.ovulationNotifications) return;
        break;
    }

    const notificationDate = new Date(date);
    notificationDate.setDate(notificationDate.getDate() - daysInAdvance);

    // If notification date is in the past, don't schedule
    if (notificationDate < new Date()) return;

    const timeUntilNotification = notificationDate.getTime() - Date.now();

    setTimeout(() => {
      const messages = {
        period: 'Your period is starting soon',
        fertility: 'Your fertility window is approaching',
        ovulation: 'Ovulation day is coming up'
      };

      this.sendNotification(messages[type], {
        body: `Reminder: ${messages[type]} in ${daysInAdvance} days`,
        tag: `${type}-${date.getTime()}`,
        requireInteraction: true
      });
    }, timeUntilNotification);
  }
}

export const notificationService = NotificationService.getInstance(); 