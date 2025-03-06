export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  sendSmsAlerts: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyMessage {
  id: string;
  content: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencySettings {
  enabled: boolean;
  quickAccessEnabled: boolean;
  vibrateOnSend: boolean;
  sendLocationData: boolean;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  contactIds: string[];
  messageId: string;
  customMessage?: string | null;
  locationData?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
  sentAt: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
} 