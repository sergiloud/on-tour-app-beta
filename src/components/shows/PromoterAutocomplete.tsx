/**
 * Smart Autocomplete for Promoters
 * - Searches existing promoter contacts
 * - Allows creating new promoter contacts inline
 * - Syncs bidirectionally with contactStore
 */
import { useState, useRef, useEffect, useMemo } from 'react';
import { contactStore } from '../../shared/contactStore';
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

  // Get all promoter contacts
  const promoters = useMemo(() => {
    return contactStore.getAll().filter(c => c.type === 'promoter');
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

  const handleCreateNew = () => {
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

    contactStore.add(newContact);
    onChange(search.trim(), newContact.id);
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
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={e => handleInputChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t('shows.editor.placeholder.promoter') || 'Enter promoter name...'}
        className={className}
        autoComplete="off"
      />
      
      {isOpen && (search.length > 0 || filteredPromoters.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredPromoters.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-white/50 border-b border-slate-200 dark:border-white/10">
                {t('shows.editor.promoter.existing') || 'Existing Promoters'}
              </div>
              {filteredPromoters.map(promoter => {
                const displayName = promoter.company || `${promoter.firstName} ${promoter.lastName}`.trim();
                return (
                  <button
                    key={promoter.id}
                    type="button"
                    onClick={() => handleSelect(promoter)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex flex-col"
                  >
                    <span className="font-medium text-slate-900 dark:text-white">
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
            </>
          ) : search.trim() && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="w-full px-3 py-3 text-left hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2 text-accent-500"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>
                {t('shows.editor.promoter.create') || 'Create new promoter'}: <strong>"{search}"</strong>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
