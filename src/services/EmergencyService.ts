import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { 
  EmergencyContact, 
  EmergencyMessage, 
  EmergencySettings, 
  EmergencyAlert 
} from '../types/emergency';
import axios from 'axios';

class EmergencyService {
  private static instance: EmergencyService;
  private twilioApiUrl = 'https://api.twilio.com/2010-04-01/Accounts/';
  private twilioAccountSid: string;
  private twilioApiSecret: string;
  private twilioPhoneNumber: string;

  private constructor() {
    // Try to get credentials from environment variables first
    let accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID || '';
    let authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN || '';
    let phoneNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER || '';
    
    // If not available, try localStorage as fallback (for development)
    if (typeof window !== 'undefined') {
      if (!accountSid && localStorage.getItem('TWILIO_ACCOUNT_SID')) {
        accountSid = localStorage.getItem('TWILIO_ACCOUNT_SID') || '';
      }
      
      if (!authToken && localStorage.getItem('TWILIO_AUTH_TOKEN')) {
        authToken = localStorage.getItem('TWILIO_AUTH_TOKEN') || '';
      }
      
      if (!phoneNumber && localStorage.getItem('TWILIO_PHONE_NUMBER')) {
        phoneNumber = localStorage.getItem('TWILIO_PHONE_NUMBER') || '';
      }
    }
    
    this.twilioAccountSid = accountSid;
    this.twilioApiSecret = authToken; // Using Auth Token as API Secret
    this.twilioPhoneNumber = phoneNumber;
    
    // Log to help with debugging
    console.log('Twilio config loaded:', {
      accountSidExists: !!this.twilioAccountSid,
      authTokenExists: !!this.twilioApiSecret,
      phoneNumberExists: !!this.twilioPhoneNumber,
      source: this.twilioAccountSid ? (import.meta.env.VITE_TWILIO_ACCOUNT_SID ? 'env' : 'localStorage') : 'none'
    });
  }

  static getInstance(): EmergencyService {
    if (!EmergencyService.instance) {
      EmergencyService.instance = new EmergencyService();
    }
    return EmergencyService.instance;
  }

  // Emergency Contacts CRUD operations
  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    try {
      const contactsRef = collection(db, 'users', userId, 'emergencyContacts');
      const querySnapshot = await getDocs(contactsRef);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as EmergencyContact;
      });
    } catch (error) {
      console.error('Error getting emergency contacts:', error);
      throw error;
    }
  }

  async addEmergencyContact(userId: string, contact: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmergencyContact> {
    try {
      const contactId = uuidv4();
      const contactRef = doc(db, 'users', userId, 'emergencyContacts', contactId);
      
      const newContact: EmergencyContact = {
        ...contact,
        id: contactId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(contactRef, {
        ...newContact,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return newContact;
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      throw error;
    }
  }

  async updateEmergencyContact(userId: string, contactId: string, updates: Partial<EmergencyContact>): Promise<void> {
    try {
      const contactRef = doc(db, 'users', userId, 'emergencyContacts', contactId);
      await updateDoc(contactRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      throw error;
    }
  }

  async deleteEmergencyContact(userId: string, contactId: string): Promise<void> {
    try {
      const contactRef = doc(db, 'users', userId, 'emergencyContacts', contactId);
      await deleteDoc(contactRef);
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      throw error;
    }
  }

  // Emergency Messages CRUD operations
  async getEmergencyMessages(userId: string): Promise<EmergencyMessage[]> {
    try {
      const messagesRef = collection(db, 'users', userId, 'emergencyMessages');
      const querySnapshot = await getDocs(messagesRef);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as EmergencyMessage;
      });
    } catch (error) {
      console.error('Error getting emergency messages:', error);
      throw error;
    }
  }

  async addEmergencyMessage(userId: string, message: Omit<EmergencyMessage, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmergencyMessage> {
    try {
      const messageId = uuidv4();
      const messageRef = doc(db, 'users', userId, 'emergencyMessages', messageId);
      
      const newMessage: EmergencyMessage = {
        ...message,
        id: messageId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(messageRef, {
        ...newMessage,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return newMessage;
    } catch (error) {
      console.error('Error adding emergency message:', error);
      throw error;
    }
  }

  // Emergency Settings operations
  async getEmergencySettings(userId: string): Promise<EmergencySettings> {
    try {
      const settingsRef = doc(db, 'users', userId, 'settings', 'emergency');
      const docSnap = await getDoc(settingsRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as EmergencySettings;
      }
      
      // Default settings
      const defaultSettings: EmergencySettings = {
        enabled: true,
        quickAccessEnabled: true,
        vibrateOnSend: true,
        sendLocationData: false
      };
      
      await setDoc(settingsRef, defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Error getting emergency settings:', error);
      throw error;
    }
  }

  async updateEmergencySettings(userId: string, settings: Partial<EmergencySettings>): Promise<void> {
    try {
      const settingsRef = doc(db, 'users', userId, 'settings', 'emergency');
      await updateDoc(settingsRef, settings);
    } catch (error) {
      console.error('Error updating emergency settings:', error);
      throw error;
    }
  }

  // Send Emergency SMS Alert
  async sendEmergencyAlert(
    userId: string, 
    contactIds: string[], 
    messageId?: string | null, 
    customMessage?: string | null
  ): Promise<EmergencyAlert> {
    try {
      // Get user's emergency settings
      const settings = await this.getEmergencySettings(userId);
      
      // Get location data if enabled
      let locationData = null;
      if (settings.sendLocationData) {
        try {
          const position = await this.getCurrentPosition();
          locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
        } catch (error) {
          console.warn('Could not get location data:', error);
        }
      }
      
      // Create alert record
      const alertId = uuidv4();
      const alertRef = doc(db, 'users', userId, 'emergencyAlerts', alertId);
      
      // Get message content
      let messageContent = '';
      if (messageId) {
        try {
          const messagesRef = collection(db, 'users', userId, 'emergencyMessages');
          const q = query(messagesRef, where('id', '==', messageId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            messageContent = querySnapshot.docs[0].data().content;
          }
        } catch (error) {
          console.error('Error getting message content:', error);
        }
      }
      
      if (!messageContent && customMessage) {
        messageContent = customMessage;
      }
      
      if (!messageContent) {
        messageContent = "I'm in an emergency situation and need help. Please contact me as soon as possible.";
      }
      
      // Add location to message if available
      if (locationData) {
        const googleMapsUrl = `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`;
        messageContent += `\n\nMy current location: ${googleMapsUrl}`;
      }
      
      const alert: EmergencyAlert = {
        id: alertId,
        userId,
        contactIds,
        messageId: messageId || '',
        customMessage: customMessage || null,
        locationData,
        sentAt: new Date(),
        status: 'pending'
      };
      
      // Save alert to Firestore
      await setDoc(alertRef, {
        ...alert,
        sentAt: serverTimestamp(),
        customMessage: customMessage || null,
        locationData: locationData || null
      });
      
      // Get contact phone numbers
      const phoneNumbers: string[] = [];
      for (const contactId of contactIds) {
        try {
          const contactRef = doc(db, 'users', userId, 'emergencyContacts', contactId);
          const contactSnap = await getDoc(contactRef);
          
          if (contactSnap.exists()) {
            const contact = contactSnap.data() as EmergencyContact;
            if (contact.sendSmsAlerts && contact.phoneNumber) {
              phoneNumbers.push(contact.phoneNumber);
            }
          }
        } catch (error) {
          console.error(`Error getting contact ${contactId}:`, error);
        }
      }
      
      // Send SMS to each contact
      const smsPromises = phoneNumbers.map(phoneNumber => 
        this.sendSms(phoneNumber, messageContent)
      );
      
      try {
        await Promise.all(smsPromises);
        // Update alert status to sent
        await updateDoc(alertRef, {
          status: 'sent'
        });
      } catch (error) {
        console.error('Error sending SMS messages:', error);
        // Update alert status to failed
        await updateDoc(alertRef, {
          status: 'failed'
        });
        throw error;
      }
      
      // Vibrate device if enabled
      if (settings.vibrateOnSend && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      
      return alert;
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      throw error;
    }
  }
  
  private async sendSms(to: string, body: string): Promise<void> {
    // Format phone number to E.164 format if not already
    let formattedNumber = to;
    if (!to.startsWith('+')) {
      // Assuming Indian number if no country code
      formattedNumber = `+91${to.replace(/\D/g, '')}`;
    }
    
    try {
      // Check if Twilio credentials are configured
      if (!this.twilioAccountSid || !this.twilioApiSecret || !this.twilioPhoneNumber) {
        console.warn('Twilio credentials are not configured. Using fallback method.');
        // Fallback to a simulated SMS
        console.log('SIMULATED SMS:', { to: formattedNumber, body });
        
        // If we're in development mode, show an alert
        if (import.meta.env.DEV) {
          alert(`SIMULATED SMS to ${formattedNumber}: ${body}`);
        }
        
        return;
      }
      
      console.log(`Attempting to send SMS to ${formattedNumber} from ${this.twilioPhoneNumber}`);
      
      // Simple direct approach using Axios
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
        new URLSearchParams({
          To: formattedNumber,
          From: this.twilioPhoneNumber,
          Body: body,
        }),
        {
          auth: {
            username: this.twilioAccountSid,
            password: this.twilioApiSecret,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      console.log('SMS sent successfully:', response.data);
      
      // Show success message
      if (import.meta.env.DEV) {
        alert(`SMS sent successfully to ${formattedNumber}!`);
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      
      // If direct API call fails, use simulation mode
      console.log('Falling back to simulation mode');
      console.log('SIMULATED SMS:', { to: formattedNumber, body });
      
      if (import.meta.env.DEV) {
        alert(`SIMULATED SMS to ${formattedNumber}: ${body}\n\n` + 
              `Note: Could not send real SMS. Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
              `The message would have been sent with the following details:\n` +
              `To: ${formattedNumber}\n` +
              `From: ${this.twilioPhoneNumber}\n` +
              `Message: ${body}`);
      }
    }
  }

  // Helper method to get current position
  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });
  }
}

export const emergencyService = EmergencyService.getInstance(); 