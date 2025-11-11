/**
 * Smart Autocomplete for Venues
 * - Searches existing venues from venueStore
 * - Allows creating new venues inline
 * - Syncs bidirectionally with venueStore
 */
import { useState, useRef, useEffect, useMemo } from 'react';
import { venueStore } from '../../shared/venueStore';
import type { Venue } from '../../types/venue';
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

  // Get all venues
  const venues = useMemo(() => {
    return venueStore.getAll();
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

  const handleCreateNew = () => {
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

    venueStore.add(newVenue);
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
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={e => handleInputChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t('shows.editor.placeholder.venue') || 'Enter venue name...'}
        className={className}
        autoComplete="off"
      />
      
      {isOpen && (search.length > 0 || filteredVenues.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredVenues.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-white/50 border-b border-slate-200 dark:border-white/10">
                {t('shows.editor.venue.existing') || 'Existing Venues'}
              </div>
              {filteredVenues.map(venue => (
                <button
                  key={venue.id}
                  type="button"
                  onClick={() => handleSelect(venue)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex flex-col"
                >
                  <span className="font-medium text-slate-900 dark:text-white">
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
                {t('shows.editor.venue.create') || 'Create new venue'}: <strong>"{search}"</strong>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
