import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon, PencilIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { EmergencyContact } from '../../types/emergency';
import { emergencyService } from '../../services/EmergencyService';
import { useAuth } from '../../hooks/useAuth';

export const EmergencyContactsManager: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<EmergencyContact>>({
    name: '',
    phoneNumber: '',
    relationship: '',
    sendSmsAlerts: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const userContacts = await emergencyService.getEmergencyContacts(user.uid);
      setContacts(userContacts);
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError('Failed to load emergency contacts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phoneNumber: '',
      relationship: '',
      sendSmsAlerts: true
    });
    setIsAddingContact(false);
    setIsEditingContact(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setError(null);
      
      if (isEditingContact) {
        await emergencyService.updateEmergencyContact(user.uid, isEditingContact, formData);
      } else {
        await emergencyService.addEmergencyContact(user.uid, formData as Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      resetForm();
      await loadContacts();
    } catch (err) {
      console.error('Error saving contact:', err);
      setError('Failed to save emergency contact. Please try again.');
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setFormData({
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      relationship: contact.relationship,
      sendSmsAlerts: contact.sendSmsAlerts
    });
    setIsEditingContact(contact.id);
    setIsAddingContact(true);
  };

  const handleDelete = async (contactId: string) => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to delete this emergency contact?')) {
      try {
        setError(null);
        await emergencyService.deleteEmergencyContact(user.uid, contactId);
        await loadContacts();
      } catch (err) {
        console.error('Error deleting contact:', err);
        setError('Failed to delete emergency contact. Please try again.');
      }
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-gray-500">Please log in to manage emergency contacts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800">Emergency Contacts</h3>
        {!isAddingContact && (
          <button
            onClick={() => setIsAddingContact(true)}
            className="flex items-center space-x-2 text-sm font-medium text-pink-600 hover:text-pink-700"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        )}
      </div>
      
      {isAddingContact ? (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 rounded-xl space-y-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
              required
            />
          </div>
          
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
              placeholder="+91XXXXXXXXXX"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter with country code (+91 for India) or it will be added automatically.
            </p>
          </div>
          
          <div>
            <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <select
              id="relationship"
              name="relationship"
              value={formData.relationship}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
              required
            >
              <option value="">Select relationship</option>
              <option value="Family">Family</option>
              <option value="Friend">Friend</option>
              <option value="Partner">Partner</option>
              <option value="Roommate">Roommate</option>
              <option value="Colleague">Colleague</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sendSmsAlerts"
              name="sendSmsAlerts"
              checked={formData.sendSmsAlerts}
              onChange={handleInputChange}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <label htmlFor="sendSmsAlerts" className="ml-2 block text-sm text-gray-700">
              Send SMS alerts to this contact
            </label>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-200"
            >
              {isEditingContact ? 'Update Contact' : 'Add Contact'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      ) : (
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-gray-500">No emergency contacts added yet.</p>
              <button
                onClick={() => setIsAddingContact(true)}
                className="mt-2 text-sm font-medium text-pink-600 hover:text-pink-700"
              >
                Add your first contact
              </button>
            </div>
          ) : (
            contacts.map(contact => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-gray-50 rounded-xl flex justify-between items-center"
              >
                <div>
                  <h4 className="font-medium text-gray-800">{contact.name}</h4>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <PhoneIcon className="w-3 h-3" />
                    <span>{contact.phoneNumber}</span>
                  </div>
                  <p className="text-xs text-gray-500">{contact.relationship}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-2 text-gray-500 hover:text-pink-600 transition-colors duration-200"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors duration-200"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}; 