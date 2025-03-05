export type ReminderType = 'period' | 'ovulation' | 'pill' | 'ring' | 'patch' | 'injection';

export type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Reminder {
  id: string;
  userId: string;
  type: ReminderType;
  title: string;
  message: string;
  frequency: ReminderFrequency;
  time: string; // 24-hour format HH:mm
  days?: number[]; // Array of days (0-6) for weekly reminders
  date?: number; // Day of month for monthly reminders
  customInterval?: number; // Days between reminders for custom frequency
  enabled: boolean;
  nextDue: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderHistory {
  id: string;
  reminderId: string;
  userId: string;
  title: string;
  message: string;
  scheduledFor: Date;
  deliveredAt: Date;
  status: 'delivered' | 'snoozed' | 'dismissed';
  snoozedUntil?: Date;
}

export interface ReminderSettings {
  userId: string;
  discreetMode: boolean;
  defaultSnoozeTime: number; // minutes
  notificationSound: boolean;
  vibration: boolean;
} 