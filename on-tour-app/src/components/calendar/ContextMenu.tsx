import React, { useEffect, useRef } from 'react';
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
    <div
      ref={menuRef}
      className="fixed z-50 glass rounded-lg border border-white/20 shadow-[var(--elev-4)] py-1 min-w-[180px]"
      style={{ left: adjustedX, top: adjustedY }}
      role="menu"
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.separator && <div className="border-t border-white/10 my-1" />}
          <button
            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2 ${
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
          >
            {item.icon && <span className="text-xs">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ContextMenu;