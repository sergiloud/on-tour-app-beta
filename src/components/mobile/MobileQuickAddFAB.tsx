/**
 * MobileQuickAddFAB
 * Floating Action Button for quick add in mobile view
 * Accessible, responsive, haptic feedback
 *
 * @module components/mobile/MobileQuickAddFAB
 */

import React, { useState } from 'react';
import { Plus, X, Calendar, MapPin } from 'lucide-react';

export interface QuickAddOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export interface MobileQuickAddFABProps {
  options?: QuickAddOption[];
  onAddShow?: () => void;
  onAddEvent?: () => void;
  onAddDestination?: () => void;
  className?: string;
}

/**
 * FAB Component with haptic feedback and animations
 */
export const MobileQuickAddFAB: React.FC<MobileQuickAddFABProps> = ({
  options,
  onAddShow,
  onAddEvent,
  onAddDestination,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Default options if none provided
  const defaultOptions: QuickAddOption[] = [
    {
      id: 'show',
      label: 'Add Show',
      icon: <Plus size={20} />,
      onClick: () => {
        onAddShow?.();
        setIsOpen(false);
      },
    },
    {
      id: 'event',
      label: 'Add Event',
      icon: <Calendar size={20} />,
      onClick: () => {
        onAddEvent?.();
        setIsOpen(false);
      },
    },
    {
      id: 'destination',
      label: 'Add Destination',
      icon: <MapPin size={20} />,
      onClick: () => {
        onAddDestination?.();
        setIsOpen(false);
      },
    },
  ];

  const items = options || defaultOptions;

  /**
   * Trigger haptic feedback
   */
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 5, 10]);
    }
  };

  /**
   * Handle FAB toggle
   */
  const handleToggle = () => {
    triggerHaptic();
    setIsOpen(!isOpen);
  };

  /**
   * Handle option click
   */
  const handleOptionClick = (option: QuickAddOption) => {
    triggerHaptic();
    option.onClick();
  };

  return (
    <>
      {/* Backdrop overlay when FAB menu open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* FAB Container */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        {/* FAB Menu Items */}
        <div
          className={`absolute bottom-20 right-0 flex flex-col gap-3 transition-all duration-300 origin-bottom-right ${
            isOpen
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-75 pointer-events-none'
          }`}
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleOptionClick(item)}
              className="w-14 h-14 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              }}
              aria-label={item.label}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>

        {/* Main FAB Button */}
        <button
          onClick={handleToggle}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold shadow-xl transition-all active:scale-95 ${
            isOpen
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          aria-label={isOpen ? 'Close menu' : 'Add item'}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>
    </>
  );
};

export default MobileQuickAddFAB;
