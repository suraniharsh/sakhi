import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircleIcon, PencilSquareIcon, CheckIcon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  dateOfBirth: string;
  cycleLength: number;
  periodLength: number;
  lastPeriodDate: string;
  phone?: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  isOAuthUser: boolean;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    photoURL: '',
    dateOfBirth: '',
    cycleLength: 28,
    periodLength: 5,
    lastPeriodDate: '',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    isOAuthUser: false
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      // Check if user is OAuth user
      const isOAuthUser = !!(user.providerData[0]?.providerId !== 'password');
      
      if (userDoc.exists()) {
        // Existing user - merge OAuth data if needed
        setProfile({
          ...userDoc.data() as UserProfile,
          email: user.email || '',
          displayName: isOAuthUser ? (user.displayName || '') : userDoc.data().displayName || '',
          photoURL: isOAuthUser ? (user.photoURL || '') : userDoc.data().photoURL || '',
          isOAuthUser
        });
      } else {
        // New user - create profile with OAuth data if available
        const newProfile = {
          displayName: isOAuthUser ? (user.displayName || '') : '',
          email: user.email || '',
          photoURL: isOAuthUser ? (user.photoURL || '') : '',
          dateOfBirth: '',
          cycleLength: 28,
          periodLength: 5,
          lastPeriodDate: '',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          isOAuthUser,
          createdAt: new Date()
        };
        
        await setDoc(doc(db, 'users', user.uid), newProfile);
        setProfile(newProfile as UserProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...profile,
        updatedAt: new Date()
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationToggle = (type: keyof UserProfile['notifications']) => {
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      toast.error('Failed to log out');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <p className="text-gray-500 text-lg">Please log in to view your profile</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-800">
            Profile
          </h1>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isEditing ? (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <PencilSquareIcon className="w-5 h-5" />
                  <span>Edit Profile</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-8">
            <div className="flex items-center space-x-4">
              {profile.photoURL ? (
                <img 
                  src={profile.photoURL} 
                  alt={profile.displayName} 
                  className="w-16 h-16 rounded-full border-2 border-white"
                />
              ) : (
                <div className="bg-white p-3 rounded-full">
                  <UserCircleIcon className="w-16 h-16 text-gray-600" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {profile.displayName || 'Your Name'}
                </h2>
                <p className="text-pink-100">{profile.email}</p>
                {profile.isOAuthUser && (
                  <span className="inline-block mt-1 px-2 py-1 bg-white/20 rounded-full text-xs text-white">
                    OAuth Account
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Display Name
                    {profile.isOAuthUser && (
                      <span className="ml-2 text-xs text-pink-500">(Set by OAuth)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    disabled={profile.isOAuthUser || !isEditing}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Optional"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Email
                    {profile.isOAuthUser && (
                      <span className="ml-2 text-xs text-pink-500">(Set by OAuth)</span>
                    )}
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Cycle Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Cycle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Average Cycle Length</label>
                  <input
                    type="number"
                    value={profile.cycleLength}
                    onChange={(e) => handleInputChange('cycleLength', parseInt(e.target.value))}
                    disabled={!isEditing}
                    min={21}
                    max={35}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Average Period Length</label>
                  <input
                    type="number"
                    value={profile.periodLength}
                    onChange={(e) => handleInputChange('periodLength', parseInt(e.target.value))}
                    disabled={!isEditing}
                    min={3}
                    max={7}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Last Period Date</label>
                  <input
                    type="date"
                    value={profile.lastPeriodDate}
                    onChange={(e) => handleInputChange('lastPeriodDate', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-800">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <button
                    onClick={() => isEditing && handleNotificationToggle('email')}
                    disabled={!isEditing}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                      profile.notifications.email ? 'bg-pink-500' : 'bg-gray-200'
                    } ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        profile.notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-800">Push Notifications</h4>
                    <p className="text-sm text-gray-500">Receive updates in browser</p>
                  </div>
                  <button
                    onClick={() => isEditing && handleNotificationToggle('push')}
                    disabled={!isEditing}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                      profile.notifications.push ? 'bg-pink-500' : 'bg-gray-200'
                    } ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        profile.notifications.push ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-800">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Receive updates via SMS</p>
                  </div>
                  <button
                    onClick={() => isEditing && handleNotificationToggle('sms')}
                    disabled={!isEditing}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                      profile.notifications.sms ? 'bg-pink-500' : 'bg-gray-200'
                    } ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        profile.notifications.sms ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 