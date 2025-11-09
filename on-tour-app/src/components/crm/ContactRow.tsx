/**
 * ContactRow - Fila de contacto para vista de tabla
 * Diseño consistente con SmartShowRow
 */

import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Building,
  Star,
  MoreVertical,
  MessageSquare,
} from 'lucide-react';
import type { Contact } from '../../types/crm';
import { CONTACT_TYPE_LABELS, CONTACT_TYPE_ICONS } from '../../types/crm';

interface ContactRowProps {
  contact: Contact;
  onClick: () => void;
  onDelete?: () => void;
}

export const ContactRow: React.FC<ContactRowProps> = ({
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

  const priorityBorderColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500',
  };

  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div
      onClick={onClick}
      className={`glass rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 transition-fast cursor-pointer ${priorityBorderColors[contact.priority]} border-l-2 group`}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-accent-400" />
          </div>

          {/* Nombre y empresa */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-accent-400 transition-fast">
                {fullName}
              </h3>
              {contact.priority === 'high' && (
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
              )}
              {hasRecentActivity && (
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-white/60">
              {contact.company && (
                <div className="flex items-center gap-1.5">
                  <Building className="w-3 h-3 text-slate-300 dark:text-white/40" />
                  <span className="truncate">{contact.company}</span>
                </div>
              )}
              {contact.position && (
                <span className="truncate">{contact.position}</span>
              )}
            </div>
          </div>

          {/* Tipo */}
          <div className="hidden md:flex items-center gap-2 min-w-[140px]">
            <span className="text-xs text-slate-500 dark:text-white/70">
              {CONTACT_TYPE_LABELS[contact.type]}
            </span>
          </div>

          {/* Contacto */}
          <div className="hidden lg:flex flex-col gap-1.5 min-w-[200px]">
            {contact.email && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/60">
                <Mail className="w-3 h-3 text-slate-300 dark:text-white/40" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/60">
                <Phone className="w-3 h-3 text-slate-300 dark:text-white/40" />
                <span className="truncate">{contact.phone}</span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="hidden xl:flex items-center min-w-[100px]">
            <span
              className={`px-2 py-1 rounded-lg text-[10px] uppercase tracking-wider font-medium border ${statusColors[contact.status]}`}
            >
              {contact.status}
            </span>
          </div>

          {/* Interacciones */}
          <div className="hidden xl:flex items-center gap-1.5 min-w-[100px] text-xs text-slate-400 dark:text-white/60">
            <MessageSquare className="w-3.5 h-3.5 text-slate-300 dark:text-white/40" />
            <span>{contact.interactions.length}</span>
          </div>

          {/* Last Contact */}
          <div className="hidden xl:flex items-center min-w-[100px] text-xs text-slate-400 dark:text-white/60">
            {contact.lastContactedAt
              ? new Date(contact.lastContactedAt).toLocaleDateString('es-ES', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Nunca'}
          </div>

          {/* More Button */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-lg flex-shrink-0"
            >
              <MoreVertical className="w-4 h-4 text-slate-300 dark:text-white/40" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

