import { useState, useCallback } from 'react';

/**
 * useModal - Simple modal state management
 *
 * Usage:
 * const { isOpen, open, close, toggle } = useModal();
 *
 * <BaseModal isOpen={isOpen} onClose={close} title="My Modal">
 *   Content
 * </BaseModal>
 *
 * <button onClick={open}>Open Modal</button>
 */
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen
  };
}

/**
 * useModalWithData - Modal state management with data
 *
 * Usage:
 * const { isOpen, open, close, data } = useModalWithData<User>();
 *
 * <BaseModal isOpen={isOpen} onClose={close} title="Edit User">
 *   <UserForm initialData={data} />
 * </BaseModal>
 *
 * <button onClick={() => open(user)}>Edit</button>
 */
export function useModalWithData<T = any>(initialData?: T) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | undefined>(initialData);

  const open = useCallback((newData?: T) => {
    setData(newData ?? initialData);
    setIsOpen(true);
  }, [initialData]);

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setData(undefined), 200); // Clear after animation
  }, []);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    data,
    setData,
    setIsOpen
  };
}

/**
 * useConfirmModal - Confirmation dialog state
 *
 * Usage:
 * const confirm = useConfirmModal();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete Show?',
 *     message: 'This cannot be undone'
 *   });
 *   if (confirmed) { ... }
 * };
 */
export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  } | null>(null);

  const [resolveConfirm, setResolveConfirm] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback(
    (options: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
    }): Promise<boolean> => {
      return new Promise(resolve => {
        setData(options);
        setResolveConfirm(() => resolve);
        setIsOpen(true);
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    resolveConfirm?.(true);
    setIsOpen(false);
    setData(null);
  }, [resolveConfirm]);

  const handleCancel = useCallback(() => {
    resolveConfirm?.(false);
    setIsOpen(false);
    setData(null);
  }, [resolveConfirm]);

  return {
    confirm,
    isOpen,
    data,
    handleConfirm,
    handleCancel
  };
}
