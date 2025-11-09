/**
 * ContactCard - Tarjeta de contacto para vista grid
 * Diseño glass-morphism siguiendo el design system
 */

import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Building,
  Tag,
  Calendar,
  MoreVertical,
  Star,
  MessageSquare,
} from 'lucide-react';
import type { Contact } from '../../types/crm';
import { CONTACT_TYPE_LABELS, CONTACT_TYPE_ICONS } from '../../types/crm';

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
  onDelete?: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onClick,
  onDelete,
}) => {
  const fullName = `${contact.firstName} ${contact.lastName}`;
  const hasRecentActivity = contact.lastContactedAt
    ? new Date(contact.lastContactedAt) >
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : false;

  const Icon = CONTACT_TYPE_ICONS[contact.type] as React.ElementType;

  const priorityGradients = {
    high: 'from-red-500/20 to-red-600/10 border-red-500/20',
    medium: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20',
    low: 'from-green-500/20 to-green-600/10 border-green-500/20',
  };

  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div
      onClick={onClick}
      className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5 hover:border-accent-500/30 transition-all cursor-pointer group relative"
      style={{
        transform: 'translateY(0)',
        transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
      }}
    >
      {/* Icon & Status */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${priorityGradients[contact.priority]} flex items-center justify-center shadow-sm border`}
        >
          <Icon className="w-5 h-5 text-slate-900 dark:text-white" />
        </div>
        <div className="flex items-center gap-2">
          {contact.priority === 'high' && (
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          )}
          <span
            className={`px-2 py-1 rounded-lg text-[10px] uppercase tracking-wider font-medium border ${statusColors[contact.status]}`}
          >
            {contact.status}
          </span>
        </div>
      </div>

      {/* Name & Position */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-accent-400 transition-fast truncate">
            {fullName}
          </h3>
          {hasRecentActivity && (
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          )}
        </div>

        {contact.position && (
          <p className="text-sm text-slate-500 dark:text-white/70 truncate">{contact.position}</p>
        )}

        {contact.company && (
          <div className="flex items-center gap-1.5 text-xs text-slate-300 dark:text-white/50">
            <Building className="w-3.5 h-3.5" />
            <span className="truncate">{contact.company}</span>
          </div>
        )}

        <p className="text-xs text-slate-300 dark:text-white/50">{CONTACT_TYPE_LABELS[contact.type]}</p>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {contact.email && (
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/60">
            <Mail className="w-3 h-3 text-slate-300 dark:text-white/40" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}

        {contact.phone && (
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/60">
            <Phone className="w-3 h-3 text-slate-300 dark:text-white/40" />
            <span className="truncate">{contact.phone}</span>
          </div>
        )}

        {(contact.city || contact.country) && (
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/60">
            <MapPin className="w-3 h-3 text-slate-300 dark:text-white/40" />
            <span className="truncate">
              {[contact.city, contact.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {contact.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md text-[10px] text-slate-400 dark:text-white/60 border border-white/10"
            >
              {tag}
            </span>
          ))}
          {contact.tags.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] text-slate-300 dark:text-white/40">
              +{contact.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer Stats */}
      <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-300 dark:text-white/40" />
            <span className="text-xs text-slate-400 dark:text-white/60">{contact.interactions.length}</span>
          </div>

          {contact.lastContactedAt && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-300 dark:text-white/40" />
              <span className="text-xs text-slate-400 dark:text-white/60">
                {new Date(contact.lastContactedAt).toLocaleDateString('es-ES', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-1.5 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (contact.email) window.location.href = `mailto:${contact.email}`;
            }}
            disabled={!contact.email}
            className="flex-1 px-2 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] uppercase tracking-wider font-medium text-slate-500 dark:text-white/70 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-fast disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Email
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (contact.phone) window.location.href = `tel:${contact.phone}`;
            }}
            disabled={!contact.phone}
            className="flex-1 px-2 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] uppercase tracking-wider font-medium text-slate-500 dark:text-white/70 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-fast disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Llamar
          </button>
        </div>
      </div>

      {/* More Button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded"
        >
          <MoreVertical className="w-4 h-4 text-slate-300 dark:text-white/40" />
        </button>
      )}
    </div>
  );
};
