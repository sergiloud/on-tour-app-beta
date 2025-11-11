/**
 * Smart Autocomplete for Promoters
 * - Searches existing promoter contacts
 * - Allows creating new promoter contacts inline
 * - Syncs bidirectionally with contactStore + Firestore
 */
import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { contactStore } from '../../shared/contactStore';
import { HybridContactService } from '../../services/hybridContactService';
import { useAuth } from '../../context/AuthContext';
import { contactKeys } from '../../hooks/useContactsQuery';
import type { Contact } from '../../types/crm';
import { t } from '../../lib/i18n';

interface PromoterAutocompleteProps {
  value: string;
  onChange: (value: string, contactId?: string) => void;
  placeholder?: string;
  className?: string;
  onBlur?: () => void;
}

export function PromoterAutocomplete({ 
  value, 
  onChange, 
  placeholder, 
  className,
  onBlur 
}: PromoterAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  // Update dropdown position when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  // Sync search with value prop when it changes externally
  useEffect(() => {
    setSearch(value);
  }, [value]);

  // Get all promoter contacts - subscribe to changes
  const [promoters, setPromoters] = useState<Contact[]>([]);
  
  useEffect(() => {
    const updatePromoters = () => {
      setPromoters(contactStore.getAll().filter(c => c.type === 'promoter'));
    };
    
    updatePromoters();
    const unsubscribe = contactStore.subscribe(updatePromoters);
    return unsubscribe;
  }, []);

  // Filter promoters based on search
  const filteredPromoters = useMemo(() => {
    if (!search.trim()) return promoters.slice(0, 10);
    
    const normalized = search.toLowerCase();
    return promoters.filter(p => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const company = p.company?.toLowerCase() || '';
      return fullName.includes(normalized) || company.includes(normalized);
    }).slice(0, 10);
  }, [search, promoters]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (promoter: Contact) => {
    const displayName = promoter.company || `${promoter.firstName} ${promoter.lastName}`.trim();
    setSearch(displayName);
    onChange(displayName, promoter.id);
    setIsOpen(false);
  };

  const handleCreateNew = async () => {
    if (!search.trim()) return;

    // Create new promoter contact
    const newContact: Contact = {
      id: crypto.randomUUID(),
      firstName: search.trim(),
      lastName: '',
      email: '',
      phone: '',
      company: '',
      position: 'Promoter',
      type: 'promoter',
      priority: 'medium',
      status: 'active',
      tags: ['promoter'],
      notes: [],
      interactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // ✅ Save to both localStorage AND Firestore
    await HybridContactService.saveContact(newContact, userId);
    
    // ✅ Invalidate React Query cache to refresh Contacts page
    queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
    
    const displayName = search.trim();
    setSearch(displayName);
    onChange(displayName, newContact.id);
    setIsOpen(false);
  };

  const handleInputChange = (newValue: string) => {
    setSearch(newValue);
    onChange(newValue, undefined);
    if (!isOpen && newValue.length > 0) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && isOpen && filteredPromoters.length === 0 && search.trim()) {
      e.preventDefault();
      handleCreateNew();
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={e => handleInputChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t('shows.editor.placeholder.promoter') || 'Enter promoter name...'}
        className={className}
        autoComplete="off"
      />
      
      {isOpen && (search.length > 0 || filteredPromoters.length > 0) && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[10001] glass border border-slate-200 dark:border-white/10 rounded-[10px] shadow-xl backdrop-blur-xl max-h-80 overflow-hidden flex flex-col"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          {filteredPromoters.length > 0 ? (
            <>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                {t('shows.editor.promoter.existing') || 'Existing Promoters'}
              </div>
              <div className="overflow-y-auto">
                {filteredPromoters.map(promoter => {
                  const displayName = promoter.company || `${promoter.firstName} ${promoter.lastName}`.trim();
                  return (
                    <button
                      key={promoter.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(promoter);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex flex-col gap-1 border-b border-slate-100 dark:border-white/5 last:border-0"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">
                        {displayName}
                      </span>
                      {promoter.company && promoter.firstName && (
                        <span className="text-xs text-slate-500 dark:text-white/50">
                          {promoter.firstName} {promoter.lastName}
                        </span>
                      )}
                      {promoter.email && (
                        <span className="text-xs text-slate-400 dark:text-white/40">
                          {promoter.email}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : search.trim() && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleCreateNew();
              }}
              className="w-full px-4 py-4 text-left hover:bg-accent-500/10 transition-all flex items-center gap-3 text-accent-500 dark:text-accent-400"
            >
              <div className="w-8 h-8 rounded-full bg-accent-500/10 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {t('shows.editor.promoter.create') || 'Create new promoter'}
                </span>
                <span className="text-xs opacity-70">"{search}"</span>
              </div>
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
