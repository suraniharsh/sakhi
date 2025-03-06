import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  PhoneIcon, 
  ChatBubbleLeftRightIcon, 
  BellAlertIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { EmergencyContactsManager } from '../components/emergency/EmergencyContactsManager';
import { EmergencyAlertSender } from '../components/emergency/EmergencyAlertSender';
import { useAuth } from '../hooks/useAuth';
import { emergencyService } from '../services/EmergencyService';
import { EmergencySettings } from '../types/emergency';

export const SafetyResourcesPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'contacts' | 'alert' | 'resources' | 'settings'>('contacts');
  const [settings, setSettings] = useState<EmergencySettings>({
    enabled: true,
    quickAccessEnabled: true,
    vibrateOnSend: true,
    sendLocationData: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userSettings = await emergencyService.getEmergencySettings(user.uid);
      setSettings(userSettings);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load emergency settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    
    const { name, checked } = e.target;
    const updatedSettings = { ...settings, [name]: checked };
    
    try {
      setSettings(updatedSettings);
      await emergencyService.updateEmergencySettings(user.uid, { [name]: checked });
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings.');
      // Revert the setting if update fails
      setSettings(settings);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-3 mb-8"
        >
          <ShieldCheckIcon className="w-8 h-8 text-pink-500" />
          <h1 className="text-3xl font-display font-bold text-gray-800">Safety Resources</h1>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 text-red-600 p-4 rounded-xl mb-6"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
        >
          <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'contacts'
                  ? 'text-pink-600 border-b-2 border-pink-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Emergency Contacts
            </button>
            <button
              onClick={() => setActiveTab('alert')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'alert'
                  ? 'text-pink-600 border-b-2 border-pink-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Send Alert
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'resources'
                  ? 'text-pink-600 border-b-2 border-pink-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'text-pink-600 border-b-2 border-pink-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Settings
            </button>
          </div>

          {activeTab === 'contacts' && <EmergencyContactsManager />}
          {activeTab === 'alert' && <EmergencyAlertSender />}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Emergency Alert Settings</h3>
                
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-700">Enable Emergency Alerts</h4>
                      <p className="text-sm text-gray-500">Allow sending emergency alerts to contacts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="enabled"
                        checked={settings.enabled}
                        onChange={handleSettingChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-700">Quick Access</h4>
                      <p className="text-sm text-gray-500">Show emergency alert button on dashboard</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="quickAccessEnabled"
                        checked={settings.quickAccessEnabled}
                        onChange={handleSettingChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-700">Vibrate on Send</h4>
                      <p className="text-sm text-gray-500">Vibrate device when alert is sent</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="vibrateOnSend"
                        checked={settings.vibrateOnSend}
                        onChange={handleSettingChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-700">Share Location Data</h4>
                      <p className="text-sm text-gray-500">Include your location when sending alerts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="sendLocationData"
                        checked={settings.sendLocationData}
                        onChange={handleSettingChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> Location sharing requires browser permission. If you enable this feature, you'll be prompted to allow location access when sending an alert.
                  </p>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Twilio SMS Configuration</h3>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-700 mb-4">
                      <strong>Note:</strong> These settings are for development purposes only. In a production environment, 
                      you should configure Twilio credentials using environment variables.
                    </p>
                    
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-700">
                        <strong>Demo Mode:</strong> This is a demonstration version of the emergency alert system. 
                        SMS messages will be simulated rather than actually sent to recipients. In a production environment, 
                        real SMS messages would be sent through Twilio.
                      </p>
                      <p className="text-sm text-yellow-700 mt-2">
                        <strong>Phone Number Format:</strong> Phone numbers should be in E.164 format (e.g., +91XXXXXXXXXX for India).
                        If you enter a number without the country code, +91 will be added automatically.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="accountSid" className="block text-sm font-medium text-gray-700 mb-1">
                          Twilio Account SID
                        </label>
                        <input
                          type="text"
                          id="accountSid"
                          placeholder="Enter your Twilio Account SID"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="authToken" className="block text-sm font-medium text-gray-700 mb-1">
                          Twilio Auth Token
                        </label>
                        <input
                          type="password"
                          id="authToken"
                          placeholder="Enter your Twilio Auth Token"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Twilio Phone Number
                        </label>
                        <input
                          type="text"
                          id="phoneNumber"
                          placeholder="Enter your Twilio Phone Number (with country code)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      
                      <button
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        onClick={() => {
                          const accountSid = (document.getElementById('accountSid') as HTMLInputElement).value;
                          const authToken = (document.getElementById('authToken') as HTMLInputElement).value;
                          const phoneNumber = (document.getElementById('phoneNumber') as HTMLInputElement).value;
                          
                          // Store in localStorage for development purposes
                          if (accountSid && authToken && phoneNumber) {
                            localStorage.setItem('TWILIO_ACCOUNT_SID', accountSid);
                            localStorage.setItem('TWILIO_AUTH_TOKEN', authToken);
                            localStorage.setItem('TWILIO_PHONE_NUMBER', phoneNumber);
                            
                            alert('Twilio credentials saved! Please refresh the page for changes to take effect.');
                          } else {
                            alert('Please fill in all fields.');
                          }
                        }}
                      >
                        Save Twilio Credentials
                      </button>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        These credentials will be stored in your browser's localStorage and will be used for SMS alerts.
                        They will persist until you clear your browser data.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-medium text-blue-700 mb-2">SMS Delivery Information</h4>
                  <p className="text-sm text-blue-600">
                    This app uses Twilio to send real SMS messages to your emergency contacts. For SMS functionality to work properly, the app administrator needs to configure Twilio credentials.
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    If you're not receiving SMS messages, please ensure:
                  </p>
                  <ul className="list-disc list-inside text-sm text-blue-600 mt-1">
                    <li>Your contacts' phone numbers are entered correctly with country code (e.g., +1 for US)</li>
                    <li>The app has been properly configured with Twilio credentials</li>
                    <li>Your contacts have not blocked messages from unknown numbers</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Report Harassment</h3>
                <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-200">
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
                </button>
              </div>

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
                <button className="p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
                  Find Support Groups
                </button>
                <button className="p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
                  Legal Resources
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-pink-50 rounded-xl p-4"
        >
          <p className="text-sm text-pink-600 font-medium text-center">
            Your safety is our priority. All reports are confidential and handled with care.
          </p>
        </motion.div>
      </div>
    </div>
  );
}; 