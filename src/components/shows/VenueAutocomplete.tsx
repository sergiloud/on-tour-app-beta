/**
 * Smart Autocomplete for Venues
 * - Searches existing venues from venueStore
 * - Allows creating new venues inline
 * - Syncs bidirectionally with venueStore
 * - Also creates a venue_manager contact for centralized CRM
 */
import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { venueStore } from '../../shared/venueStore';
import { HybridContactService } from '../../services/hybridContactService';
import { HybridVenueService } from '../../services/hybridVenueService';
import { useAuth } from '../../context/AuthContext';
import { contactKeys } from '../../hooks/useContactsQuery';
import type { Venue } from '../../types/venue';
import type { Contact } from '../../types/crm';
import { t } from '../../lib/i18n';

interface VenueAutocompleteProps {
  value: string;
  onChange: (value: string, venueId?: string) => void;
  placeholder?: string;
  className?: string;
  onBlur?: () => void;
  city?: string;
  country?: string;
}

export function VenueAutocomplete({ 
  value, 
  onChange, 
  placeholder, 
  className,
  onBlur,
  city,
  country
}: VenueAutocompleteProps) {
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

  // Get all venues - subscribe to changes
  const [venues, setVenues] = useState<Venue[]>([]);
  
  useEffect(() => {
    const updateVenues = () => {
      setVenues(venueStore.getAll());
    };
    
    updateVenues();
    const unsubscribe = venueStore.subscribe(updateVenues);
    return unsubscribe;
  }, []);

  // Filter venues based on search
  const filteredVenues = useMemo(() => {
    if (!search.trim()) return venues.slice(0, 10);
    
    const normalized = search.toLowerCase();
    return venues.filter(v => {
      const nameMatch = v.name.toLowerCase().includes(normalized);
      const cityMatch = v.city?.toLowerCase().includes(normalized);
      const countryMatch = v.country?.toLowerCase().includes(normalized);
      return nameMatch || cityMatch || countryMatch;
    }).slice(0, 10);
  }, [search, venues]);

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

  const handleSelect = (venue: Venue) => {
    setSearch(venue.name);
    onChange(venue.name, venue.id);
    setIsOpen(false);
  };

  const handleCreateNew = async () => {
    if (!search.trim()) return;

    // Create new venue
    const newVenue: Venue = {
      id: crypto.randomUUID(),
      name: search.trim(),
      city: city,
      country: country,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // ✅ Save venue to BOTH localStorage AND Firestore
    await HybridVenueService.saveVenue(newVenue, userId);
    
    // ✅ Also create a contact entry for centralized CRM
    const venueContact: Contact = {
      id: crypto.randomUUID(),
      firstName: search.trim(),
      lastName: '',
      email: '',
      phone: '',
      company: search.trim(),
      position: 'Venue Manager',
      type: 'venue_manager',
      priority: 'medium',
      status: 'active',
      tags: ['venue'],
      city: city,
      country: country,
      notes: [],
      interactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // ✅ Save contact to both localStorage AND Firestore
    await HybridContactService.saveContact(venueContact, userId);
    
    // ✅ Invalidate React Query cache to refresh Contacts page
    queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
    
    setSearch(search.trim());
    onChange(search.trim(), newVenue.id);
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
    } else if (e.key === 'Enter' && isOpen && filteredVenues.length === 0 && search.trim()) {
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
        placeholder={placeholder || t('shows.editor.placeholder.venue') || 'Enter venue name...'}
        className={className}
        autoComplete="off"
      />
      
      {isOpen && (search.length > 0 || filteredVenues.length > 0) && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[10001] glass border border-slate-200 dark:border-white/10 rounded-[10px] shadow-xl backdrop-blur-xl max-h-80 overflow-hidden flex flex-col"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          {filteredVenues.length > 0 ? (
            <>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                {t('shows.editor.venue.existing') || 'Existing Venues'}
              </div>
              <div className="overflow-y-auto">
                {filteredVenues.map(venue => (
                  <button
                    key={venue.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(venue);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex flex-col gap-1 border-b border-slate-100 dark:border-white/5 last:border-0"
                  >
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {venue.name}
                    </span>
                    {(venue.city || venue.country) && (
                      <span className="text-xs text-slate-500 dark:text-white/50">
                        {[venue.city, venue.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {venue.capacity && (
                      <span className="text-xs text-slate-400 dark:text-white/40">
                        Capacity: {venue.capacity.toLocaleString()}
                      </span>
                    )}
                  </button>
                ))}
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
                  {t('shows.editor.venue.create') || 'Create new venue'}
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
