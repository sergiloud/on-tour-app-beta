/**
 * Advanced Component Usage Examples
 * Real-world patterns and combinations
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  Badge,
  Input,
  Select,
  Modal,
  Alert,
  useToast,
  Skeleton,
  useInView,
  useStaggerAnimation,
  animationPresets,
} from '@/components/ui';

/**
 * Example 1: Form with Validation
 */
export function FormWithValidationExample() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      addToast({
        type: 'success',
        message: 'Form submitted successfully!',
      });

      setFormData({ email: '', password: '', role: '' });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to submit form',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="filled" className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Sign In</h2>

      <div className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          placeholder="you@example.com"
        />

        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          placeholder="••••••••"
        />

        <Select
          label="Role"
          options={[
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Administrator' },
            { value: 'manager', label: 'Manager' },
          ]}
          value={formData.role}
          onChange={(val) => setFormData({ ...formData, role: String(val) })}
          error={errors.role}
        />

        <Button
          variant="primary"
          fullWidth
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          Sign In
        </Button>
      </div>
    </Card>
  );
}

/**
 * Example 2: List with Actions
 */
interface ListItem {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'inactive';
  description: string;
}

export function ListWithActionsExample() {
  const [items, setItems] = useState<ListItem[]>([
    { id: '1', title: 'Item 1', status: 'active', description: 'Description 1' },
    { id: '2', title: 'Item 2', status: 'pending', description: 'Description 2' },
    { id: '3', title: 'Item 3', status: 'inactive', description: 'Description 3' },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { addToast } = useToast();
  const { container, item } = useStaggerAnimation(items.length);

  const statusVariants = {
    active: 'success' as const,
    pending: 'warning' as const,
    inactive: 'neutral' as const,
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    addToast({
      type: 'success',
      message: 'Item deleted successfully',
    });
  };

  return (
    <motion.div
      variants={container}
      initial="initial"
      animate="animate"
      className="space-y-3"
    >
      {items.map((listItem, idx) => (
        <motion.div key={listItem.id} variants={item(idx)}>
          <Card
            variant="interactive"
            hover
            className="p-4"
            onClick={() => setSelectedId(listItem.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{listItem.title}</h3>
                  <Badge variant={statusVariants[listItem.status]}>
                    {listItem.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {listItem.description}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(listItem.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Example 3: Multi-step Modal
 */
export function MultiStepModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', confirmed: false });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    setIsOpen(false);
    setStep(1);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Multi-step Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Step ${step} of 3`}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 3 ? (
              <Button variant="primary" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit}>
                Submit
              </Button>
            )}
          </>
        }
      >
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enter your basic information
            </p>
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Verify your email
            </p>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Alert type="info" title="Review">
              Please review your information before submitting.
            </Alert>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <p>
                <span className="font-semibold">Name:</span> {formData.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {formData.email}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

/**
 * Example 4: Data Grid with Filtering
 */
interface DataRow {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  value: number;
}

export function DataGridExample() {
  const [data] = useState<DataRow[]>([
    { id: '1', name: 'Item 1', status: 'active', value: 1000 },
    { id: '2', name: 'Item 2', status: 'inactive', value: 2000 },
    { id: '3', name: 'Item 3', status: 'active', value: 3000 },
    { id: '4', name: 'Item 4', status: 'inactive', value: 4000 },
  ]);
  const [filterStatus, setFilterStatus] = useState<string | number>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = data.filter((row) => {
    const matchStatus = !filterStatus || row.status === filterStatus;
    const matchSearch =
      !searchTerm ||
      row.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <Card variant="filled" className="p-6">
      <h2 className="text-2xl font-bold mb-4">Data Grid</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Input
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          options={[
            { value: '', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          value={filterStatus}
          onChange={setFilterStatus}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Status</th>
              <th className="text-right py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <td className="py-3">{row.name}</td>
                <td className="py-3">
                  <Badge
                    variant={row.status === 'active' ? 'success' : 'neutral'}
                  >
                    {row.status}
                  </Badge>
                </td>
                <td className="py-3 text-right">${row.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No results found
          </div>
        )}
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
        Showing {filtered.length} of {data.length} items
      </p>
    </Card>
  );
}

/**
 * Example 5: Loading and Empty States
 */
export function LoadingStatesExample() {
  const [isLoading, setIsLoading] = useState(true);
  const { isInView, ref } = useInView();

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={ref} className="space-y-4">
      {isLoading ? (
        <>
          <Skeleton variant="text" count={3} />
          <Skeleton variant="rectangle" height={200} />
        </>
      ) : (
        <Alert type="success" title="Content Loaded">
          Your content is now visible!
        </Alert>
      )}

      {isInView && (
        <p className="text-green-600 font-semibold">
          Element is in viewport and content is loaded!
        </p>
      )}
    </div>
  );
}

/**
 * Export all examples
 */
export const AdvancedExamples = {
  FormWithValidation: FormWithValidationExample,
  ListWithActions: ListWithActionsExample,
  MultiStepModal: MultiStepModalExample,
  DataGrid: DataGridExample,
  LoadingStates: LoadingStatesExample,
};
