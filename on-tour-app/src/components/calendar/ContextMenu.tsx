import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';

type MenuItem = {
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
};

type Props = {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
};

const ContextMenu: React.FC<Props> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - (items.length * 32 + 16));

  return (
    <motion.div
      ref={menuRef}
      className="fixed z-50 glass rounded-lg border border-white/10 shadow-2xl backdrop-blur-md py-1 md:py-1.5 min-w-[180px] md:min-w-[200px]"
      style={{ left: adjustedX, top: adjustedY }}
      role="menu"
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.separator && <div className="border-t border-white/10 my-0.5" />}
          <motion.button
            className={`w-full text-left px-2 md:px-2.5 py-1 md:py-1.5 text-[10px] md:text-xs hover:bg-white/10 flex items-center gap-1.5 md:gap-2 rounded-md mx-0.5 transition-all duration-200 ${
              item.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => {
              if (!item.disabled) {
                item.action();
                onClose();
              }
            }}
            disabled={item.disabled}
            role="menuitem"
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
          >
            {item.icon && <span className="text-xs md:text-sm">{item.icon}</span>}
            <span className="font-medium text-xs">{item.label}</span>
          </motion.button>
        </React.Fragment>
      ))}
    </motion.div>
  );
};

export default ContextMenu;
