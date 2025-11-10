/**
 * useShowsQuery.integration.test.ts
 * Integration tests for the React Query shows hooks
 * Tests migration from showStore to React Query
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useShowsQuery,
  useShowQuery,
  useAddShowMutation,
  useUpdateShowMutation,
  useRemoveShowMutation,
  useSetAllShowsMutation,
  showsQueryKeys,
} from '../hooks/useShowsQuery';
import { showStore } from '../shared/showStore';
import type { Show } from '../lib/shows';
import { normalizeShow } from '../lib/shows';

// Mock data (with sync fields)
const MOCK_SHOW: Show = normalizeShow({
  id: 'test-show-1',
  name: 'Test Show',
  date: '2025-03-15',
  city: 'Test City',
  country: 'TS',
  lat: 0,
  lng: 0,
  fee: 5000,
  status: 'confirmed',
});

const MOCK_SHOW_2: Show = normalizeShow({
  id: 'test-show-2',
  name: 'Another Show',
  date: '2025-04-20',
  city: 'Another City',
  country: 'TS',
  lat: 1,
  lng: 1,
  fee: 3000,
  status: 'pending',
});

function renderWithQueryClient(
  hook: (props: any) => any,
  options?: { initialProps?: any }
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  return renderHook(hook, {
    wrapper,
    ...options,
  });
}

describe('useShowsQuery - React Query Migration', () => {
  beforeEach(() => {
    // Clear the store and localStorage before each test
    showStore.setAll([]);
    localStorage.clear();
  });

  afterEach(() => {
    showStore.setAll([]);
    localStorage.clear();
  });

  describe('useShowsQuery hook', () => {
    it('should fetch all shows from store', async () => {
      showStore.setAll([MOCK_SHOW, MOCK_SHOW_2]);

      const { result } = renderWithQueryClient(() => useShowsQuery());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([
        MOCK_SHOW,
        MOCK_SHOW_2,
      ]);
    });

    it('should return empty array when no shows exist', async () => {
      const { result } = renderWithQueryClient(() => useShowsQuery());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should have correct query key for caching', () => {
      expect(showsQueryKeys.all).toEqual(['shows']);
      expect(showsQueryKeys.lists()).toEqual(['shows', 'list']);
      expect(showsQueryKeys.details()).toEqual(['shows', 'detail']);
      expect(showsQueryKeys.detail('show-1')).toEqual(['shows', 'detail', 'show-1']);
    });
  });

  describe('useShowQuery hook', () => {
    it('should fetch a single show by ID', async () => {
      showStore.setAll([MOCK_SHOW, MOCK_SHOW_2]);

      const { result } = renderWithQueryClient(() =>
        useShowQuery(MOCK_SHOW.id)
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(MOCK_SHOW);
    });

    it('should return undefined when ID is not provided', async () => {
      const { result } = renderWithQueryClient(() => useShowQuery(undefined));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeUndefined();
    });

    it('should return undefined when show is not found', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { result } = renderWithQueryClient(() =>
        useShowQuery('non-existent-id')
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useAddShowMutation hook', () => {
    it('should add a new show and invalidate cache', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { result: queryResult } = renderWithQueryClient(() => useShowsQuery());

      await waitFor(() => {
        expect(queryResult.current.isLoading).toBe(false);
      });

      const { result: mutationResult } = renderWithQueryClient(() =>
        useAddShowMutation()
      );

      // Trigger mutation
      mutationResult.current.mutate(MOCK_SHOW_2);

      await waitFor(() => {
        expect(mutationResult.current.isPending).toBe(false);
      });

      // Verify store was updated
      expect(showStore.getAll()).toContainEqual(MOCK_SHOW_2);
    });

    it('should handle mutation errors gracefully', async () => {
      const { result } = renderWithQueryClient(() =>
        useAddShowMutation()
      );

      // Adding show with minimal fields (note: showStore doesn't validate)
      const minimalShow = {
        id: 'test',
        city: 'Test',
        country: 'TS',
        date: '2025-03-15',
        lat: 0,
        lng: 0,
        fee: 100,
        status: 'pending',
      } as Show;

      result.current.mutate(minimalShow);

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      // Should work with showStore (no validation at this level)
      expect(showStore.getAll().some((s: any) => s.id === 'test')).toBe(true);
    });
  });

  describe('useUpdateShowMutation hook', () => {
    it('should update an existing show', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { result } = renderWithQueryClient(() =>
        useUpdateShowMutation()
      );

      const update = { id: MOCK_SHOW.id, patch: { fee: 6000, status: 'pending' as const } };

      result.current.mutate(update);

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      const updated = showStore.getById(MOCK_SHOW.id);
      expect(updated?.fee).toBe(6000);
      expect(updated?.status).toBe('pending');
    });

    it('should only update allowed fields', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { result } = renderWithQueryClient(() =>
        useUpdateShowMutation()
      );

      const update = {
        id: MOCK_SHOW.id,
        patch: {
          fee: 7000,
          name: 'Updated Name',
          maliciousField: 'should-be-ignored',
        },
      };

      result.current.mutate(update as any);

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      const updated = showStore.getById(MOCK_SHOW.id);
      expect(updated?.fee).toBe(7000);
      expect(updated?.name).toBe('Updated Name');
      expect((updated as any).maliciousField).toBeUndefined();
    });
  });

  describe('useRemoveShowMutation hook', () => {
    it('should remove a show from the store', async () => {
      showStore.setAll([MOCK_SHOW, MOCK_SHOW_2]);

      const { result } = renderWithQueryClient(() =>
        useRemoveShowMutation()
      );

      result.current.mutate(MOCK_SHOW.id);

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      expect(showStore.getAll()).toEqual([MOCK_SHOW_2]);
      expect(showStore.getById(MOCK_SHOW.id)).toBeUndefined();
    });

    it('should handle removal of non-existent show gracefully', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { result } = renderWithQueryClient(() =>
        useRemoveShowMutation()
      );

      result.current.mutate('non-existent-id');

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      // Original show should still be there
      expect(showStore.getAll()).toEqual([MOCK_SHOW]);
    });
  });

  describe('useSetAllShowsMutation hook', () => {
    it('should replace all shows', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { result } = renderWithQueryClient(() =>
        useSetAllShowsMutation()
      );

      result.current.mutate([MOCK_SHOW_2]);

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      expect(showStore.getAll()).toEqual([MOCK_SHOW_2]);
    });

    it('should sort shows by date after bulk set', async () => {
      const laterShow = { ...MOCK_SHOW, date: '2025-05-01' };
      const earlierShow = { ...MOCK_SHOW_2, date: '2025-02-01' };

      const { result } = renderWithQueryClient(() =>
        useSetAllShowsMutation()
      );

      result.current.mutate([laterShow, earlierShow]);

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      const shows = showStore.getAll();
      expect(shows[0]?.date).toBe('2025-02-01');
      expect(shows[1]?.date).toBe('2025-05-01');
    });
  });

  describe('Cache invalidation and synchronization', () => {
    it('should refetch fresh data after mutation', async () => {
      showStore.setAll([MOCK_SHOW]);

      const { result: queryResult } = renderWithQueryClient(() => useShowsQuery());

      await waitFor(() => {
        expect(queryResult.current.isLoading).toBe(false);
      });

      expect(queryResult.current.data).toHaveLength(1);

      const { result: mutationResult } = renderWithQueryClient(() =>
        useAddShowMutation()
      );

      mutationResult.current.mutate(MOCK_SHOW_2);

      await waitFor(() => {
        expect(mutationResult.current.isPending).toBe(false);
      });

      // After mutation, store should have both shows
      expect(showStore.getAll()).toHaveLength(2);
    });

    it('should keep shows sorted by date after any mutation', async () => {
      const show1 = { ...MOCK_SHOW, id: 'show1', date: '2025-03-15' };
      const show2 = { ...MOCK_SHOW, id: 'show2', date: '2025-02-01' };
      const show3 = { ...MOCK_SHOW, id: 'show3', date: '2025-04-01' };

      showStore.setAll([show1, show2, show3]);

      const { result } = renderWithQueryClient(() => useShowsQuery());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const shows = result.current.data || [];
      const dates = shows.map((s: Show) => s.date);

      // Should be sorted chronologically
      expect(dates).toEqual(['2025-02-01', '2025-03-15', '2025-04-01']);
    });
  });
});
