import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventType } from './EventTypeManager';
import { t } from '../../lib/i18n';
import { Plus, Trash2, Edit2 } from 'lucide-react';

/**
 * Custom Field Types
 */
export type CustomFieldType = 'text' | 'number' | 'email' | 'phone' | 'url' | 'date' | 'select' | 'checkbox';

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: CustomFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[]; // For select fields
  description?: string;
}

export interface EventTypeWithFields extends EventType {
  customFields?: CustomField[];
}

export interface EventFieldValue {
  fieldId: string;
  value: any;
}

/**
 * Predefined Field Templates by Event Type
 */
const FIELD_TEMPLATES: Record<string, CustomField[]> = {
  show: [
    {
      id: 'venue-name',
      name: 'venue_name',
      label: 'Venue Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Madison Square Garden',
    },
    {
      id: 'capacity',
      name: 'capacity',
      label: 'Venue Capacity',
      type: 'number',
      placeholder: 'e.g., 20000',
    },
    {
      id: 'ticket-price',
      name: 'ticket_price',
      label: 'Ticket Price (€)',
      type: 'number',
      placeholder: 'e.g., 50',
    },
    {
      id: 'sound-check',
      name: 'sound_check',
      label: 'Sound Check Time',
      type: 'date',
    },
  ],
  travel: [
    {
      id: 'flight-number',
      name: 'flight_number',
      label: 'Flight Number',
      type: 'text',
      placeholder: 'e.g., AA1234',
    },
    {
      id: 'airline',
      name: 'airline',
      label: 'Airline',
      type: 'text',
      placeholder: 'e.g., American Airlines',
    },
    {
      id: 'booking-code',
      name: 'booking_code',
      label: 'Booking Code',
      type: 'text',
      placeholder: 'e.g., ABC123',
    },
    {
      id: 'departure-time',
      name: 'departure_time',
      label: 'Departure Time',
      type: 'date',
      required: true,
    },
    {
      id: 'departure-city',
      name: 'departure_city',
      label: 'Departure City',
      type: 'text',
      placeholder: 'e.g., London',
    },
    {
      id: 'arrival-city',
      name: 'arrival_city',
      label: 'Arrival City',
      type: 'text',
      placeholder: 'e.g., Madrid',
    },
  ],
  meeting: [
    {
      id: 'meeting-type',
      name: 'meeting_type',
      label: 'Meeting Type',
      type: 'select',
      options: ['Phone Call', 'Video Meeting', 'In Person', 'Email'],
    },
    {
      id: 'attendees',
      name: 'attendees',
      label: 'Attendees',
      type: 'text',
      placeholder: 'e.g., John Doe, Jane Smith',
    },
    {
      id: 'meeting-link',
      name: 'meeting_link',
      label: 'Meeting Link',
      type: 'url',
      placeholder: 'e.g., https://zoom.us/...',
    },
  ],
  rehearsal: [
    {
      id: 'duration-hours',
      name: 'duration_hours',
      label: 'Duration (hours)',
      type: 'number',
      placeholder: 'e.g., 3',
    },
    {
      id: 'location',
      name: 'location',
      label: 'Rehearsal Location',
      type: 'text',
      placeholder: 'e.g., Studio A',
    },
    {
      id: 'focus-areas',
      name: 'focus_areas',
      label: 'Focus Areas',
      type: 'text',
      placeholder: 'e.g., Drums, Vocals, Transitions',
    },
  ],
  break: [
    {
      id: 'break-type',
      name: 'break_type',
      label: 'Break Type',
      type: 'select',
      options: ['Rest Day', 'Personal Time', 'Recovery', 'Admin Work'],
    },
  ],
};

/**
 * Custom Field Editor Component
 */
export const CustomFieldEditor: React.FC<{
  field: CustomField;
  onUpdate?: (field: CustomField) => void;
  onDelete?: (fieldId: string) => void;
}> = ({ field, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(field.name);
  const [label, setLabel] = useState(field.label);
  const [type, setType] = useState(field.type);
  const [required, setRequired] = useState(field.required || false);

  const handleSave = () => {
    onUpdate?.({
      ...field,
      name,
      label,
      type,
      required,
    });
    setIsEditing(false);
  };

  return (
    <motion.div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-3">
      {!isEditing ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">{field.label}</p>
            <p className="text-xs text-white/50">{field.type}</p>
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-300 transition-all"
            >
              <Edit2 size={14} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete?.(field.id)}
              className="p-2 rounded-lg hover:bg-red-500/20 text-red-300 transition-all"
            >
              <Trash2 size={14} />
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-accent-400"
            placeholder="Field label"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CustomFieldType)}
            className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-accent-400"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="url">URL</option>
            <option value="date">Date</option>
            <option value="select">Select</option>
            <option value="checkbox">Checkbox</option>
          </select>
          <label className="flex items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="rounded"
            />
            Required
          </label>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="flex-1 px-2 py-1.5 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 text-xs font-medium transition-all"
            >
              Save
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(false)}
              className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-all"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

/**
 * Custom Field Manager Component
 */
export const CustomFieldManager: React.FC<{
  eventTypes: EventTypeWithFields[];
  selectedTypeId?: string;
  onFieldsUpdate?: (typeId: string, fields: CustomField[]) => void;
}> = ({ eventTypes, selectedTypeId, onFieldsUpdate }) => {
  const selectedType = useMemo(
    () => eventTypes.find((t) => t.id === selectedTypeId),
    [eventTypes, selectedTypeId]
  );

  const [fields, setFields] = useState<CustomField[]>(selectedType?.customFields || []);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState<Partial<CustomField>>({
    type: 'text',
    required: false,
  });

  const handleAddField = () => {
    if (!newField.label || !newField.name) return;

    const field: CustomField = {
      id: `field-${Date.now()}`,
      name: newField.name,
      label: newField.label,
      type: newField.type || 'text',
      required: newField.required,
      placeholder: newField.placeholder,
    };

    const updatedFields = [...fields, field];
    setFields(updatedFields);
    onFieldsUpdate?.(selectedTypeId || '', updatedFields);
    setNewField({ type: 'text', required: false });
    setShowAddField(false);
  };

  const handleDeleteField = (fieldId: string) => {
    const updatedFields = fields.filter((f) => f.id !== fieldId);
    setFields(updatedFields);
    onFieldsUpdate?.(selectedTypeId || '', updatedFields);
  };

  const handleUpdateField = (updatedField: CustomField) => {
    const updatedFields = fields.map((f) => (f.id === updatedField.id ? updatedField : f));
    setFields(updatedFields);
    onFieldsUpdate?.(selectedTypeId || '', updatedFields);
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">
          {t('calendar.customFields.title') || 'Custom Fields'}{' '}
          {selectedType && `for ${selectedType.name}`}
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddField(!showAddField)}
          className="p-1.5 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 transition-all"
        >
          <Plus size={16} />
        </motion.button>
      </div>

      {/* Add Field Form */}
      <AnimatePresence>
        {showAddField && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-lg bg-accent-500/10 border border-accent-500/30 space-y-2"
          >
            <input
              type="text"
              value={newField.label || ''}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-accent-400"
              placeholder="Field label (e.g., Flight Number)"
            />
            <input
              type="text"
              value={newField.name || ''}
              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
              className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-accent-400"
              placeholder="Field name (e.g., flight_number)"
            />
            <select
              value={newField.type || 'text'}
              onChange={(e) => setNewField({ ...newField, type: e.target.value as CustomFieldType })}
              className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-accent-400"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="url">URL</option>
              <option value="date">Date</option>
              <option value="select">Select</option>
              <option value="checkbox">Checkbox</option>
            </select>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddField}
                className="flex-1 px-2 py-1.5 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 text-xs font-medium transition-all"
              >
                Add Field
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddField(false)}
                className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-all"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Fields */}
      <div className="space-y-2">
        {fields.length === 0 ? (
          <p className="text-xs text-white/50">
            {t('calendar.customFields.none') || 'No custom fields yet'}
          </p>
        ) : (
          fields.map((field) => (
            <CustomFieldEditor
              key={field.id}
              field={field}
              onUpdate={handleUpdateField}
              onDelete={handleDeleteField}
            />
          ))
        )}
      </div>
    </div>
  );
};

export { FIELD_TEMPLATES };
export default CustomFieldManager;
