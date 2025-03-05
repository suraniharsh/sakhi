import React from 'react';
import { motion } from 'framer-motion';

export interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-red-50 border-l-4 border-red-400 p-4 ${className}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-red-700">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="ml-4 text-red-400 hover:text-red-500"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}; 