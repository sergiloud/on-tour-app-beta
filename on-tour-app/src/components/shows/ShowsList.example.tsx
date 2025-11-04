/**
 * Shows List Component Example
 * Ejemplo de integración de hooks API en componentes React
 */

import React, { useMemo } from 'react';
import { useShows, useDeleteShow, useWebSocket, useCurrentUser } from '@/lib/hooks';

interface ShowsListProps {
  selectedStatus?: string;
  onShowSelect?: (showId: string) => void;
}

export function ShowsList({ selectedStatus, onShowSelect }: ShowsListProps) {
  const { data, isLoading, error } = useShows(
    selectedStatus ? { status: selectedStatus as any } : undefined
  );
  const deleteShow = useDeleteShow();
  const { userId, username, email } = useCurrentUser();

  // Connect WebSocket for real-time updates (only if user is authenticated)
  const { isConnected } = useWebSocket({
    userId: userId || undefined,
    username: username || undefined,
    email: email || undefined
  });

  const shows = useMemo(() => {
    if (!data?.data) return [];
    return data.data;
  }, [data]);

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading shows...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading shows: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  if (shows.length === 0) {
    return <div className="p-4 text-center text-gray-500">No shows found</div>;
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this show?')) {
      try {
        await deleteShow.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete show:', err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shows</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {shows.map((show) => (
          <div
            key={show.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onShowSelect?.(show.id)}
          >
            <h3 className="font-semibold text-lg mb-2">{show.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{show.description}</p>

            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  show.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : show.status === 'scheduled'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {show.status}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-2">{show.type}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div>
                <span className="text-gray-500 block">Capacity</span>
                <span className="font-semibold">{show.capacity}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Budget</span>
                <span className="font-semibold">
                  {show.currency} {show.budget}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowSelect?.(show.id);
                }}
                className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(show.id);
                }}
                disabled={deleteShow.isPending}
                className="flex-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteShow.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {data && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total: {data.total} shows</span>
          <span>Showing {shows.length} of {data.total}</span>
        </div>
      )}
    </div>
  );
}
