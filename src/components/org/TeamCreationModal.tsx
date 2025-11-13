/**
 * TeamCreationModal - Modal para crear equipos en organizaciones
 * Diseño siguiendo el sistema de diseño de ContactEditorModal
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Users, AlertCircle, FileText } from 'lucide-react';
import { logger } from '../../lib/logger';

interface TeamCreationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (teamData: { name: string; description?: string }) => void;
}

export const TeamCreationModal: React.FC<TeamCreationModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({ name: '', description: '' });
      setErrors({});
      // Focus first field after animation
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del equipo es obligatorio';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    logger.info('Creating team', {
      component: 'TeamCreationModal',
      teamName: formData.name,
      hasDescription: !!formData.description.trim()
    });

    onSave({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });

    // Close modal
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="glass rounded-xl border border-slate-200 dark:border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-slate-100 dark:from-white/5 to-transparent">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Users className="w-6 h-6 text-accent-400" />
              Crear Equipo
            </h2>
            <p className="text-sm text-slate-400 dark:text-white/60 mt-1">
              Organiza a los miembros de tu equipo en grupos de trabajo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-xl transition-fast group"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-slate-400 dark:text-white/60 group-hover:text-white transition-fast" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Información del Equipo */}
            <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-accent-400" />
                Información del Equipo
              </h3>
              
              <div className="space-y-4">
                {/* Nombre del equipo */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
                    Nombre del Equipo *
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast"
                    placeholder="Ej: Producción, Tour Management, Marketing..."
                    maxLength={50}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 dark:text-white/40 mt-1.5">
                    {formData.name.length}/50 caracteres
                  </p>
                </div>

                {/* Descripción (opcional) */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
                    Descripción
                    <span className="text-white/20 ml-1">(Opcional)</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast resize-none"
                    placeholder="Describe el propósito y responsabilidades del equipo..."
                    maxLength={200}
                  />
                  <p className="text-xs text-slate-400 dark:text-white/40 mt-1.5">
                    {formData.description.length}/200 caracteres
                  </p>
                </div>
              </div>

              {/* Info adicional */}
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-300 flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Después de crear el equipo, podrás añadir miembros desde la vista de equipos.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 dark:border-white/10 bg-gradient-to-r from-white/5 to-transparent">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-xl transition-fast font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!formData.name.trim()}
            className="px-5 py-2.5 bg-accent-500 hover:bg-accent-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-fast shadow-lg shadow-accent-500/20"
          >
            Crear Equipo
          </button>
        </div>
      </div>
    </div>
  );
};
