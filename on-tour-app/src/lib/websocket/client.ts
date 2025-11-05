/**
 * WebSocket Client Service
 * Comunicación en tiempo real con backend
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface UserPresence {
  userId: string;
  username: string;
  email: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  currentPage?: string;
}

export interface FlightUpdate {
  flightId: string;
  carrierCode: string;
  flightNumber: string;
  status: 'on-time' | 'delayed' | 'cancelled' | 'boarding' | 'departed' | 'arrived';
  departureTime: Date;
  arrivalTime?: Date;
  delay?: number;
  gate?: string;
  terminal?: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'payment' | 'booking' | 'flight' | 'settlement' | 'alert';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

type EventHandler<T> = (data: T) => void;

class WebSocketClient {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private handlers: Map<string, Set<EventHandler<any>>> = new Map();

  /**
   * Connect to WebSocket server
   */
  public connect(userId: string, username: string, email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(SOCKET_URL, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling']
        });

        this.userId = userId;

        // Setup event listeners
        this.socket.on('connect', () => {
          console.log('WebSocket connected');

          // Join as user
          this.socket!.emit('user:join', { userId, username, email });
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('WebSocket disconnected');
        });

        this.socket.on('error', (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        });

        // Setup default event handlers
        this.setupEventHandlers();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Setup default event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Flight updates
    this.socket.on('flight:updated', (data: FlightUpdate) => {
      this.emit('flight:updated', data);
    });

    // Notifications
    this.socket.on('notification:received', (data: Notification) => {
      this.emit('notification:received', data);
    });

    // Presence updates
    this.socket.on('presence:updated', (data: any) => {
      this.emit('presence:updated', data);
    });

    // Document events
    this.socket.on('document:edited', (data: any) => {
      this.emit('document:edited', data);
    });

    this.socket.on('document:cursor', (data: any) => {
      this.emit('document:cursor', data);
    });

    // Typing indicators
    this.socket.on('presence:typing', (data: any) => {
      this.emit('presence:typing', data);
    });
  }

  /**
   * Subscribe to flight updates
   */
  public subscribeToFlight(flightId: string): void {
    if (this.socket) {
      this.socket.emit('flight:subscribe', flightId);
    }
  }

  /**
   * Unsubscribe from flight updates
   */
  public unsubscribeFromFlight(flightId: string): void {
    if (this.socket) {
      this.socket.emit('flight:unsubscribe', flightId);
    }
  }

  /**
   * Subscribe to notifications
   */
  public subscribeToNotifications(): void {
    if (this.socket) {
      this.socket.emit('notification:subscribe');
    }
  }

  /**
   * Subscribe to document
   */
  public subscribeToDocument(documentId: string): void {
    if (this.socket) {
      this.socket.emit('document:subscribe', documentId);
    }
  }

  /**
   * Unsubscribe from document
   */
  public unsubscribeFromDocument(documentId: string): void {
    if (this.socket) {
      this.socket.emit('document:unsubscribe', documentId);
    }
  }

  /**
   * Apply document edit
   */
  public editDocument(documentId: string, action: string, field: string, value: any): void {
    if (this.socket) {
      this.socket.emit('document:edit', { documentId, action, field, value });
    }
  }

  /**
   * Update cursor position
   */
  public updateCursor(documentId: string, line: number, column: number): void {
    if (this.socket) {
      this.socket.emit('document:cursor', { documentId, cursor: { line, column } });
    }
  }

  /**
   * Send typing indicator
   */
  public setTyping(documentId: string, isTyping: boolean): void {
    if (this.socket) {
      this.socket.emit('presence:typing', { documentId, isTyping });
    }
  }

  /**
   * Register event handler
   */
  public on<T>(event: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  /**
   * Unregister event handler
   */
  public off<T>(event: string, handler: EventHandler<T>): void {
    this.handlers.get(event)?.delete(handler);
  }

  /**
   * Emit local event
   */
  private emit<T>(event: string, data: T): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  /**
   * Disconnect
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.emit('user:leave');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const webSocketClient = new WebSocketClient();
