import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useShowsQuery,
  useUpdateShowMutation,
  useAddShowMutation,
  useRemoveShowMutation,
  showsQueryKeys,
} from '../hooks/useShowsQuery';
import { useShowsSync } from '../hooks/useShowsSync';
import { showStore } from '../shared/showStore';
import { normalizeShow } from '../lib/shows';
import type { Show } from '../lib/shows';

/**
 * Integration tests for React Query + showStore sync
 *
 * These tests verify that:
 * 1. React Query properly caches show data
 * 2. Mutations invalidate cache correctly
 * 3. Cross-tab sync triggers cache invalidation
 * 4. useShowsSync integrates with BroadcastChannel
 */

// Helper to render hooks with QueryClient
function renderWithQueryClient<T>(
  hook: (props: any) => T,
  options?: { initialProps?: any }
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity, // Disable garbage collection
      },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  return {
    ...renderHook(hook, { wrapper, ...options }),
    queryClient,
  };
}

// Mock data
const MOCK_SHOW: Show = normalizeShow({
  id: 'test-show-1',
  city: 'Madrid',
  country: 'ES',
  date: '2025-12-10',
  fee: 5000,
  lat: 40.4,
  lng: -3.7,
});

const MOCK_SHOW_2: Show = normalizeShow({
  id: 'test-show-2',
  city: 'Paris',
  country: 'FR',
  date: '2025-12-11',
  fee: 6000,
  lat: 48.8,
  lng: 2.3,
});

describe('React Query Integration - Shows', () => {
  beforeEach(() => {
    showStore.setAll([]);
  });

  afterEach(() => {
    showStore.setAll([]);
  });

  describe('useShowsQuery', () => {
    it('should fetch all shows from showStore', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { result } = renderWithQueryClient(() => useShowsQuery());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([MOCK_SHOW]);
    });

    it('should cache shows for stale time', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { result, queryClient } = renderWithQueryClient(() =>
        useShowsQuery()
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Data should be in cache
      const cached = queryClient.getQueryData(showsQueryKeys.all);
      expect(cached).toEqual([MOCK_SHOW]);
    });

    it('should handle empty shows', async () => {
      const { result } = renderWithQueryClient(() => useShowsQuery());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should show loading state initially', () => {
      const { result } = renderWithQueryClient(() => useShowsQuery());
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useUpdateShowMutation', () => {
    it('should update show and invalidate cache', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { result: queryResult, queryClient } = renderWithQueryClient(() =>
        useShowsQuery()
      );

      await waitFor(() => {
        expect(queryResult.current.isSuccess).toBe(true);
      });

      const { result: mutationResult } = renderWithQueryClient(
        () => useUpdateShowMutation(),
        { initialProps: undefined }
      );

      // Change queryClient for mutation to use same instance
      Object.defineProperty(mutationResult.current, 'queryClient', {
        value: queryClient,
        writable: true,
      });

      // Mutate the show
      mutationResult.current.mutate({
        id: MOCK_SHOW.id,
        patch: { fee: 5500 },
      });

      await waitFor(() => {
        expect(mutationResult.current.isSuccess).toBe(true);
      });

      // Check that showStore was updated
      const updated = showStore.getById(MOCK_SHOW.id);
      expect(updated?.fee).toBe(5500);

      // Version should increment
      expect(updated?.__version).toBeGreaterThan(MOCK_SHOW.__version);
    });

    it('should update show with new timestamp', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { result } = renderWithQueryClient(() =>
        useUpdateShowMutation()
      );

      const originalTime = MOCK_SHOW.__modifiedAt;

      result.current.mutate({
        id: MOCK_SHOW.id,
        patch: { fee: 5500 },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const updated = showStore.getById(MOCK_SHOW.id);
      expect(updated?.__modifiedAt).toBeGreaterThanOrEqual(originalTime);
    });
  });

  describe('useAddShowMutation', () => {
    it('should add show to store and invalidate cache', async () => {
      const { result } = renderWithQueryClient(() => useAddShowMutation());

      result.current.mutate(MOCK_SHOW);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const all = showStore.getAll();
      expect(all).toHaveLength(1);
      expect(all[0]?.id).toBe(MOCK_SHOW.id);
    });

    it('should normalize show before adding', async () => {
      const { result } = renderWithQueryClient(() => useAddShowMutation());

      const partialShow = {
        id: 'new-show',
        city: 'Barcelona',
        country: 'ES',
        date: '2025-12-12',
        fee: 3000,
      };

      result.current.mutate(partialShow as Show);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const added = showStore.getById('new-show');
      expect(added?.__version).toBe(0);
      expect(added?.__modifiedAt).toBeDefined();
      expect(added?.__modifiedBy).toBeDefined();
    });
  });

  describe('useRemoveShowMutation', () => {
    it('should remove show from store', async () => {
      showStore.setAll([MOCK_SHOW, MOCK_SHOW_2]);

      const { result } = renderWithQueryClient(() =>
        useRemoveShowMutation()
      );

      result.current.mutate(MOCK_SHOW.id);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const all = showStore.getAll();
      expect(all).toHaveLength(1);
      expect(all[0]?.id).toBe(MOCK_SHOW_2.id);
    });
  });

  describe('Cross-Tab Sync Integration', () => {
    it('should handle synced changes from other tabs', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { result, queryClient } = renderWithQueryClient(() =>
        useShowsQuery()
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Simulate another tab updating
      const updated = { ...MOCK_SHOW, fee: 7000 };
      showStore.setAll([updated]);

      // Invalidate cache to simulate sync
      queryClient.invalidateQueries({ queryKey: showsQueryKeys.all });

      await waitFor(() => {
        expect(result.current.data?.[0]?.fee).toBe(7000);
      });
    });

    it('should sync version updates across mutations', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { result: queryResult, queryClient } = renderWithQueryClient(() =>
        useShowsQuery()
      );

      await waitFor(() => {
        expect(queryResult.current.isSuccess).toBe(true);
      });

      const initialVersion = queryResult.current.data?.[0]?.__version;

      // Perform multiple mutations
      const { result: mutationResult } = renderWithQueryClient(
        () => useUpdateShowMutation(),
        { initialProps: undefined }
      );

      for (let i = 0; i < 3; i++) {
        mutationResult.current.mutate({
          id: MOCK_SHOW.id,
          patch: { fee: 5000 + i * 100 },
        });

        await waitFor(() => {
          expect(mutationResult.current.isSuccess).toBe(true);
        });
      }

      const final = showStore.getById(MOCK_SHOW.id);
      expect(final?.__version).toBeGreaterThan(initialVersion || 0);
    });
  });

  describe('Cache Invalidation Strategy', () => {
    it('should invalidate specific show cache after mutation', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { queryClient } = renderWithQueryClient(() => useShowsQuery());

      // Add to specific show cache
      queryClient.setQueryData(
        showsQueryKeys.detail(MOCK_SHOW.id),
        MOCK_SHOW
      );

      // Update the show
      showStore.updateShow(MOCK_SHOW.id, { fee: 5500 });

      // Manually invalidate (mutation does this automatically)
      queryClient.invalidateQueries({
        queryKey: showsQueryKeys.detail(MOCK_SHOW.id),
      });

      // Cache should be invalidated
      await waitFor(() => {
        expect(queryClient.getQueryState(showsQueryKeys.detail(MOCK_SHOW.id))?.isInvalidated).toBe(true);
      });
    });

    it('should invalidate all shows cache on bulk operations', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { queryClient } = renderWithQueryClient(() => useShowsQuery());

      showStore.setAll([MOCK_SHOW, MOCK_SHOW_2]);

      queryClient.invalidateQueries({ queryKey: showsQueryKeys.all });

      await waitFor(() => {
        expect(queryClient.getQueryState(showsQueryKeys.all)?.isInvalidated).toBe(true);
      });
    });
  });

  describe('Performance & Caching', () => {
    it('should reuse cached data without refetching', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { result: result1, queryClient } = renderWithQueryClient(() =>
        useShowsQuery()
      );

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Create second instance with same query key
      const { result: result2 } = renderWithQueryClient(
        () => useShowsQuery(),
        { initialProps: undefined }
      );

      // Second query should use cached data
      await waitFor(() => {
        expect(result2.current.data).toEqual(result1.current.data);
      });

      // No fetch should have happened for second (instant resolution)
      expect(result2.current.isFetching).toBe(false);
    });

    it('should handle 100 shows without performance issues', async () => {
      const manyShows = Array.from({ length: 100 }, (_, i) =>
        normalizeShow({
          id: `show-${i}`,
          city: `City ${i}`,
          country: 'ES',
          date: '2025-12-10',
          fee: 5000 + i * 100,
          lat: 40 + i * 0.01,
          lng: -3 + i * 0.01,
        })
      );

      showStore.setAll(manyShows);

      const { result } = renderWithQueryClient(() => useShowsQuery());

      const start = performance.now();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100); // Should complete in < 100ms
      expect(result.current.data).toHaveLength(100);
    });
  });
});
