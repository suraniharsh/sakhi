import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  PhoneIcon, 
  ChatBubbleLeftRightIcon, 
  BellAlertIcon,
  UserPlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { emergencyService } from '../../services/EmergencyService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const SafetyResourceCard: React.FC = () => {
  const { user } = useAuth();
  const [hasEmergencyContacts, setHasEmergencyContacts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingQuickAlert, setIsSendingQuickAlert] = useState(false);
  const [defaultContactId, setDefaultContactId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkEmergencyContacts();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const checkEmergencyContacts = async () => {
    try {
      setIsLoading(true);
      const contacts = await emergencyService.getEmergencyContacts(user!.uid);
      setHasEmergencyContacts(contacts.length > 0);
      
      // Set the first contact as default if available
      if (contacts.length > 0) {
        setDefaultContactId(contacts[0].id);
      }
    } catch (error) {
      console.error('Error checking emergency contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAlert = async () => {
    if (!user || !defaultContactId) return;
    
    try {
      setIsSendingQuickAlert(true);
      
      // Default harassment message
      const defaultMessage = "I'm experiencing harassment and need help. Please contact me as soon as possible.";
      
      // Send alert to default contact
      await emergencyService.sendEmergencyAlert(
        user.uid,
        [defaultContactId],
        null,
        defaultMessage
      );
      
      toast.success(`Emergency alert sent successfully to +${defaultContactId}!`);
    } catch (error) {
      console.error('Error sending quick alert:', error);
      toast.error('Failed to send alert. Please try again.');
    } finally {
      setIsSendingQuickAlert(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-6"
    >
      <ToastContainer />
      <div className="flex items-center space-x-3 mb-6">
        <ShieldCheckIcon className="w-6 h-6 text-pink-500" />
        <h2 className="text-xl font-semibold text-gray-800">Safety Resources</h2>
      </div>

      <div className="space-y-4">
        {user && !isLoading && (
          <Link 
            to="/safety/alert"
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
              hasEmergencyContacts 
                ? 'bg-red-100 hover:bg-red-200' 
                : 'bg-gray-100 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${hasEmergencyContacts ? 'bg-white' : 'bg-gray-200'}`}>
                <BellAlertIcon className={`w-5 h-5 ${hasEmergencyContacts ? 'text-red-500' : 'text-gray-400'}`} />
              </div>
              <div className="text-left">
                <h3 className={`font-medium ${hasEmergencyContacts ? 'text-red-700' : 'text-gray-400'}`}>
                  Emergency Alert
                </h3>
                <p className={`text-sm ${hasEmergencyContacts ? 'text-red-500' : 'text-gray-400'}`}>
                  {hasEmergencyContacts 
                    ? 'Send alert to emergency contacts' 
                    : 'Add emergency contacts first'}
                </p>
              </div>
            </div>
            <span className={hasEmergencyContacts ? 'text-red-500' : 'text-gray-400'}>→</span>
          </Link>
        )}

        <Link 
          to="/safety/report"
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-pink-500" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-800">Report Harassment</h3>
              <p className="text-sm text-gray-500">File a confidential report</p>
            </div>
          </div>
          <span className="text-pink-500">→</span>
        </Link>

        <div className="p-4 bg-gray-50 rounded-xl">
          <h3 className="font-medium text-gray-800 mb-2">Emergency Contacts</h3>
          <div className="space-y-3">
            <a 
              href="tel:911" 
              className="flex items-center space-x-3 text-gray-600 hover:text-pink-500"
            >
              <PhoneIcon className="w-5 h-5" />
              <span>Emergency: 911</span>
            </a>
            <a 
              href="tel:18007997233" 
              className="flex items-center space-x-3 text-gray-600 hover:text-pink-500"
            >
              <PhoneIcon className="w-5 h-5" />
              <span>National Domestic Violence Hotline: 1-800-799-7233</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link 
            to="/safety/contacts"
            className="p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <UserPlusIcon className="w-4 h-4" />
            <span>Add Contacts</span>
          </Link>
          <Link 
            to="/safety"
            className="p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
          >
            All Resources
          </Link>
        </div>
      </div>

      <div className="mt-6 p-4 bg-pink-50 rounded-xl">
        <p className="text-sm text-pink-600 font-medium">
          Your safety is our priority. All reports are confidential and handled with care.
        </p>
      </div>

      {/* Floating Action Button for Quick Alert */}
      {user && !isLoading && defaultContactId && (
        <button 
          onClick={handleQuickAlert}
          disabled={isSendingQuickAlert || !defaultContactId}
          className="fixed bottom-5 right-5 bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-all duration-200"
        >
          <ExclamationTriangleIcon className="w-6 h-6" />
        </button>
      )}
    </motion.div>
  );
}; 