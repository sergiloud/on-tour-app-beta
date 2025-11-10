import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Show } from './SmartShowRow';
import { sanitizeName } from '../../lib/sanitize';

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface CreateShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (show: Omit<Show, 'id'>) => void;
  initialData?: Partial<Show>;
}

interface FormData {
  name: string;
  date: string;
  city: string;
  venue: string;
  country: string;
  capacity: number;
  status: Show['status'];
  priority: Show['priority'];
  ticketSalesPercentage: number;
  projectedMargin: number;
  tasksCompleted: number;
  totalTasks: number;
}

const STEPS = [
  { id: 'basic', title: 'Basic Info', icon: '📝' },
  { id: 'location', title: 'Location', icon: '📍' },
  { id: 'status', title: 'Status & Priority', icon: '⚡' },
  { id: 'metrics', title: 'Metrics', icon: '📊' },
  { id: 'review', title: 'Review', icon: '✅' }
];

export const CreateShowModal: React.FC<CreateShowModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  initialData
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    date: '',
    city: '',
    venue: '',
    country: '',
    capacity: 1000,
    status: 'planned',
    priority: 'medium',
    ticketSalesPercentage: 0,
    projectedMargin: 0,
    tasksCompleted: 0,
    totalTasks: 10
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const newShow: Omit<Show, 'id'> = {
      ...formData,
      date: formData.date ?? new Date().toISOString().split('T')[0]
    };
    onCreate(newShow);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep(0);
    setFormData({
      name: '',
      date: '',
      city: '',
      venue: '',
      country: '',
      capacity: 1000,
      status: 'planned',
      priority: 'medium',
      ticketSalesPercentage: 0,
      projectedMargin: 0,
      tasksCompleted: 0,
      totalTasks: 10
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return formData.name.trim() && formData.date;
      case 1: // Location
        return formData.city.trim() && formData.venue.trim() && formData.country.trim();
      case 2: // Status & Priority
        return true; // Always valid
      case 3: // Metrics
        return formData.totalTasks > 0 && formData.tasksCompleted <= formData.totalTasks;
      case 4: // Review
        return true; // Always valid
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Show Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Enter show name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        );

      case 1: // Location
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Venue *
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Enter venue name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Venue Capacity
              </label>
              <input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1000)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Country *
              </label>
              <select
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
                <option value="AU">Australia</option>
                <option value="JP">Japan</option>
              </select>
            </div>
          </div>
        );

      case 2: // Status & Priority
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'planned', label: 'Planned', color: 'bg-slate-500' },
                  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
                  { value: 'on_sale', label: 'On Sale', color: 'bg-green-500' },
                  { value: 'upcoming', label: 'Upcoming', color: 'bg-amber-500' },
                  { value: 'completed', label: 'Completed', color: 'bg-emerald-500' },
                  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' }
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleInputChange('status', status.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${formData.status === status.value
                      ? `border-white/50 ${status.color} text-white`
                      : 'border-slate-200 dark:border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Priority
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'low', label: 'Low', color: 'text-slate-400' },
                  { value: 'medium', label: 'Medium', color: 'text-blue-400' },
                  { value: 'high', label: 'High', color: 'text-amber-400' },
                  { value: 'critical', label: 'Critical', color: 'text-red-400' }
                ].map((priority) => (
                  <button
                    key={priority.value}
                    onClick={() => handleInputChange('priority', priority.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${formData.priority === priority.value
                      ? 'border-white/50 bg-slate-200 dark:bg-white/10 text-white'
                      : 'border-slate-200 dark:border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                  >
                    <span className={priority.color}>{priority.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Metrics
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Ticket Sales Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.ticketSalesPercentage}
                onChange={(e) => handleInputChange('ticketSalesPercentage', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <div className="mt-2 w-full bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${formData.ticketSalesPercentage}%` }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Projected Margin (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.projectedMargin}
                onChange={(e) => handleInputChange('projectedMargin', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tasks Completed
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.tasksCompleted}
                  onChange={(e) => handleInputChange('tasksCompleted', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Total Tasks
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalTasks}
                  onChange={(e) => handleInputChange('totalTasks', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            {formData.totalTasks > 0 && (
              <div>
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>Progress</span>
                  <span>{formData.tasksCompleted}/{formData.totalTasks}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${(formData.tasksCompleted / formData.totalTasks) === 1 ? 'bg-green-500' :
                      (formData.tasksCompleted / formData.totalTasks) > 0.7 ? 'bg-blue-500' :
                        (formData.tasksCompleted / formData.totalTasks) > 0.4 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${(formData.tasksCompleted / formData.totalTasks) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-6">
            <div className="bg-slate-100 dark:bg-white/5 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Show Summary</h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Name:</span>
                  <p className="text-slate-900 dark:text-white font-medium">{sanitizeName(formData.name)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Date:</span>
                  <p className="text-slate-900 dark:text-white font-medium">
                    {formData.date ? new Date(formData.date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Location:</span>
                  <p className="text-slate-900 dark:text-white font-medium">{sanitizeName(formData.city)}, {formData.country}</p>
                </div>
                <div>
                  <span className="text-slate-400">Venue:</span>
                  <p className="text-slate-900 dark:text-white font-medium">{sanitizeName(formData.venue)} ({formData.capacity.toLocaleString()} capacity)</p>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>
                  <p className="text-slate-900 dark:text-white font-medium capitalize">{formData.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-slate-400">Priority:</span>
                  <p className="text-slate-900 dark:text-white font-medium capitalize">{formData.priority}</p>
                </div>
                <div>
                  <span className="text-slate-400">Tickets Sold:</span>
                  <p className="text-slate-900 dark:text-white font-medium">{formData.ticketSalesPercentage}%</p>
                </div>
                <div>
                  <span className="text-slate-400">Projected Margin:</span>
                  <p className={`font-medium ${formData.projectedMargin >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                    {formData.projectedMargin >= 0 ? '+' : ''}{formData.projectedMargin}%
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-400">Task Progress:</span>
                <p className="text-slate-900 dark:text-white font-medium">
                  {formData.tasksCompleted} of {formData.totalTasks} tasks completed
                </p>
                <div className="mt-2 w-full bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${(formData.tasksCompleted / formData.totalTasks) === 1 ? 'bg-green-500' :
                      (formData.tasksCompleted / formData.totalTasks) > 0.7 ? 'bg-blue-500' :
                        (formData.tasksCompleted / formData.totalTasks) > 0.4 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${(formData.tasksCompleted / formData.totalTasks) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-slate-300 dark:border-white/20 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Create New Show</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-lg transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-6">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${index <= currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-400'
                    }`}>
                    {step.icon}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${index < currentStep ? 'bg-blue-500' : 'bg-white/10'
                      }`} />
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-2">
              <p className="text-sm text-slate-400">
                Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]?.title}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-white/10 flex justify-between">
            <button
              onClick={currentStep === 0 ? onClose : prevStep}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              {currentStep === 0 ? 'Cancel' : 'Previous'}
            </button>

            <div className="flex gap-3">
              {currentStep === STEPS.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                >
                  Create Show
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className={`px-6 py-2 rounded-lg transition-colors font-medium ${isStepValid()
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
