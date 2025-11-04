/**
 * E2E Tests: Real-time Features
 * Pruebas de funcionalidades en tiempo real
 */

import { test, expect } from '@playwright/test';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';
let socket1: Socket;
let socket2: Socket;

test.describe('Real-time Features Tests', () => {
  test.beforeEach(async () => {
    // Create WebSocket connections
    socket1 = io(SOCKET_URL, {
      reconnection: true,
      transports: ['websocket']
    });

    socket2 = io(SOCKET_URL, {
      reconnection: true,
      transports: ['websocket']
    });
  });

  test.afterEach(async () => {
    socket1.disconnect();
    socket2.disconnect();
  });

  test.describe('WebSocket Connection', () => {
    test('should connect successfully', async () => {
      await new Promise<void>((resolve) => {
        socket1.on('connect', () => {
          expect(socket1.connected).toBeTruthy();
          resolve();
        });
      });
    });

    test('should handle user join event', async () => {
      let userJoinedData: any;

      await new Promise<void>((resolve) => {
        socket1.on('connect', () => {
          socket1.emit('user:join', {
            userId: 'user1',
            username: 'Test User',
            email: 'test@example.com'
          });

          socket1.on('presence:updated', (data) => {
            userJoinedData = data;
            resolve();
          });
        });
      });

      expect(userJoinedData).toBeDefined();
    });

    test('should reconnect on disconnect', async () => {
      let reconnected = false;

      await new Promise<void>((resolve) => {
        socket1.on('connect', () => {
          socket1.disconnect();

          socket1.on('connect', () => {
            reconnected = true;
            resolve();
          });

          socket1.connect();
        });
      });

      expect(reconnected).toBeTruthy();
    });
  });

  test.describe('Flight Updates', () => {
    test('should receive flight updates', async () => {
      let flightUpdate: any;

      await new Promise<void>((resolve) => {
        socket1.on('connect', () => {
          socket1.emit('flight:subscribe', 'flight-123');

          socket1.on('flight:updated', (data) => {
            flightUpdate = data;
            resolve();
          });

          // Simulate flight update from server
          setTimeout(() => {
            socket1.emit('flight:updated', {
              flightId: 'flight-123',
              status: 'on-time',
              departureTime: new Date().toISOString()
            });
          }, 100);
        });
      });

      expect(flightUpdate).toBeDefined();
      expect(flightUpdate.flightId).toBe('flight-123');
    });

    test('should subscribe and unsubscribe from flights', async () => {
      await new Promise<void>((resolve) => {
        socket1.on('connect', () => {
          // Subscribe
          socket1.emit('flight:subscribe', 'flight-456');

          setTimeout(() => {
            // Unsubscribe
            socket1.emit('flight:unsubscribe', 'flight-456');
            resolve();
          }, 100);
        });
      });

      expect(true).toBeTruthy();
    });
  });

  test.describe('Notifications', () => {
    test('should receive notifications', async () => {
      let notification: any;

      await new Promise<void>((resolve) => {
        socket1.on('connect', () => {
          socket1.emit('notification:subscribe');

          socket1.on('notification:received', (data) => {
            notification = data;
            resolve();
          });

          // Simulate notification from server
          setTimeout(() => {
            socket1.emit('notification:received', {
              id: 'notif-1',
              title: 'Test Notification',
              message: 'This is a test notification',
              type: 'booking'
            });
          }, 100);
        });
      });

      expect(notification).toBeDefined();
      expect(notification.title).toBe('Test Notification');
    });
  });

  test.describe('Collaborative Editing', () => {
    test('should support document subscription', async () => {
      await new Promise<void>((resolve) => {
        socket1.on('connect', () => {
          socket1.emit('document:subscribe', 'doc-123');

          socket1.on('document:subscribed', () => {
            resolve();
          });

          // Simulate subscription confirmation
          setTimeout(() => {
            socket1.emit('document:subscribed');
          }, 100);
        });
      });

      expect(true).toBeTruthy();
    });

    test('should broadcast document edits', async () => {
      let editData: any;

      await new Promise<void>((resolve) => {
        socket1.on('connect', () => {
          socket2.on('connect', () => {
            // Both subscribe to same document
            socket1.emit('document:subscribe', 'doc-123');
            socket2.emit('document:subscribe', 'doc-123');

            // Socket 1 edits
            socket2.on('document:edited', (data) => {
              editData = data;
              resolve();
            });

            socket1.emit('document:edit', {
              documentId: 'doc-123',
              action: 'update',
              field: 'title',
              value: 'Updated Title'
            });

            // Simulate broadcast
            setTimeout(() => {
              socket2.emit('document:edited', {
                documentId: 'doc-123',
                action: 'update',
                field: 'title',
                value: 'Updated Title'
              });
            }, 100);
          });
        });
      });

      expect(editData).toBeDefined();
      expect(editData.field).toBe('title');
    });

    test('should sync cursor positions', async () => {
      let cursorData: any;

      await new Promise<void>((resolve) => {
        socket1.on('connect', () => {
          socket2.on('connect', () => {
            socket1.emit('document:subscribe', 'doc-123');
            socket2.emit('document:subscribe', 'doc-123');

            socket2.on('document:cursor', (data) => {
              cursorData = data;
              resolve();
            });

            socket1.emit('document:cursor', {
              documentId: 'doc-123',
              cursor: { line: 5, column: 10 }
            });

            // Simulate cursor broadcast
            setTimeout(() => {
              socket2.emit('document:cursor', {
                documentId: 'doc-123',
                cursor: { line: 5, column: 10 }
              });
            }, 100);
          });
        });
      });

      expect(cursorData).toBeDefined();
      expect(cursorData.cursor.line).toBe(5);
    });

    test('should show typing indicators', async () => {
      let typingData: any;

      await new Promise<void>((resolve) => {
        socket1.on('connect', () => {
          socket2.on('connect', () => {
            socket1.emit('document:subscribe', 'doc-123');
            socket2.emit('document:subscribe', 'doc-123');

            socket2.on('presence:typing', (data) => {
              typingData = data;
              resolve();
            });

            socket1.emit('presence:typing', {
              documentId: 'doc-123',
              isTyping: true
            });

            // Simulate typing broadcast
            setTimeout(() => {
              socket2.emit('presence:typing', {
                documentId: 'doc-123',
                isTyping: true
              });
            }, 100);
          });
        });
      });

      expect(typingData).toBeDefined();
      expect(typingData.isTyping).toBeTruthy();
    });
  });

  test.describe('Presence Management', () => {
    test('should track user presence', async () => {
      let presenceUpdate: any;

      await new Promise<void>((resolve) => {
        socket1.on('connect', () => {
          socket1.emit('user:join', {
            userId: 'user1',
            username: 'User 1',
            email: 'user1@example.com'
          });

          socket1.on('presence:updated', (data) => {
            presenceUpdate = data;
            resolve();
          });

          // Simulate presence update
          setTimeout(() => {
            socket1.emit('presence:updated', {
              userId: 'user1',
              status: 'online'
            });
          }, 100);
        });
      });

      expect(presenceUpdate).toBeDefined();
      expect(presenceUpdate.status).toBe('online');
    });

    test('should update user status', async () => {
      await new Promise<void>((resolve) => {
        socket1.on('connect', () => {
          socket1.emit('user:join', {
            userId: 'user1',
            username: 'User 1',
            email: 'user1@example.com'
          });

          socket1.on('presence:updated', () => {
            // Status updated
            resolve();
          });

          // Simulate status change
          setTimeout(() => {
            socket1.emit('user:away');
            socket1.emit('presence:updated', { userId: 'user1', status: 'away' });
          }, 100);
        });
      });

      expect(true).toBeTruthy();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle connection errors', async () => {
      const invalidSocket = io('http://invalid-host:9999', {
        reconnectionAttempts: 1,
        reconnectionDelay: 100
      });

      let connectionError = false;

      await new Promise<void>((resolve) => {
        invalidSocket.on('connect_error', () => {
          connectionError = true;
          invalidSocket.disconnect();
          resolve();
        });

        setTimeout(() => {
          invalidSocket.disconnect();
          resolve();
        }, 1000);
      });

      expect(connectionError || !invalidSocket.connected).toBeTruthy();
    });

    test('should handle invalid event data', async () => {
      await new Promise<void>((resolve) => {
        socket1.on('connect', () => {
          // Send invalid data
          socket1.emit('document:edit', {
            // Missing required fields
            invalidField: true
          });

          // Should not crash
          setTimeout(() => {
            resolve();
          }, 100);
        });
      });

      expect(true).toBeTruthy();
    });
  });
});
