/**
 * Organization Selector Component
 * 
 * Dropdown selector for switching between organizations.
 * Shows current organization and allows switching to others.
 * 
 * Features:
 * - Current organization name + role badge
 * - List of all organizations with quick switch
 * - Create new organization button
 * - Favorite organizations (starred)
 */

import React, { useState } from 'react';
import { Building2, ChevronDown, Plus, Star } from 'lucide-react';
import { useOrganizationContext } from '../../context/OrganizationContext';

// Simple classnames utility
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface OrganizationSelectorProps {
  className?: string;
  onCreateOrganization?: () => void;
}

export function OrganizationSelector({ className, onCreateOrganization }: OrganizationSelectorProps) {
  const { currentOrg, currentRole, organizations, switchOrganization } = useOrganizationContext();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentOrg) {
    return (
      <button
        onClick={onCreateOrganization}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 transition-colors",
          className
        )}
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm font-medium">Create Organization</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors",
          className
        )}
      >
        <Building2 className="h-5 w-5" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">{currentOrg.name}</span>
          {currentRole && (
            <span className="text-xs text-muted-foreground capitalize">{currentRole}</span>
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-72 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
            {/* Organizations List */}
            <div className="max-h-80 overflow-y-auto">
              {organizations.map((org) => {
                const isCurrentOrg = org.id === currentOrg.id;
                
                return (
                  <button
                    key={org.id}
                    onClick={() => {
                      if (!isCurrentOrg) {
                        switchOrganization(org.id);
                      }
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-center justify-between",
                      isCurrentOrg && "bg-accent/50"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{org.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {org.type}
                        {currentRole && isCurrentOrg && (
                          <span className="ml-2">• {currentRole}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* TODO: Implement favorites
                    {org.isFavorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0 ml-2" />
                    )}
                    */}
                  </button>
                );
              })}
            </div>

            {/* Create Organization Button */}
            {onCreateOrganization && (
              <>
                <div className="border-t" />
                <button
                  onClick={() => {
                    onCreateOrganization();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Create Organization</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
