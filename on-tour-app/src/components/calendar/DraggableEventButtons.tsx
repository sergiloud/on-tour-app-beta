import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../lib/i18n';

export interface EventButton {
  id: string;
  label: string;
  description?: string;
  color: 'emerald' | 'amber' | 'sky' | 'rose' | 'purple' | 'cyan';
  type: 'show' | 'travel' | 'soundcheck' | 'rehearsal' | 'interview' | 'personal' | 'meeting' | 'other';
}

type Props = {
  buttons: EventButton[];
  onAddButton?: (btn: EventButton) => void;
  onRemoveButton?: (id: string) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, button: EventButton) => void;
  onDateSelected?: (button: EventButton, dateStr: string) => void;
};

const colorClasses: Record<EventButton['color'], { bg: string; border: string; text: string }> = {
  emerald: { bg: 'bg-emerald-500/25', border: 'border-emerald-500/40', text: 'text-emerald-100' },
  amber: { bg: 'bg-amber-500/25', border: 'border-amber-500/40', text: 'text-amber-100' },
  sky: { bg: 'bg-sky-500/25', border: 'border-sky-500/40', text: 'text-sky-100' },
  rose: { bg: 'bg-rose-500/25', border: 'border-rose-500/40', text: 'text-rose-100' },
  purple: { bg: 'bg-purple-500/25', border: 'border-purple-500/40', text: 'text-purple-100' },
  cyan: { bg: 'bg-cyan-500/25', border: 'border-cyan-500/40', text: 'text-cyan-100' },
};

const colorSelects: Record<EventButton['color'], { bg: string; hover: string; ring: string }> = {
  emerald: { bg: 'bg-emerald-600/40', hover: 'hover:bg-emerald-600/60', ring: 'ring-emerald-500/50' },
  amber: { bg: 'bg-amber-600/40', hover: 'hover:bg-amber-600/60', ring: 'ring-amber-500/50' },
  sky: { bg: 'bg-sky-600/40', hover: 'hover:bg-sky-600/60', ring: 'ring-sky-500/50' },
  rose: { bg: 'bg-rose-600/40', hover: 'hover:bg-rose-600/60', ring: 'ring-rose-500/50' },
  purple: { bg: 'bg-purple-600/40', hover: 'hover:bg-purple-600/60', ring: 'ring-purple-500/50' },
  cyan: { bg: 'bg-cyan-600/40', hover: 'hover:bg-cyan-600/60', ring: 'ring-cyan-500/50' },
};

interface CreateEventButtonModalProps {
  onClose: () => void;
  onSave: (btn: Omit<EventButton, 'id'>) => void;
}

const CreateEventButtonModal: React.FC<CreateEventButtonModalProps> = ({ onClose, onSave }) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'show' | 'travel' | 'soundcheck' | 'rehearsal' | 'interview' | 'personal' | 'meeting' | 'other'>('show');
  const [color, setColor] = useState<EventButton['color']>('emerald');
  const inputRef = useRef<HTMLInputElement>(null);
  const colors: EventButton['color'][] = ['emerald', 'amber', 'sky', 'rose', 'purple', 'cyan'];

  const eventTypes: Array<{ id: string; label: string }> = [
    { id: 'show', label: 'Show' },
    { id: 'travel', label: 'Travel' },
    { id: 'soundcheck', label: 'Soundcheck' },
    { id: 'rehearsal', label: 'Rehearsal' },
    { id: 'interview', label: 'Interview' },
    { id: 'personal', label: 'Personal' },
    { id: 'meeting', label: 'Meeting' },
    { id: 'other', label: 'Other' },
  ];

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    onSave({
      label: label.trim(),
      type,
      color,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />

        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="relative rounded-xl border border-white/15 shadow-2xl w-full max-w-2xl bg-gradient-to-br from-slate-100 dark:from-white/5 via-white/3 to-transparent backdrop-blur-xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, type: 'spring', stiffness: 350, damping: 30 }}
        >
          <div className="sticky top-0 px-6 py-6 border-b border-slate-200 dark:border-white/10 flex items-start justify-between bg-gradient-to-b from-white/4 to-transparent backdrop-blur-sm">
            <div className="flex-1">
              <h2 className="text-base font-bold text-white tracking-tight">Create Event Button</h2>
              <p className="text-xs text-slate-400 dark:text-white/60 mt-2 font-normal leading-relaxed">Set up a new event type for your calendar with custom name, color, and categorization</p>
            </div>
            <motion.button
              type="button"
              onClick={onClose}
              className="ml-4 p-1.5 rounded-md hover:bg-slate-200 dark:bg-white/10 transition-colors flex-shrink-0"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <svg className="w-5 h-5 text-slate-300 dark:text-white/50 hover:text-slate-500 dark:text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
            {/* Label */}
            <div className="flex flex-col gap-2">
              <label htmlFor="label" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
                Button Name <span className="text-red-400">*</span>
              </label>
              <input
                ref={inputRef}
                id="label"
                type="text"
                maxLength={40}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Soundcheck, Bus Tour, Pre-Show..."
                className="px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/30 focus:border-accent-500/50 focus:bg-slate-200 dark:bg-white/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 text-white text-sm focus:outline-none"
              />
              <div className="flex justify-between">
                <span className="text-[10px] text-slate-300 dark:text-white/50">Give this event type a descriptive name</span>
                <span className="text-[10px] text-slate-300 dark:text-white/50">{label.length}/40</span>
              </div>
            </div>

            {/* Type Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
                Event Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {eventTypes.map((et) => (
                  <button
                    key={et.id}
                    type="button"
                    onClick={() => setType(et.id as any)}
                    className={`px-3 py-2.5 rounded-lg border transition-all text-xs font-semibold ${
                      type === et.id
                        ? 'bg-slate-200 dark:bg-white/10 border-accent-500/40 text-white shadow-sm'
                        : 'bg-white/5 border-slate-300 dark:border-white/20 text-slate-500 dark:text-white/70 hover:bg-white/8 hover:border-white/30'
                    }`}
                  >
                    {et.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
                Color
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`py-2.5 rounded-lg border text-xs font-bold uppercase tracking-tight transition-all ${
                      color === c
                        ? `bg-slate-200 dark:bg-white/10 border-white/30 text-white shadow-sm`
                        : 'bg-white/5 border-white/15 text-slate-400 dark:text-white/60 hover:bg-white/8 hover:border-white/25'
                    }`}
                  >
                    <div className={`inline-block w-2 h-2 rounded-full mr-1 ${colorClasses[c].bg} border ${colorClasses[c].border}`} />
                    {c.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
                Preview
              </label>
              <div className={`px-4 py-3 rounded-lg border ${colorClasses[color].border} ${colorClasses[color].bg} ${colorClasses[color].text}`}>
                <div className="font-semibold text-sm">{label || 'Button Name'}</div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/20 hover:bg-white/8 hover:border-slate-400 dark:hover:border-white/30 text-white text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!label.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-black text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-accent-500"
              >
                Create
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const DraggableEventButtons: React.FC<Props> = ({ buttons, onAddButton, onRemoveButton, onDateSelected }) => {
  const [showModal, setShowModal] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleSaveButton = (btn: Omit<EventButton, 'id'>) => {
    const newButton: EventButton = {
      ...btn,
      id: Date.now().toString(),
    };
    onAddButton?.(newButton);
    setShowModal(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="glass rounded-xl border border-white/10 backdrop-blur-md px-3.5 md:px-4 py-3 md:py-3.5 hover:border-white/20 transition-all duration-300 bg-gradient-to-r from-white/6 to-white/3 shadow-sm"
      >
        <div className="flex items-center gap-2 md:gap-2.5 flex-wrap">
          <div className="text-[10px] md:text-xs opacity-75 font-semibold whitespace-nowrap text-white/80">
            {t('calendar.dragToCreate') || 'Drag to create:'}
          </div>

          {buttons.map((btn) => {
            const colors = colorClasses[btn.color];
            const isDragged = draggedId === btn.id;

            return (
              <div
                key={btn.id}
                draggable
                onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                  setDraggedId(btn.id);
                  (window as any).__draggedEventButton = btn;

                  try {
                    e.dataTransfer!.effectAllowed = 'copy';
                    e.dataTransfer!.setData('application/json', JSON.stringify(btn));
                    e.dataTransfer!.setData('text/plain', JSON.stringify(btn));
                  } catch {}

                  const dragImage = document.createElement('div');
                  dragImage.textContent = btn.label;
                  dragImage.style.position = 'absolute';
                  dragImage.style.left = '-9999px';
                  dragImage.style.padding = '10px 16px';
                  dragImage.style.borderRadius = '8px';
                  dragImage.style.backgroundColor = 'rgba(0,0,0,0.9)';
                  dragImage.style.color = 'white';
                  dragImage.style.fontSize = '12px';
                  dragImage.style.fontWeight = 'bold';
                  dragImage.style.whiteSpace = 'nowrap';
                  dragImage.style.zIndex = '9999';
                  dragImage.style.pointerEvents = 'none';
                  document.body.appendChild(dragImage);
                  try {
                    e.dataTransfer!.setDragImage(dragImage, 0, 0);
                  } catch {}
                  setTimeout(() => {
                    try {
                      document.body.removeChild(dragImage);
                    } catch {}
                  }, 0);
                }}
                onDragEnd={(e: React.DragEvent<HTMLDivElement>) => {
                  setDraggedId(null);
                  (window as any).__draggedEventButton = null;

                  const dropTarget = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;

                  if (dropTarget) {
                    let current = dropTarget as HTMLElement | null;
                    let cellElement: HTMLElement | null = null;

                    for (let i = 0; i < 10 && current && current !== document.body; i++) {
                      if (current.getAttribute('data-date')) {
                        cellElement = current;
                        break;
                      }
                      current = current.parentElement;
                    }

                    if (cellElement) {
                      const dateStr = cellElement.getAttribute('data-date');
                      if (dateStr && onDateSelected) {
                        onDateSelected(btn, dateStr);
                      }
                    }
                  }
                }}
                className={`group relative cursor-grab active:cursor-grabbing transition-all ${isDragged ? 'opacity-50' : ''}`}
              >
                <motion.div
                  className={`px-3 md:px-3.5 py-1.5 md:py-2 rounded-lg border text-[10px] md:text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-md hover:shadow-lg backdrop-blur-sm ${colors.bg} ${colors.border} ${colors.text}`}
                  title={`Drag to create: ${btn.label}`}
                  whileHover={{ scale: isDragged ? 1 : 1.08, y: isDragged ? 0 : -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15, type: 'spring', stiffness: 300 }}
                  animate={isDragged ? { scale: 0.95, opacity: 0.7 } : { scale: 1, opacity: 1 }}
                >
                  <span>{btn.label}</span>
                </motion.div>

                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500/80 hover:bg-rose-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    onRemoveButton?.(btn.id);
                  }}
                  title="Remove button"
                >
                  ×
                </motion.button>
              </div>
            );
          })}

          {onAddButton && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="px-3 md:px-3.5 py-1.5 md:py-2 rounded-lg border border-white/25 hover:border-white/40 bg-white/8 hover:bg-white/12 text-slate-600 dark:text-white/80 hover:text-white text-xs md:text-xs font-semibold transition-all inline-flex items-center gap-1.5 backdrop-blur-sm shadow-sm hover:shadow-md"
              title="Add new event button"
              transition={{ duration: 0.15, type: 'spring', stiffness: 300 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              {t('calendar.addButton') || 'Add'}
            </motion.button>
          )}
        </div>
      </motion.div>

      {showModal && <CreateEventButtonModal onClose={() => setShowModal(false)} onSave={handleSaveButton} />}
    </>
  );
};

export default DraggableEventButtons;
