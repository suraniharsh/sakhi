import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, PaperAirplaneIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { EmergencyContact, EmergencyMessage } from '../../types/emergency';
import { emergencyService } from '../../services/EmergencyService';
import { useAuth } from '../../hooks/useAuth';

export const EmergencyAlertSender: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [messages, setMessages] = useState<EmergencyMessage[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTwilioConfigured, setIsTwilioConfigured] = useState<boolean>(false);

  useEffect(() => {
    // Check if Twilio is configured
    let accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    let authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    let phoneNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
    
    // Check localStorage as fallback
    if (!accountSid && localStorage.getItem('TWILIO_ACCOUNT_SID')) {
      accountSid = localStorage.getItem('TWILIO_ACCOUNT_SID') || '';
    }
    
    if (!authToken && localStorage.getItem('TWILIO_AUTH_TOKEN')) {
      authToken = localStorage.getItem('TWILIO_AUTH_TOKEN') || '';
    }
    
    if (!phoneNumber && localStorage.getItem('TWILIO_PHONE_NUMBER')) {
      phoneNumber = localStorage.getItem('TWILIO_PHONE_NUMBER') || '';
    }
    
    // Debug logging to check environment variables
    console.log('Environment variables check:', {
      VITE_TWILIO_ACCOUNT_SID: accountSid,
      VITE_TWILIO_AUTH_TOKEN: authToken ? '(exists)' : '(missing)',
      VITE_TWILIO_PHONE_NUMBER: phoneNumber,
      source: accountSid ? (import.meta.env.VITE_TWILIO_ACCOUNT_SID ? 'env' : 'localStorage') : 'none'
    });
    
    const isConfigured = !!accountSid && !!authToken && !!phoneNumber;
    setIsTwilioConfigured(isConfigured);
    
    console.log('Twilio configuration status:', isConfigured);
    
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Load contacts and messages in parallel
      const [userContacts, userMessages] = await Promise.all([
        emergencyService.getEmergencyContacts(user.uid),
        emergencyService.getEmergencyMessages(user.uid)
      ]);
      
      setContacts(userContacts);
      setMessages(userMessages);
      
      // If no messages exist, create a default one
      if (userMessages.length === 0) {
        const defaultMessage = await emergencyService.addEmergencyMessage(user.uid, {
          content: "I'm in an emergency situation and need help. Please contact me as soon as possible.",
          isDefault: true
        });
        setMessages([defaultMessage]);
        setSelectedMessage(defaultMessage.id);
      } else {
        // Select the default message if available
        const defaultMsg = userMessages.find(msg => msg.isDefault);
        if (defaultMsg) {
          setSelectedMessage(defaultMsg.id);
        } else if (userMessages.length > 0) {
          setSelectedMessage(userMessages[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load emergency data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMessage(e.target.value);
    // Clear custom message when selecting a predefined one
    setCustomMessage('');
  };

  const handleCustomMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomMessage(e.target.value);
    // Clear selected message when typing a custom one
    if (e.target.value.trim() !== '') {
      setSelectedMessage('');
    }
  };

  const handleSendAlert = async () => {
    if (!user) return;
    
    if (selectedContacts.length === 0) {
      setError('Please select at least one emergency contact.');
      return;
    }
    
    if (!selectedMessage && !customMessage.trim()) {
      setError('Please select a message or type a custom one.');
      return;
    }
    
    try {
      setIsSending(true);
      setError(null);
      setSuccess(null);
      
      // Show sending status
      setSuccess('Sending emergency alerts...');
      
      await emergencyService.sendEmergencyAlert(
        user.uid,
        selectedContacts,
        selectedMessage || null,
        customMessage.trim() || null
      );
      
      // Success message
      setSuccess('Emergency alerts processed successfully! In this demo version, SMS messages are simulated. In a production environment, real SMS messages would be sent through Twilio.');
      
      // Reset form
      setSelectedContacts([]);
      setCustomMessage('');
    } catch (err) {
      console.error('Error sending alert:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('Twilio credentials are not configured')) {
          setError('SMS service is not properly configured. Please contact support to enable SMS functionality.');
        } else if (err.message.includes('locationData')) {
          setError('Failed to send emergency alert due to location data issue. Please try again or disable location sharing in settings.');
        } else if (err.message.includes('status code 400') || err.message.includes('status code 403')) {
          setError('Failed to send SMS. Please check that your Twilio credentials are correct and that the recipient phone number is in the correct format.');
        } else if (err.message.includes('Network Error')) {
          setError('Network error occurred. SMS messages are being simulated instead. In a production environment, this would send real SMS messages.');
        } else {
          setError(`Failed to send emergency alert: ${err.message}`);
        }
      } else {
        setError('Failed to send emergency alert. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-gray-500">Please log in to use emergency alerts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start space-x-2"
        >
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </motion.div>
      )}
      
      {success && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-green-50 text-green-600 rounded-xl"
        >
          {success}
        </motion.div>
      )}
      
      {!isTwilioConfigured && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-yellow-50 text-yellow-700 rounded-xl flex items-start space-x-2"
        >
          <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">SMS Service Not Configured</p>
            <p className="text-sm mt-1">
              Twilio credentials are not set up. SMS alerts will be simulated but not actually sent to phones.
              Please see the TWILIO_SETUP.md file for instructions on how to enable real SMS delivery.
            </p>
          </div>
        </motion.div>
      )}
      
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-700">Emergency Alert</h3>
            <p className="text-sm text-red-600 mt-1">
              Use this feature to quickly send an SMS alert to your emergency contacts when you're in danger or experiencing harassment.
            </p>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading emergency data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Select Contacts to Alert</h3>
            {contacts.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-gray-500">No emergency contacts added yet.</p>
                <a 
                  href="/safety/contacts" 
                  className="mt-2 inline-block text-sm font-medium text-pink-600 hover:text-pink-700"
                >
                  Add emergency contacts
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contacts.map(contact => (
                  <div 
                    key={contact.id}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-colors duration-200 ${
                      selectedContacts.includes(contact.id)
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-200'
                    }`}
                    onClick={() => handleContactToggle(contact.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleContactToggle(contact.id)}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <div>
                        <h4 className="font-medium text-gray-800">{contact.name}</h4>
                        <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Select or Type Message</h3>
            
            {messages.length > 0 && (
              <div className="mb-4">
                <label htmlFor="messageSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Predefined Messages
                </label>
                <select
                  id="messageSelect"
                  value={selectedMessage}
                  onChange={handleMessageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                >
                  <option value="">Select a message</option>
                  {messages.map(message => (
                    <option key={message.id} value={message.id}>
                      {message.content.substring(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Message
              </label>
              <textarea
                id="customMessage"
                value={customMessage}
                onChange={handleCustomMessageChange}
                placeholder="Type a custom emergency message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 min-h-[100px]"
              />
            </div>
          </div>
          
          <button
            onClick={handleSendAlert}
            disabled={isSending || contacts.length === 0}
            className={`w-full py-3 rounded-xl flex items-center justify-center space-x-2 ${
              isSending || contacts.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            } transition-colors duration-200`}
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending Alert...</span>
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="w-5 h-5" />
                <span>Send Emergency Alert</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}; 