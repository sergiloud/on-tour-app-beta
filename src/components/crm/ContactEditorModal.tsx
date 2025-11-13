/**
 * ContactEditorModal - Modal para crear/editar contactos
 * Diseño similar a CreateShowModal con glass-morphism
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Tag,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { Contact, ContactType, ContactPriority, ContactStatus, ContactNote } from '../../types/crm';
import { CONTACT_TYPE_LABELS, COMMON_TAGS } from '../../types/crm';
import { logger } from '../../lib/logger';

interface ContactEditorModalProps {
  contact?: Contact;
  onSave: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const ContactEditorModal: React.FC<ContactEditorModalProps> = ({
  contact,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    company: contact?.company || '',
    position: contact?.position || '',
    type: contact?.type || ('promoter' as ContactType),
    email: contact?.email || '',
    phone: contact?.phone || '',
    website: contact?.website || '',
    instagram: contact?.instagram || '',
    twitter: contact?.twitter || '',
    linkedin: contact?.linkedin || '',
    facebook: contact?.facebook || '',
    city: contact?.city || '',
    country: contact?.country || '',
    priority: contact?.priority || ('medium' as ContactPriority),
    status: contact?.status || ('active' as ContactStatus),
    tags: contact?.tags || [],
    generalNotes: contact?.notes?.[0]?.content || '', // First note as general notes
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Prepare notes array
    const notes: ContactNote[] = [];
    if (formData.generalNotes.trim()) {
      // If editing, preserve the first note's ID and timestamp
      const existingNote = contact?.notes?.[0];
      notes.push({
        id: existingNote?.id || `note-${Date.now()}`,
        content: formData.generalNotes.trim(),
        createdAt: existingNote?.createdAt || new Date().toISOString(),
      });
    }
    // Preserve other existing notes if any
    if (contact?.notes && contact.notes.length > 1) {
      notes.push(...contact.notes.slice(1));
    }

    const { generalNotes, ...contactData } = formData;

    const finalContactData = {
      ...contactData,
      notes,
      interactions: contact?.interactions || [],
      lastContactedAt: contact?.lastContactedAt,
    };

    logger.info('[ContactEditorModal] Saving contact with notes', {
      contactId: contact?.id,
      notesCount: notes.length,
      hasNotes: notes.length > 0
    });

    onSave(finalContactData);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleAddCommonTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-xl border border-slate-200 dark:border-white/10 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-slate-100 dark:from-white/5 to-transparent">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              {contact ? (
                <>
                  <User className="w-6 h-6 text-accent-400" />
                  Editar Contacto
                </>
              ) : (
                <>
                  <User className="w-6 h-6 text-accent-400" />
                  Nuevo Contacto
                </>
              )}
            </h2>
            <p className="text-sm text-slate-400 dark:text-white/60 mt-1">
              {contact ? 'Actualiza la información del contacto' : 'Añade un nuevo contacto profesional a tu CRM'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-xl transition-fast group"
          >
            <X className="w-5 h-5 text-slate-400 dark:text-white/60 group-hover:text-white transition-fast" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Información Personal */}
            <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-accent-400" />
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast"
                    placeholder="Ej: Juan"
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast"
                    placeholder="Ej: Pérez"
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast"
                    placeholder="Ej: Live Nation"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast"
                    placeholder="Ej: Booking Manager"
                  />
                </div>
              </div>
            </div>

            {/* Clasificación */}
            <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Building className="w-4 h-4 text-accent-400" />
                Clasificación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
                    Tipo de Contacto
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as ContactType })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white focus:border-accent-500/50 focus:outline-none transition-fast"
                  >
                    {Object.entries(CONTACT_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
                    Prioridad
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as ContactPriority })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white focus:border-accent-500/50 focus:outline-none transition-fast"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ContactStatus })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white focus:border-accent-500/50 focus:outline-none transition-fast"
                  >
                    <option value="active">Activo</option>
                    <option value="pending">Pendiente</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent-400" />
                Datos de Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast"
                    placeholder="contacto@ejemplo.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast"
                    placeholder="+34 600 00 00 00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast"
                    placeholder="https://ejemplo.com"
                  />
                </div>
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent-400" />
                Redes Sociales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 items-center gap-2 font-medium">
                    <Instagram className="w-3.5 h-3.5" />
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) =>
                      setFormData({ ...formData, instagram: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast"
                    placeholder="@usuario"
                  />
                </div>

                <div>
                  <label className="flex text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 items-center gap-2 font-medium">
                    <Twitter className="w-3.5 h-3.5" />
                    Twitter/X
                  </label>
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) =>
                      setFormData({ ...formData, twitter: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast"
                    placeholder="@usuario"
                  />
                </div>

                <div>
                  <label className="flex text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 items-center gap-2 font-medium">
                    <Linkedin className="w-3.5 h-3.5" />
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedin: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast"
                    placeholder="linkedin.com/in/usuario"
                  />
                </div>

                <div>
                  <label className="flex text-sm text-slate-500 dark:text-white/70 mb-2 items-center gap-2">
                    <Facebook className="w-3.5 h-3.5" />
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={formData.facebook}
                    onChange={(e) =>
                      setFormData({ ...formData, facebook: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast"
                    placeholder="facebook.com/usuario"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 dark:text-white/80 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Ubicación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-500 dark:text-white/70 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast"
                    placeholder="Ej: Barcelona"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-500 dark:text-white/70 mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast"
                    placeholder="Ej: España"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-accent-400" />
                Etiquetas
              </h3>

              {/* Common tags */}
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">Etiquetas sugeridas</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {COMMON_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddCommonTag(tag)}
                      disabled={formData.tags.includes(tag)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/70 hover:bg-accent-500/20 hover:border-accent-500/30 hover:text-accent-400 transition-fast disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom tag input */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast"
                  placeholder="Etiqueta personalizada..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2.5 bg-accent-500/20 border border-accent-500/30 rounded-xl text-accent-400 hover:bg-accent-500/30 transition-fast font-medium text-sm"
                >
                  Añadir
                </button>
              </div>

              {/* Selected tags */}
              {formData.tags.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">Etiquetas seleccionadas ({formData.tags.length})</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {formData.tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-500/20 border border-accent-500/30 text-accent-400 group hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-400 transition-all"
                      >
                        <span className="text-xs font-medium">{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="transition-transform group-hover:scale-110"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* General Notes */}
            <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent-400" />
                Notas Generales
              </h3>
              <textarea
                value={formData.generalNotes}
                onChange={(e) =>
                  setFormData({ ...formData, generalNotes: e.target.value })
                }
                rows={6}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast resize-none"
                placeholder="Añade notas, comentarios o información adicional sobre este contacto..."
              />
              <p className="text-xs text-slate-400 dark:text-white/40 mt-2">
                Usa este espacio para información importante, recordatorios o contexto sobre este contacto.
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-200 dark:border-white/10 bg-white/[0.02]">
          <div className="text-xs text-slate-300 dark:text-white/50">
            {contact ? `ID: ${contact.id.slice(0, 8)}...` : '* Campos obligatorios'}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-fast font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 border border-accent-500/30 rounded-xl text-white hover:from-accent-600 hover:to-accent-700 transition-all font-medium flex items-center gap-2 shadow-lg shadow-accent-500/20"
            >
              <Save className="w-4 h-4" />
              {contact ? 'Guardar Cambios' : 'Crear Contacto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
