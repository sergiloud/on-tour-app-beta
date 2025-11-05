/**
 * UI Component Library - Example Usage
 * Demonstrates how to use all components in the library
 */

import React, { useState } from 'react';
import {
  Button,
  Card,
  Badge,
  Input,
  Select,
  Alert,
  Modal,
  useToast,
  Skeleton,
  SkeletonCard,
  useInView,
  useHoverEffect,
} from '@/components/ui';

export function ComponentLibraryExample() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | number>('');
  const [formData, setFormData] = useState({ email: '', name: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const { isInView, ref: viewRef } = useInView();
  const { isHovered, handlers: hoverHandlers } = useHoverEffect();

  const selectOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  const handleSubmit = () => {
    if (!formData.email || !formData.name) {
      addToast({
        type: 'error',
        message: 'Please fill in all fields',
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addToast({
        type: 'success',
        message: 'Form submitted successfully!',
      });
      setFormData({ email: '', name: '' });
    }, 2000);
  };

  return (
    <div className="space-y-12 p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent mb-2">
          UI Component Library
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Complete component showcase with design system integration
        </p>
      </div>

      {/* Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Buttons</h2>
        <Card variant="filled" className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button variant="success">Success Button</Button>
            <Button variant="primary">Small Button</Button>
            <Button variant="primary">Large Button</Button>
            <Button loading>Loading Button</Button>
            <Button fullWidth>Full Width Button</Button>
          </div>
        </Card>
      </section>

      {/* Cards Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card variant="elevated" hover>
            <h3 className="font-semibold mb-2">Elevated Card</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This card has an elevated shadow effect with hover animation.
            </p>
          </Card>

          <Card variant="filled">
            <h3 className="font-semibold mb-2">Filled Card</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This card has a filled background with subtle borders.
            </p>
          </Card>

          <Card variant="outlined">
            <h3 className="font-semibold mb-2">Outlined Card</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This card has only a border with transparent background.
            </p>
          </Card>

          <Card variant="gradient">
            <h3 className="font-semibold mb-2">Gradient Card</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This card has a gradient background effect.
            </p>
          </Card>

          <Card variant="compact">
            <h3 className="font-semibold mb-2">Compact Card</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This card has reduced padding for compact layouts.
            </p>
          </Card>

          <Card variant="interactive" hover>
            <h3 className="font-semibold mb-2">Interactive Card</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This card is optimized for interactive states.
            </p>
          </Card>
        </div>
      </section>

      {/* Badges Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Badges</h2>
        <Card variant="filled" className="p-6">
          <div className="flex flex-wrap gap-3">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="success" dot>
              With Dot
            </Badge>
          </div>
        </Card>
      </section>

      {/* Alerts Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Alerts</h2>
        <div className="space-y-3">
          <Alert type="info" title="Info Alert">
            This is an informational alert message.
          </Alert>
          <Alert type="success" title="Success Alert">
            Your operation has been completed successfully.
          </Alert>
          <Alert type="warning" title="Warning Alert" closeable>
            Please be careful with this action.
          </Alert>
          <Alert type="error" title="Error Alert" closeable>
            An error occurred during processing.
          </Alert>
        </div>
      </section>

      {/* Forms Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Form Components</h2>
        <Card variant="filled" className="p-6 max-w-md mx-auto">
          <div className="space-y-4">
            <Input
              label="Name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Select
              label="Choose an option"
              options={selectOptions}
              value={selectedOption}
              onChange={setSelectedOption}
              searchable
            />

            <div className="flex gap-2 pt-4">
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={isLoading}
                fullWidth
              >
                Submit
              </Button>
              <Button variant="ghost" fullWidth>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Modal Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Modal</h2>
        <Card variant="filled" className="p-6">
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Open Modal
          </Button>

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Example Modal"
            size="md"
            footer={
              <>
                <Button
                  variant="ghost"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setModalOpen(false);
                    addToast({
                      type: 'success',
                      message: 'Action confirmed!',
                    });
                  }}
                >
                  Confirm
                </Button>
              </>
            }
          >
            <p className="text-slate-700 dark:text-slate-300">
              This is an example modal dialog. It demonstrates how to use the Modal
              component with custom content and footer actions.
            </p>
          </Modal>
        </Card>
      </section>

      {/* Skeleton Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Skeleton Loaders
        </h2>
        <Card variant="filled" className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            These skeleton components are useful for loading states:
          </p>
          <SkeletonCard count={1} />
        </Card>
      </section>

      {/* Intersection Observer Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Animation Hooks
        </h2>
        <div ref={viewRef}>
          <Card variant="filled" className="p-6">
            {isInView ? (
              <p className="text-green-600 font-semibold">
                ✓ Element is visible in viewport!
              </p>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">
                Scroll to see this element in viewport...
              </p>
            )}
          </Card>
        </div>

        <Card variant="filled" className="p-6" {...hoverHandlers}>
          {isHovered ? (
            <p className="text-blue-600 font-semibold">✓ Hover detected!</p>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">
              Hover over this card to trigger the effect...
            </p>
          )}
        </Card>
      </section>

      {/* Footer */}
      <div className="text-center py-8 border-t border-slate-200 dark:border-slate-800">
        <p className="text-slate-600 dark:text-slate-400">
          All components support dark mode, animations, and accessibility features.
        </p>
      </div>
    </div>
  );
}
