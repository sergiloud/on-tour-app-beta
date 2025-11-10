import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { webSocketService, FlightUpdate, Notification } from '../services/WebSocketService.js';
import { flightUpdateService } from '../services/FlightUpdateService.js';
import { notificationService } from '../services/NotificationService.js';
import { collaborativeEditingService } from '../services/CollaborativeEditingService.js';

describe('Real-time Services', () => {

  describe('WebSocketService', () => {
    it('should track online users', () => {
      const onlineCount = webSocketService.getOnlineUsersCount();
      expect(typeof onlineCount).toBe('number');
      expect(onlineCount).toBeGreaterThanOrEqual(0);
    });

    it('should get online users list', () => {
      const users = webSocketService.getOnlineUsers();
      expect(Array.isArray(users)).toBe(true);
    });

    it('should emit notifications to user', () => {
      const userId = 'test-user-123';
      const notification: Notification = {
        id: 'notif-1',
        userId,
        type: 'alert',
        title: 'Test Alert',
        message: 'This is a test notification',
        read: false,
        createdAt: new Date()
      };

      // This should not throw
      webSocketService.sendNotification(userId, notification);
      expect(true).toBe(true);
    });

    it('should emit to all users', () => {
      // This should not throw
      webSocketService.emitToAll('test:event', { data: 'test' });
      expect(true).toBe(true);
    });
  });

  describe('FlightUpdateService', () => {
    afterEach(() => {
      // Clean up
      const flights = flightUpdateService.getActiveFlights();
      flights.forEach(flight => {
        flightUpdateService.stopFlightTracking(flight.flightId);
      });
    });

    it('should start flight tracking', () => {
      const flightData = {
        flightId: 'FL-001',
        carrierCode: 'DL',
        flightNumber: '123',
        departureCity: 'ATL',
        arrivalCity: 'LAX',
        scheduledDeparture: new Date(Date.now() + 3600000),
        scheduledArrival: new Date(Date.now() + 7200000)
      };

      flightUpdateService.startFlightTracking(flightData);
      const activeFlights = flightUpdateService.getActiveFlights();
      expect(activeFlights.length).toBeGreaterThan(0);
    });

    it('should stop flight tracking', () => {
      const flightData = {
        flightId: 'FL-002',
        carrierCode: 'AA',
        flightNumber: '456',
        departureCity: 'JFK',
        arrivalCity: 'LAX',
        scheduledDeparture: new Date(Date.now() + 3600000),
        scheduledArrival: new Date(Date.now() + 7200000)
      };

      flightUpdateService.startFlightTracking(flightData);
      flightUpdateService.stopFlightTracking('FL-002');

      const activeFlights = flightUpdateService.getActiveFlights();
      const flight = activeFlights.find(f => f.flightId === 'FL-002');
      expect(flight).toBeUndefined();
    });

    it('should get flight history', () => {
      const history = flightUpdateService.getFlightHistory('FL-999');
      expect(Array.isArray(history)).toBe(true);
    });

    it('should get flight count', () => {
      const count = flightUpdateService.getFlightCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('NotificationService', () => {
    it('should send payment notification', async () => {
      const notification = await notificationService.sendPaymentNotification('user-1', {
        amount: 100,
        currency: 'USD',
        status: 'completed',
        transactionId: 'tx-123'
      });

      expect(notification).toBeDefined();
      expect(notification.type).toBe('payment');
      expect(notification.userId).toBe('user-1');
    });

    it('should send booking notification', async () => {
      const notification = await notificationService.sendBookingNotification('user-2', {
        showTitle: 'Summer Festival',
        date: new Date(),
        confirmationNumber: 'CONF-123',
        bookingStatus: 'confirmed'
      });

      expect(notification).toBeDefined();
      expect(notification.type).toBe('booking');
    });

    it('should send flight notification', async () => {
      const notification = await notificationService.sendFlightNotification('user-3', {
        flightNumber: 'DL123',
        status: 'boarding',
        gate: '5A',
        terminal: 'T1'
      });

      expect(notification).toBeDefined();
      expect(notification.type).toBe('flight');
    });

    it('should send settlement notification', async () => {
      const notification = await notificationService.sendSettlementNotification('user-4', {
        settlementName: 'Q1 Settlement',
        amount: 50000,
        currency: 'USD',
        status: 'completed'
      });

      expect(notification).toBeDefined();
      expect(notification.type).toBe('settlement');
    });

    it('should send alert', async () => {
      const notification = await notificationService.sendAlert('user-5', {
        urgency: 'high',
        message: 'Payment processing error'
      });

      expect(notification).toBeDefined();
      expect(notification.type).toBe('alert');
    });

    it('should get user notifications', () => {
      const userNotifs = notificationService.getUserNotifications('user-1');
      expect(userNotifs.userId).toBe('user-1');
      expect(Array.isArray(userNotifs.notifications)).toBe(true);
      expect(typeof userNotifs.unreadCount).toBe('number');
    });

    it('should mark notification as read', async () => {
      const notification = await notificationService.sendPaymentNotification('user-6', {
        amount: 200,
        currency: 'USD',
        status: 'completed',
        transactionId: 'tx-456'
      });

      notificationService.markAsRead('user-6', notification.id);
      const unread = notificationService.getUnreadNotifications('user-6');
      const marked = unread.find(n => n.id === notification.id);
      expect(marked).toBeUndefined();
    });

    it('should broadcast notification', async () => {
      const userIds = ['user-a', 'user-b', 'user-c'];
      const notifications = await notificationService.broadcastNotification(userIds, {
        type: 'alert',
        title: 'System Notice',
        message: 'Scheduled maintenance',
        priority: 'normal'
      });

      expect(notifications.length).toBe(userIds.length);
    });

    it('should get notification stats', () => {
      const stats = notificationService.getStats();
      expect(stats).toHaveProperty('totalNotifications');
      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('avgNotificationsPerUser');
      expect(stats).toHaveProperty('totalUnread');
    });
  });

  describe('CollaborativeEditingService', () => {
    it('should create document', () => {
      const doc = collaborativeEditingService.createDocument('user-1', 'Test Doc');
      expect(doc).toBeDefined();
      expect(doc.title).toBe('Test Doc');
      expect(doc.ownerId).toBe('user-1');
      expect(doc.version).toBe(0);
    });

    it('should get document', () => {
      const created = collaborativeEditingService.createDocument('user-2', 'Get Test');
      const retrieved = collaborativeEditingService.getDocument(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should add collaborator', () => {
      const doc = collaborativeEditingService.createDocument('user-1', 'Collab Doc');
      collaborativeEditingService.addCollaborator(doc.id, 'user-2');

      const updated = collaborativeEditingService.getDocument(doc.id);
      expect(updated?.collaborators).toContain('user-2');
    });

    it('should apply edits', () => {
      const doc = collaborativeEditingService.createDocument('user-1', 'Edit Doc');
      const edit = collaborativeEditingService.applyEdit(
        doc.id,
        'user-1',
        'insert',
        'content.0',
        'Hello'
      );

      expect(edit).toBeDefined();
      expect(edit?.action).toBe('insert');
      expect(edit?.value).toBe('Hello');
    });

    it('should track cursor positions', () => {
      const doc = collaborativeEditingService.createDocument('user-1', 'Cursor Doc');
      collaborativeEditingService.updateCursorPosition(doc.id, 'user-1', 'User One', 5, 10);

      const cursors = collaborativeEditingService.getCursors(doc.id);
      expect(cursors.length).toBeGreaterThan(0);
      expect(cursors[0].userId).toBe('user-1');
      expect(cursors[0].line).toBe(5);
      expect(cursors[0].column).toBe(10);
    });

    it('should get edit history', () => {
      const doc = collaborativeEditingService.createDocument('user-1', 'History Doc');
      collaborativeEditingService.applyEdit(doc.id, 'user-1', 'insert', 'path', 'value1');
      collaborativeEditingService.applyEdit(doc.id, 'user-1', 'insert', 'path', 'value2');

      const history = collaborativeEditingService.getEditHistory(doc.id);
      expect(history.length).toBe(2);
    });

    it('should undo edits', () => {
      const doc = collaborativeEditingService.createDocument('user-1', 'Undo Doc');
      collaborativeEditingService.applyEdit(doc.id, 'user-1', 'insert', 'path', 'value');

      const undone = collaborativeEditingService.undo(doc.id);
      expect(undone).toBeDefined();
      expect(undone?.action).toBe('insert');
    });

    it('should redo edits', () => {
      const doc = collaborativeEditingService.createDocument('user-1', 'Redo Doc');
      collaborativeEditingService.applyEdit(doc.id, 'user-1', 'insert', 'path', 'value');
      collaborativeEditingService.undo(doc.id);

      const redone = collaborativeEditingService.redo(doc.id);
      expect(redone).toBeDefined();
    });

    it('should get active users', () => {
      const doc = collaborativeEditingService.createDocument('user-1', 'Users Doc');
      collaborativeEditingService.addCollaborator(doc.id, 'user-2');

      const activeUsers = collaborativeEditingService.getActiveUsers(doc.id);
      expect(activeUsers).toContain('user-1');
      expect(activeUsers).toContain('user-2');
    });

    it('should get collaborative stats', () => {
      const stats = collaborativeEditingService.getStats();
      expect(stats).toHaveProperty('totalDocuments');
      expect(stats).toHaveProperty('activeSessions');
      expect(stats).toHaveProperty('totalEdits');
      expect(stats).toHaveProperty('avgVersions');
    });
  });

  describe('Integration', () => {
    it('should handle complete real-time flow', async () => {
      // Create document
      const doc = collaborativeEditingService.createDocument('user-1', 'Integration Test');
      expect(doc).toBeDefined();

      // Add collaborator
      collaborativeEditingService.addCollaborator(doc.id, 'user-2');

      // Make edits
      const edit1 = collaborativeEditingService.applyEdit(doc.id, 'user-1', 'insert', 'title', 'Summer Festival');
      const edit2 = collaborativeEditingService.applyEdit(doc.id, 'user-2', 'insert', 'location', 'Central Park');

      expect(edit1).toBeDefined();
      expect(edit2).toBeDefined();

      // Send notification
      const notification = await notificationService.sendNotification('user-1', {
        type: 'booking',
        title: 'Document Updated',
        message: 'user-2 made changes to the document'
      });

      expect(notification).toBeDefined();

      // Verify edit history
      const history = collaborativeEditingService.getEditHistory(doc.id);
      expect(history.length).toBe(2);

      // Get stats
      const stats = collaborativeEditingService.getStats();
      expect(stats.totalDocuments).toBeGreaterThan(0);
    });
  });
});
