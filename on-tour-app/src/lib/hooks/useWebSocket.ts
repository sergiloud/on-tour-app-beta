/**
 * React Hook for WebSocket Client
 * Manejo de conexión y eventos en tiempo real
 */

import { useEffect, useCallback, useRef } from 'react';
import { webSocketClient, type FlightUpdate, type Notification } from '@/lib/websocket';

interface UseWebSocketOptions {
  userId?: string;
  username?: string;
  email?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para conectar y gestionar WebSocket
 */
export function useWebSocket(options: UseWebSocketOptions) {
  const { userId, username, email, onConnect, onDisconnect, onError } = options;
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (!userId || !username || !email) return;

    const connect = async () => {
      try {
        await webSocketClient.connect(userId, username, email);
        isConnectedRef.current = true;
        onConnect?.();
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        isConnectedRef.current = false;
        onError?.(error as Error);
      }
    };

    connect();

    return () => {
      if (isConnectedRef.current) {
        webSocketClient.disconnect();
        isConnectedRef.current = false;
        onDisconnect?.();
      }
    };
  }, [userId, username, email, onConnect, onDisconnect, onError]);

  return {
    isConnected: webSocketClient.isConnected(),
    client: webSocketClient
  };
}

/**
 * Hook para suscribirse a actualizaciones de vuelos
 */
export function useFlightUpdates(
  flightId: string | null,
  onUpdate?: (flight: FlightUpdate) => void
) {
  const handlerRef = useRef<((data: FlightUpdate) => void) | null>(null);

  useEffect(() => {
    if (!flightId) return;

    // Create handler
    const handler = (data: FlightUpdate) => {
      onUpdate?.(data);
    };

    handlerRef.current = handler;

    // Subscribe to flight updates
    webSocketClient.subscribeToFlight(flightId);
    webSocketClient.on<FlightUpdate>('flight:updated', handler);

    return () => {
      webSocketClient.off<FlightUpdate>('flight:updated', handler);
      webSocketClient.unsubscribeFromFlight(flightId);
    };
  }, [flightId, onUpdate]);
}

/**
 * Hook para suscribirse a notificaciones
 */
export function useNotifications(
  onNotification?: (notification: Notification) => void
) {
  const handlerRef = useRef<((data: Notification) => void) | null>(null);

  useEffect(() => {
    // Create handler
    const handler = (data: Notification) => {
      onNotification?.(data);
    };

    handlerRef.current = handler;

    // Subscribe to notifications
    webSocketClient.subscribeToNotifications();
    webSocketClient.on<Notification>('notification:received', handler);

    return () => {
      webSocketClient.off<Notification>('notification:received', handler);
    };
  }, [onNotification]);
}

/**
 * Hook para colaboración en documentos en tiempo real
 */
export function useDocumentCollaboration(
  documentId: string | null,
  onEdit?: (data: any) => void,
  onCursor?: (data: any) => void,
  onTyping?: (data: any) => void
) {
  const editHandlerRef = useRef<((data: any) => void) | null>(null);
  const cursorHandlerRef = useRef<((data: any) => void) | null>(null);
  const typingHandlerRef = useRef<((data: any) => void) | null>(null);

  useEffect(() => {
    if (!documentId) return;

    // Create handlers
    const editHandler = (data: any) => {
      onEdit?.(data);
    };
    const cursorHandler = (data: any) => {
      onCursor?.(data);
    };
    const typingHandler = (data: any) => {
      onTyping?.(data);
    };

    editHandlerRef.current = editHandler;
    cursorHandlerRef.current = cursorHandler;
    typingHandlerRef.current = typingHandler;

    // Subscribe to document
    webSocketClient.subscribeToDocument(documentId);
    webSocketClient.on('document:edited', editHandler);
    webSocketClient.on('document:cursor', cursorHandler);
    webSocketClient.on('presence:typing', typingHandler);

    return () => {
      webSocketClient.off('document:edited', editHandler);
      webSocketClient.off('document:cursor', cursorHandler);
      webSocketClient.off('presence:typing', typingHandler);
      webSocketClient.unsubscribeFromDocument(documentId);
    };
  }, [documentId, onEdit, onCursor, onTyping]);

  // Return mutation-like functions
  const editDocument = useCallback(
    (action: string, field: string, value: any) => {
      if (documentId) {
        webSocketClient.editDocument(documentId, action, field, value);
      }
    },
    [documentId]
  );

  const updateCursor = useCallback(
    (line: number, column: number) => {
      if (documentId) {
        webSocketClient.updateCursor(documentId, line, column);
      }
    },
    [documentId]
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (documentId) {
        webSocketClient.setTyping(documentId, isTyping);
      }
    },
    [documentId]
  );

  return { editDocument, updateCursor, setTyping };
}
