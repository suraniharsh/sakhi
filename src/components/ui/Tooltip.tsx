import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const childRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const updatePosition = () => {
    if (!childRef.current) return;

    const rect = childRef.current.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    switch (position) {
      case 'top':
        setCoords({
          x: rect.left + rect.width / 2 + scrollLeft,
          y: rect.top + scrollTop,
        });
        break;
      case 'bottom':
        setCoords({
          x: rect.left + rect.width / 2 + scrollLeft,
          y: rect.bottom + scrollTop,
        });
        break;
      case 'left':
        setCoords({
          x: rect.left + scrollLeft,
          y: rect.top + rect.height / 2 + scrollTop,
        });
        break;
      case 'right':
        setCoords({
          x: rect.right + scrollLeft,
          y: rect.top + rect.height / 2 + scrollTop,
        });
        break;
    }
  };

  const handleMouseEnter = () => {
    updatePosition();
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const getTooltipStyles = () => {
    switch (position) {
      case 'top':
        return {
          transform: 'translateX(-50%) translateY(-100%)',
          top: -8,
          left: '50%',
        };
      case 'bottom':
        return {
          transform: 'translateX(-50%)',
          top: 8,
          left: '50%',
        };
      case 'left':
        return {
          transform: 'translateX(-100%) translateY(-50%)',
          top: '50%',
          left: -8,
        };
      case 'right':
        return {
          transform: 'translateY(-50%)',
          top: '50%',
          left: 8,
        };
    }
  };

  return (
    <div
      ref={childRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            style={getTooltipStyles()}
            className={`
              absolute z-50 px-3 py-2 text-sm font-medium text-white
              bg-gray-900 rounded-lg shadow-lg whitespace-nowrap
              pointer-events-none backdrop-blur-sm bg-opacity-90
              ${position === 'top' || position === 'bottom' ? 'left-1/2 transform -translate-x-1/2' : ''}
              ${position === 'left' || position === 'right' ? 'top-1/2 transform -translate-y-1/2' : ''}
            `}
          >
            {content}
            <div
              className={`
                absolute w-2 h-2 bg-gray-900 transform rotate-45
                ${position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' : ''}
                ${position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
                ${position === 'left' ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2' : ''}
                ${position === 'right' ? 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
              `}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 