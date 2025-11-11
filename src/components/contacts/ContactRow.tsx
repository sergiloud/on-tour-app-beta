import React, { memo } from 'react';
import { Contact } from '../../types/crm';
import { Mail, Phone, MapPin, Building2, Eye, Edit2, Trash2 } from 'lucide-react';

interface ContactRowProps {
  contact: Contact;
  isSelected: boolean;
  onView: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

/**
 * ContactRow - Memoized row component para mejor performance en listas grandes
 */
export const ContactRow = memo<ContactRowProps>(({ contact, isSelected, onView, onEdit, onDelete }) => {
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(contact);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(contact);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(contact.id);
  };

  return (
    <tr 
      onClick={() => onView(contact)}
      className={`hover:bg-interactive-hover cursor-pointer transition-all duration-150 ${
        isSelected ? 'bg-accent-500/10 border-l-2 border-accent-500' : ''
      }`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-accent-500/20">
            {contact.firstName[0]}{contact.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                {contact.firstName} {contact.lastName}
              </p>
              {contact.priority === 'high' && (
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-lg shadow-red-400/50" />
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-slate-900 dark:text-white text-sm font-medium">{contact.company || '—'}</p>
        <p className="text-slate-300 dark:text-white/50 text-xs mt-0.5">{contact.position || 'Sin cargo'}</p>
      </td>
      <td className="px-6 py-4 text-sm text-theme-secondary">
        {contact.email && (
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-3.5 h-3.5 text-slate-300 dark:text-white/40" />
            <span className="text-theme-secondary">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-300 dark:text-white/40" />
            <span className="text-theme-secondary">{contact.phone}</span>
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        {contact.city || contact.country ? (
          <div className="flex items-center gap-2 text-sm text-theme-secondary">
            <MapPin className="w-3.5 h-3.5 text-slate-300 dark:text-white/40" />
            <span>{contact.city ? `${contact.city}, ` : ''}{contact.country}</span>
          </div>
        ) : (
          <span className="text-slate-400 dark:text-white/40 text-xs">—</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
          contact.priority === 'high' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
          contact.priority === 'medium' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' :
          'bg-green-500/15 text-green-400 border border-green-500/30'
        }`}>
          {contact.priority === 'high' ? 'Alta' : contact.priority === 'medium' ? 'Media' : 'Baja'}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-1">
          <button 
            onClick={handleView}
            className="p-2 rounded-lg hover:bg-accent-500/20 text-theme-secondary hover:text-accent-400 transition-all duration-150" 
            title="Ver"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={handleEdit}
            className="p-2 rounded-lg hover:bg-blue-500/20 text-theme-secondary hover:text-blue-400 transition-all duration-150" 
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-red-500/20 text-theme-secondary hover:text-red-400 transition-all duration-150" 
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison para evitar re-renders innecesarios
  return (
    prevProps.contact.id === nextProps.contact.id &&
    prevProps.contact.updatedAt === nextProps.contact.updatedAt &&
    prevProps.isSelected === nextProps.isSelected
  );
});

ContactRow.displayName = 'ContactRow';
