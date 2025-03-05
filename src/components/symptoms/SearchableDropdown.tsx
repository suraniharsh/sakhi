import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClickOutside } from '../../hooks/useClickOutside';

interface Option {
  id: string;
  name: string;
  category: string;
  description?: string;
}

interface SearchableDropdownProps {
  options: Option[];
  selectedOptions: string[];
  onSelect: (selectedIds: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  groupByCategory?: boolean;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  selectedOptions,
  onSelect,
  placeholder = 'Search...',
  maxSelections = Infinity,
  groupByCategory = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedOptions = groupByCategory
    ? filteredOptions.reduce((acc, option) => {
        if (!acc[option.category]) {
          acc[option.category] = [];
        }
        acc[option.category].push(option);
        return acc;
      }, {} as Record<string, Option[]>)
    : { '': filteredOptions };

  const handleSelect = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      onSelect(selectedOptions.filter(id => id !== optionId));
    } else if (selectedOptions.length < maxSelections) {
      onSelect([...selectedOptions, optionId]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isOpen) {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div
        className="w-full min-h-[42px] p-2 border rounded-lg bg-white cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map(id => {
            const option = options.find(o => o.id === id);
            if (!option) return null;
            
            return (
              <motion.div
                key={id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1"
              >
                {option.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(id);
                  }}
                  className="hover:text-purple-900"
                >
                  ×
                </button>
              </motion.div>
            );
          })}
          <input
            ref={inputRef}
            type="text"
            className="flex-1 min-w-[100px] outline-none bg-transparent"
            placeholder={selectedOptions.length === 0 ? placeholder : ''}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
              <div key={category}>
                {groupByCategory && categoryOptions.length > 0 && (
                  <div className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-50">
                    {category}
                  </div>
                )}
                {categoryOptions.map(option => (
                  <motion.div
                    key={option.id}
                    whileHover={{ backgroundColor: 'rgba(167, 139, 250, 0.1)' }}
                    className={`px-3 py-2 cursor-pointer ${
                      selectedOptions.includes(option.id)
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-700'
                    }`}
                    onClick={() => handleSelect(option.id)}
                  >
                    <div className="font-medium">{option.name}</div>
                    {option.description && (
                      <div className="text-sm text-gray-500">{option.description}</div>
                    )}
                  </motion.div>
                ))}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-gray-500 text-center">
                No results found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 