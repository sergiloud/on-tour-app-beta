import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger.js';

/**
 * WebSocket Service - Manages real-time communication
 * Handles flight updates, notifications, presence, and collaborative editing
 */

// Type definitions
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
  delay?: number; // in minutes
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

export interface CollaborativeEdit {
  documentId: string;
  userId: string;
  username: string;
  action: 'create' | 'update' | 'delete';
  field: string;
  value: any;
  timestamp: Date;
}

export interface PresenceUpdate {
  action: 'join' | 'leave' | 'update';
  user: UserPresence;
  onlineCount: number;
  users: UserPresence[];
}

class WebSocketService {
  private io: Server | null = null;
  private userConnections: Map<string, Set<string>> = new Map(); // userId -> socketIds
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId
  private userPresence: Map<string, UserPresence> = new Map(); // userId -> presence
  private flightSubscriptions: Map<string, Set<string>> = new Map(); // flightId -> socketIds
  private documentSubscriptions: Map<string, Set<string>> = new Map(); // documentId -> socketIds
  private activeEdits: Map<string, CollaborativeEdit[]> = new Map(); // documentId -> edits

  /**
   * Initialize WebSocket server
   */
  public initialize(server: any): void {
    this.io = new Server(server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:4173',
          process.env.FRONTEND_URL || 'http://localhost:5173'
        ],
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      pingInterval: 25000,
      pingTimeout: 60000
    });

    this.setupEventHandlers();
    logger.info('WebSocket service initialized');
  }

  /**
   * Setup main event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      logger.info(`New WebSocket connection: ${socket.id}`);

      // Authentication and presence
      socket.on('user:join', (data) => this.handleUserJoin(socket, data));
      socket.on('user:leave', () => this.handleUserLeave(socket));
      socket.on('presence:update', (data) => this.handlePresenceUpdate(socket, data));

      // Flight updates
      socket.on('flight:subscribe', (flightId) => this.subscribeToFlight(socket, flightId));
      socket.on('flight:unsubscribe', (flightId) => this.unsubscribeFromFlight(socket, flightId));
      socket.on('flight:update', (data) => this.broadcastFlightUpdate(data));

      // Notifications
      socket.on('notification:subscribe', () => this.handleNotificationSubscribe(socket));
      socket.on('notification:send', (data) => this.handleNotificationSend(socket, data));
      socket.on('notification:read', (data) => this.handleNotificationRead(socket, data));

      // Collaborative editing
      socket.on('document:subscribe', (documentId) => this.subscribeToDocument(socket, documentId));
      socket.on('document:unsubscribe', (documentId) => this.unsubscribeFromDocument(socket, documentId));
      socket.on('document:edit', (data) => this.handleDocumentEdit(socket, data));
      socket.on('document:cursor', (data) => this.broadcastCursorPosition(socket, data));

      // Presence tracking
      socket.on('presence:typing', (data) => this.broadcastTypingIndicator(socket, data));

      // Disconnect
      socket.on('disconnect', () => this.handleDisconnect(socket));

      // Error handling
      socket.on('error', (error) => {
        logger.error(`Socket error (${socket.id}):`, error);
      });
    });
  }

  /**
   * Handle user join
   */
  private handleUserJoin(socket: Socket, data: { userId: string; username: string; email: string }): void {
    const { userId, username, email } = data;

    // Register socket connection
    this.socketUsers.set(socket.id, userId);
    
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(socket.id);

    // Update presence
    const presence: UserPresence = {
      userId,
      username,
      email,
      status: 'online',
      lastSeen: new Date()
    };
    this.userPresence.set(userId, presence);

    // Join socket to user-specific room
    socket.join(`user:${userId}`);
    socket.join('notifications');

    // Broadcast presence update
    this.broadcastPresenceUpdate({
      action: 'join',
      user: presence,
      onlineCount: this.userPresence.size,
      users: Array.from(this.userPresence.values())
    });

    logger.info(`User ${username} (${userId}) joined via ${socket.id}`);
  }

  /**
   * Handle user leave
   */
  private handleUserLeave(socket: Socket): void {
    const userId = this.socketUsers.get(socket.id);
    if (!userId) return;

    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.delete(socket.id);
      if (connections.size === 0) {
        this.userConnections.delete(userId);
        this.userPresence.delete(userId);

        const presence = this.userPresence.get(userId);
        if (presence) {
          this.broadcastPresenceUpdate({
            action: 'leave',
            user: { ...presence, status: 'offline' },
            onlineCount: this.userPresence.size,
            users: Array.from(this.userPresence.values())
          });
        }
      }
    }
  }

  /**
   * Handle presence update (online/away/offline)
   */
  private handlePresenceUpdate(socket: Socket, data: { status: 'online' | 'away' | 'offline'; currentPage?: string }): void {
    const userId = this.socketUsers.get(socket.id);
    if (!userId) return;

    const presence = this.userPresence.get(userId);
    if (presence) {
      presence.status = data.status;
      presence.currentPage = data.currentPage;
      presence.lastSeen = new Date();

      this.broadcastPresenceUpdate({
        action: 'update',
        user: presence,
        onlineCount: this.userPresence.size,
        users: Array.from(this.userPresence.values())
      });
    }
  }

  /**
   * Subscribe to flight updates
   */
  private subscribeToFlight(socket: Socket, flightId: string): void {
    if (!this.flightSubscriptions.has(flightId)) {
      this.flightSubscriptions.set(flightId, new Set());
    }
    this.flightSubscriptions.get(flightId)!.add(socket.id);
    socket.join(`flight:${flightId}`);

    logger.debug(`Socket ${socket.id} subscribed to flight ${flightId}`);
  }

  /**
   * Unsubscribe from flight updates
   */
  private unsubscribeFromFlight(socket: Socket, flightId: string): void {
    this.flightSubscriptions.get(flightId)?.delete(socket.id);
    socket.leave(`flight:${flightId}`);
  }

  /**
   * Broadcast flight update to subscribed clients
   */
  private broadcastFlightUpdate(flightUpdate: FlightUpdate): void {
    const room = `flight:${flightUpdate.flightId}`;
    if (this.io) {
      this.io.to(room).emit('flight:updated', flightUpdate);
      logger.info(`Flight update broadcasted: ${flightUpdate.flightId} - ${flightUpdate.status}`);
    }
  }

  /**
   * Handle notification subscription
   */
  private handleNotificationSubscribe(socket: Socket): void {
    const userId = this.socketUsers.get(socket.id);
    if (userId) {
      socket.join(`user:${userId}:notifications`);
    }
  }

  /**
   * Handle sending notifications
   */
  private handleNotificationSend(socket: Socket, data: Notification): void {
    const room = `user:${data.userId}:notifications`;
    if (this.io) {
      this.io.to(room).emit('notification:received', data);
      logger.info(`Notification sent to user ${data.userId}: ${data.title}`);
    }
  }

  /**
   * Handle notification read
   */
  private handleNotificationRead(socket: Socket, data: { notificationId: string }): void {
    // In a real app, update database
    logger.debug(`Notification ${data.notificationId} marked as read by socket ${socket.id}`);
  }

  /**
   * Subscribe to document for collaborative editing
   */
  private subscribeToDocument(socket: Socket, documentId: string): void {
    if (!this.documentSubscriptions.has(documentId)) {
      this.documentSubscriptions.set(documentId, new Set());
    }
    this.documentSubscriptions.get(documentId)!.add(socket.id);
    socket.join(`document:${documentId}`);

    // Send current edits to new subscriber
    const edits = this.activeEdits.get(documentId) || [];
    socket.emit('document:edits', edits);

    logger.debug(`Socket ${socket.id} subscribed to document ${documentId}`);
  }

  /**
   * Unsubscribe from document
   */
  private unsubscribeFromDocument(socket: Socket, documentId: string): void {
    this.documentSubscriptions.get(documentId)?.delete(socket.id);
    socket.leave(`document:${documentId}`);
  }

  /**
   * Handle collaborative document edits
   */
  private handleDocumentEdit(socket: Socket, data: any): void {
    const userId = this.socketUsers.get(socket.id);
    const user = this.userPresence.get(userId || '');
    
    if (!userId || !user) return;

    const edit: CollaborativeEdit = {
      documentId: data.documentId,
      userId,
      username: user.username,
      action: data.action,
      field: data.field,
      value: data.value,
      timestamp: new Date()
    };

    // Store edit in memory
    if (!this.activeEdits.has(data.documentId)) {
      this.activeEdits.set(data.documentId, []);
    }
    this.activeEdits.get(data.documentId)!.push(edit);

    // Broadcast to all subscribers
    const room = `document:${data.documentId}`;
    if (this.io) {
      this.io.to(room).emit('document:edited', edit);
      logger.debug(`Document ${data.documentId} edited by ${user.username}`);
    }
  }

  /**
   * Broadcast cursor position for collaborative editing
   */
  private broadcastCursorPosition(socket: Socket, data: any): void {
    const userId = this.socketUsers.get(socket.id);
    const user = this.userPresence.get(userId || '');
    
    if (!user) return;

    const room = `document:${data.documentId}`;
    if (this.io) {
      this.io.to(room).emit('document:cursor', {
        userId,
        username: user.username,
        cursor: data.cursor,
        timestamp: new Date()
      });
    }
  }

  /**
   * Broadcast typing indicator
   */
  private broadcastTypingIndicator(socket: Socket, data: any): void {
    const userId = this.socketUsers.get(socket.id);
    const user = this.userPresence.get(userId || '');
    
    if (!user) return;

    const room = data.documentId ? `document:${data.documentId}` : 'notifications';
    if (this.io) {
      socket.broadcast.to(room).emit('presence:typing', {
        userId,
        username: user.username,
        isTyping: data.isTyping,
        timestamp: new Date()
      });
    }
  }

  /**
   * Broadcast presence update to all users
   */
  private broadcastPresenceUpdate(update: PresenceUpdate): void {
    if (this.io) {
      this.io.emit('presence:updated', update);
    }
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(socket: Socket): void {
    const userId = this.socketUsers.get(socket.id);
    if (userId) {
      this.handleUserLeave(socket);
      this.socketUsers.delete(socket.id);
      logger.info(`User ${userId} disconnected via ${socket.id}`);
    }
  }

  // Public API methods

  /**
   * Emit event to specific user
   */
  public emitToUser(userId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  /**
   * Emit event to all users
   */
  public emitToAll(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  /**
   * Send notification to user
   */
  public sendNotification(userId: string, notification: Notification): void {
    this.emitToUser(userId, 'notification:received', notification);
    logger.info(`Notification sent to ${userId}: ${notification.title}`);
  }

  /**
   * Broadcast flight update
   */
  public updateFlight(flightUpdate: FlightUpdate): void {
    this.broadcastFlightUpdate(flightUpdate);
  }

  /**
   * Get online users count
   */
  public getOnlineUsersCount(): number {
    return this.userPresence.size;
  }

  /**
   * Get all online users
   */
  public getOnlineUsers(): UserPresence[] {
    return Array.from(this.userPresence.values());
  }

  /**
   * Get user's socket IDs
   */
  public getUserSockets(userId: string): string[] {
    return Array.from(this.userConnections.get(userId) || []);
  }

  /**
   * Get server instance
   */
  public getServer(): Server | null {
    return this.io;
  }
}

export const webSocketService = new WebSocketService();
