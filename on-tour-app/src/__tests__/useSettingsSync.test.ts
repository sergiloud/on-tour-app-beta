/**
 * Test suite for useSettingsSync hook
 * 
 * Tests cover:
 * - Initial state and loading from storage
 * - Debounced writes
 * - Multi-tab sync via CustomEvent
 * - Storage change handling
 * - Clear and reload operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSettingsSync } from '../hooks/useSettingsSync';

// Mock secureStorage
vi.mock('../lib/secureStorage', () => ({
  secureStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

const mockSecureStorage = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}));

describe('useSettingsSync', () => {
  const initialData = { theme: 'light', lang: 'en', currency: 'EUR' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSecureStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should initialize with provided data', () => {
    const { result } = renderHook(() => useSettingsSync(initialData));

    expect(result.current.data).toEqual(initialData);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isSyncing).toBe(false);
  });

  it('should load from storage on mount', () => {
    const stored = { theme: 'dark', lang: 'es', currency: 'USD' };
    mockSecureStorage.getItem.mockReturnValue(stored);

    const { result } = renderHook(() => useSettingsSync(initialData));

    expect(result.current.data).toEqual({
      ...initialData,
      ...stored,
    });
  });

  it('should debounce writes', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useSettingsSync(initialData, { debounceMs: 300 })
    );

    await act(async () => {
      result.current.save({ theme: 'dark' });
    });

    // Should be dirty immediately
    expect(result.current.isDirty).toBe(true);

    // But not written yet
    expect(mockSecureStorage.setItem).not.toHaveBeenCalled();

    // Advance time
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Now should be written
    expect(mockSecureStorage.setItem).toHaveBeenCalled();
    expect(result.current.isDirty).toBe(false);

    vi.useRealTimers();
  });

  it('should merge partial updates', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useSettingsSync(initialData, { debounceMs: 100 })
    );

    await act(async () => {
      result.current.save({ theme: 'dark' });
      result.current.save({ lang: 'es' });
    });

    expect(result.current.data).toEqual({
      theme: 'dark',
      lang: 'es',
      currency: 'EUR',
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(mockSecureStorage.setItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        theme: 'dark',
        lang: 'es',
        currency: 'EUR',
        __version: 1,
      })
    );

    vi.useRealTimers();
  });

  it('should handle clear', async () => {
    const { result } = renderHook(() => useSettingsSync(initialData));

    await act(async () => {
      await result.current.clear();
    });

    expect(mockSecureStorage.removeItem).toHaveBeenCalledWith(
      expect.stringContaining('ota.settings')
    );
    expect(result.current.data).toEqual(initialData);
  });

  it('should handle reload from storage', async () => {
    const stored = { theme: 'dark' };
    mockSecureStorage.getItem.mockReturnValue(stored);

    const { result } = renderHook(() => useSettingsSync(initialData));

    // Update locally
    await act(async () => {
      result.current.save({ lang: 'es' });
    });

    expect(result.current.data).toEqual({
      ...initialData,
      lang: 'es',
    });

    // Reload from storage
    await act(async () => {
      await result.current.reload();
    });

    // Should restore from storage
    expect(result.current.data).toEqual({
      ...initialData,
      ...stored,
    });
  });

  it('should broadcast sync to other tabs', async () => {
    vi.useFakeTimers();
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    const { result } = renderHook(() =>
      useSettingsSync(initialData, { debounceMs: 100 })
    );

    await act(async () => {
      result.current.save({ theme: 'dark' });
      vi.advanceTimersByTime(100);
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ota:settings:sync-complete',
      })
    );

    dispatchSpy.mockRestore();
    vi.useRealTimers();
  });

  it('should listen for storage events from other tabs', async () => {
    const { result } = renderHook(() => useSettingsSync(initialData));

    const newData = { theme: 'dark', lang: 'es', currency: 'GBP' };

    await act(async () => {
      const event = new StorageEvent('storage', {
        key: 'ota.settings.data',
        newValue: JSON.stringify(newData),
      });
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(newData);
    });
  });

  it('should include userId in storage when provided', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useSettingsSync(initialData, { debounceMs: 100, userId: 'user123' })
    );

    await act(async () => {
      result.current.save({ theme: 'dark' });
      vi.advanceTimersByTime(100);
    });

    expect(mockSecureStorage.setItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        _userId: 'user123',
      })
    );

    vi.useRealTimers();
  });

  it('should call onSync callback after write', async () => {
    vi.useFakeTimers();
    const onSync = vi.fn();

    const { result } = renderHook(() =>
      useSettingsSync(initialData, { debounceMs: 100, onSync })
    );

    await act(async () => {
      result.current.save({ theme: 'dark' });
      vi.advanceTimersByTime(100);
    });

    expect(onSync).toHaveBeenCalledWith({
      theme: 'dark',
      lang: 'en',
      currency: 'EUR',
    });

    vi.useRealTimers();
  });

  it('should call onError callback on storage error', async () => {
    vi.useFakeTimers();
    const onError = vi.fn();
    mockSecureStorage.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const { result } = renderHook(() =>
      useSettingsSync(initialData, { debounceMs: 100, onError })
    );

    await act(async () => {
      result.current.save({ theme: 'dark' });
      vi.advanceTimersByTime(100);
    });

    expect(onError).toHaveBeenCalledWith(expect.any(Error));

    vi.useRealTimers();
  });
});
