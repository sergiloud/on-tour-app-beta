import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../lib/i18n';
import { announce } from '../../lib/announcer';
import { trackEvent } from '../../lib/telemetry';

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox';

export type CustomField = {
  id: string;
  name: string;
  type: CustomFieldType;
  required: boolean;
  options?: string[]; // for select type
  placeholder?: string;
  defaultValue?: any;
};

export type CustomEventTypeConfig = {
  typeId: string;
  typeName: string;
  fields: CustomField[];
  color?: string;
  icon?: string;
};

type Props = {
  eventTypeId: string;
  eventTypeName: string;
  onSave: (config: CustomEventTypeConfig) => void;
  onClose: () => void;
  initialConfig?: CustomEventTypeConfig;
};

/**
 * Modal for defining custom fields for event types
 */
const CustomFieldsModal: React.FC<Props> = ({
  eventTypeId,
  eventTypeName,
  onSave,
  onClose,
  initialConfig,
}) => {
  const [fields, setFields] = React.useState<CustomField[]>(initialConfig?.fields || []);
  const [editingFieldId, setEditingFieldId] = React.useState<string | null>(null);
  const [editingField, setEditingField] = React.useState<CustomField | null>(null);

  const handleAddField = () => {
    const newField: CustomField = {
      id: crypto.randomUUID?.() || Math.random().toString(36).slice(2, 10),
      name: 'New Field',
      type: 'text',
      required: false,
    };
    setFields([...fields, newField]);
    setEditingFieldId(newField.id);
    setEditingField(newField);
  };

  const handleSaveField = () => {
    if (!editingField || !editingField.name.trim()) {
      announce('Field name is required');
      return;
    }

    if (editingFieldId) {
      setFields((prev) =>
        prev.map((f) => (f.id === editingFieldId ? editingField : f))
      );
    }

    setEditingFieldId(null);
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    if (editingFieldId === fieldId) {
      setEditingFieldId(null);
      setEditingField(null);
    }
  };

  const handleSave = () => {
    const config: CustomEventTypeConfig = {
      typeId: eventTypeId,
      typeName: eventTypeName,
      fields,
    };
    onSave(config);
    announce(`Saved ${fields.length} field${fields.length !== 1 ? 's' : ''} for ${eventTypeName}`);
    trackEvent('calendar.custom-fields.save', { typeId: eventTypeId, fieldCount: fields.length });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative glass rounded-xl p-6 w-[600px] max-h-[80vh] border border-white/20 shadow-2xl overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            Custom Fields: {eventTypeName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {/* Fields list */}
          <AnimatePresence mode="popLayout">
            {fields.length === 0 ? (
              <motion.p
                key="empty"
                className="text-center text-white/50 py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No fields yet. Add one to get started!
              </motion.p>
            ) : (
              fields.map((field) => (
                <motion.div
                  key={field.id}
                  className={`p-3 rounded border transition-all ${
                    editingFieldId === field.id
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                  layout
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setEditingFieldId(field.id);
                        setEditingField({ ...field });
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{field.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/70">
                          {field.type}
                        </span>
                        {field.required && (
                          <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                            Required
                          </span>
                        )}
                      </div>
                      {field.placeholder && (
                        <p className="text-xs text-white/50 mt-1">Placeholder: {field.placeholder}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="px-2 py-1 rounded text-xs bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {/* Edit field form */}
          {editingField && (
            <motion.div
              className="p-4 rounded border border-cyan-500/50 bg-cyan-500/5 space-y-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">Edit Field</h3>
                <button
                  onClick={() => setEditingFieldId(null)}
                  className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Done
                </button>
              </div>

              <div>
                <label className="text-xs text-white/70 font-medium mb-1 block">Field Name</label>
                <input
                  type="text"
                  value={editingField.name}
                  onChange={(e) =>
                    setEditingField({ ...editingField, name: e.target.value })
                  }
                  className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., Flight Number"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 font-medium mb-1 block">Field Type</label>
                <select
                  value={editingField.type}
                  onChange={(e) =>
                    setEditingField({
                      ...editingField,
                      type: e.target.value as CustomFieldType,
                    })
                  }
                  className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>

              {editingField.type === 'select' && (
                <div>
                  <label className="text-xs text-white/70 font-medium mb-1 block">
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingField.options?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        options: e.target.value
                          .split(',')
                          .map((o) => o.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g., Option 1, Option 2, Option 3"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-white/70 font-medium mb-1 block">Placeholder</label>
                <input
                  type="text"
                  value={editingField.placeholder || ''}
                  onChange={(e) =>
                    setEditingField({ ...editingField, placeholder: e.target.value })
                  }
                  className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Placeholder text"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingField.required}
                  onChange={(e) =>
                    setEditingField({ ...editingField, required: e.target.checked })
                  }
                  className="w-4 h-4 rounded"
                />
                <span className="text-xs text-white">Required field</span>
              </label>

              <button
                onClick={handleSaveField}
                className="w-full px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors"
              >
                Save Field Changes
              </button>
            </motion.div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.button
            onClick={handleAddField}
            className="flex-1 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            + Add Field
          </motion.button>
          <motion.button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Save Configuration
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(CustomFieldsModal);
