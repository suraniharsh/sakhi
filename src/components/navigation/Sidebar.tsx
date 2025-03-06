import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  BellIcon,
  UserCircleIcon,
  CalendarIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/cycle', label: 'Log Cycle', icon: CalendarIcon },
  { path: '/predictions', label: 'Predictions', icon: ArrowTrendingUpIcon },
  { path: '/reminders', label: 'Reminders', icon: BellIcon },
  { path: '/safety', label: 'Safety', icon: ShieldCheckIcon },
  { path: '/profile', label: 'Profile', icon: UserIcon },
  { path: '/community', label: 'Community', icon: ChatBubbleLeftRightIcon },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="h-screen w-64 bg-white shadow-lg fixed left-0 top-0 z-50"
    >
      <div className="p-6">
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-display font-bold text-gray-800 mb-8"
        >
          Sakhi
        </motion.h1>

        <nav className="space-y-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <motion.div
                key={item.path}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl
                    transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-pink-50'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon 
                    className={`w-5 h-5 ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-pink-500'
                    } relative z-10`}
                  />
                  <span className="relative z-10 font-medium">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
          <p className="text-sm text-gray-600 font-medium">Need help?</p>
          <p className="text-xs text-gray-500 mt-1">
            We're here to support you on your journey.
          </p>
          <button className="mt-3 w-full py-2 px-4 bg-white text-pink-500 rounded-lg text-sm font-medium hover:shadow-md transition-shadow">
            Contact Support
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.div>
  );
}; 