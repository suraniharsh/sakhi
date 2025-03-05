import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, PhoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export const SafetyResourceCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <ShieldCheckIcon className="w-6 h-6 text-pink-500" />
        <h2 className="text-xl font-semibold text-gray-800">Safety Resources</h2>
      </div>

      <div className="space-y-4">
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

      <div className="mt-6 p-4 bg-pink-50 rounded-xl">
        <p className="text-sm text-pink-600 font-medium">
          Your safety is our priority. All reports are confidential and handled with care.
        </p>
      </div>
    </motion.div>
  );
}; 