/**
 * Organization Selector Component
 * 
 * Redesigned to match the navbar style in DashboardLayout:
 * - Compact button with Building2 icon
 * - Glass morphism dropdown with proper borders
 * - Icon-based UI (no emojis)
 * - Consistent with UserMenu style
 * - Portal rendering for dropdown positioning
 * 
 * Features:
 * - Current organization name + role badge
 * - List of all organizations with quick switch
 * - Create new organization button
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Building2, ChevronDown, Plus, Check } from 'lucide-react';
import { useOrganizationContext } from '../../context/OrganizationContext';

interface OrganizationSelectorProps {
  className?: string;
  onCreateOrganization?: () => void;
}

export function OrganizationSelector({ className = '', onCreateOrganization }: OrganizationSelectorProps) {
  const { currentOrg, currentRole, organizations, switchOrganization } = useOrganizationContext();
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  // Calculate menu position when opening
  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!btnRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // No organization - show create button
  if (!currentOrg) {
    return (
      <button
        onClick={onCreateOrganization}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 hover:border-accent-500/40 text-accent-200 text-xs font-semibold transition-all ${className}`}
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Create Organization</span>
      </button>
    );
  }

  return (
    <div className="relative">
      {/* Trigger Button - matches UserMenu style */}
      <button
        ref={btnRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-200 dark:bg-white/10 transition-colors ${className}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Switch organization"
      >
        <Building2 className="h-4 w-4 opacity-70" />
        <div className="hidden md:flex flex-col items-start">
          <span className="text-xs opacity-85 leading-tight">{currentOrg.name}</span>
          {currentRole && (
            <span className="text-[10px] opacity-60 capitalize leading-tight">{currentRole}</span>
          )}
        </div>
        <ChevronDown className={`h-3 w-3 opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu - Portal rendered like UserMenu */}
      {isOpen && createPortal(
        <div
          ref={menuRef}
          role="menu"
          className="fixed min-w-[280px] glass rounded border border-white/12 p-1 text-sm shadow-2xl"
          style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px`, zIndex: 99999 }}
        >
          {/* Current Organization Info */}
          <div className="px-3 py-2 border-b border-slate-200 dark:border-white/10 mb-1">
            <div className="text-sm font-medium">{currentOrg.name}</div>
            <div className="text-xs opacity-60 capitalize">
              {currentOrg.type} • {currentRole}
            </div>
          </div>

          {/* Organizations List */}
          <div className="max-h-64 overflow-y-auto">
            {organizations.map((org) => {
              const isCurrentOrg = org.id === currentOrg.id;
              
              return (
                <button
                  key={org.id}
                  role="menuitem"
                  onClick={() => {
                    if (!isCurrentOrg) {
                      switchOrganization(org.id);
                    }
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-slate-200 dark:bg-white/10 transition-colors flex items-center justify-between gap-2 ${
                    isCurrentOrg ? 'bg-slate-100 dark:bg-white/5' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{org.name}</div>
                    <div className="text-xs opacity-60 capitalize truncate">
                      {org.type}
                    </div>
                  </div>
                  
                  {isCurrentOrg && (
                    <Check className="h-4 w-4 text-accent-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Create Organization Button */}
          {onCreateOrganization && (
            <>
              <div className="h-px bg-slate-200 dark:bg-white/10 my-1" />
              <button
                role="menuitem"
                onClick={() => {
                  onCreateOrganization();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-slate-200 dark:bg-white/10 transition-colors flex items-center gap-2 text-accent-400 hover:text-accent-300"
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">Create Organization</span>
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

