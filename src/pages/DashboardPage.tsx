import React from 'react';
import { motion } from 'framer-motion';
import { BirthControlCard } from '../components/dashboard/BirthControlCard';
import { SafetyResourceCard } from '../components/dashboard/SafetyResourceCard';
import { MenopauseCard } from '../components/dashboard/MenopauseCard';
import { ResourceLocatorCard } from '../components/dashboard/ResourceLocatorCard';
import { CycleSummaryCard } from '../components/dashboard/CycleSummaryCard';
import { CurrentPhaseCard } from '../components/dashboard/CurrentPhaseCard';
import { QuickTipsCard } from '../components/dashboard/QuickTipsCard';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <p className="text-gray-500 text-lg">Please log in to view your dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-display font-bold text-gray-800 mb-8"
        >
          Welcome back, {user.displayName || 'Friend'}
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Primary Cards - Full Width on Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <CurrentPhaseCard />
            <CycleSummaryCard />
          </motion.div>

          {/* Quick Tips - Side Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <QuickTipsCard />
          </motion.div>

          {/* Birth Control Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BirthControlCard />
          </motion.div>

          {/* Safety Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SafetyResourceCard />
          </motion.div>

          {/* Menopause Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <MenopauseCard />
          </motion.div>

          {/* Resource Locator - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-3"
          >
            <ResourceLocatorCard />
          </motion.div>
        </div>
      </div>
    </div>
  );
}; 