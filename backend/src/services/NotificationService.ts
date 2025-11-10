import { webSocketService, Notification } from './WebSocketService.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Real-time Notification Service
 * Manages push notifications, alerts, and system messages
 */

export interface NotificationOptions {
  type: 'payment' | 'booking' | 'flight' | 'settlement' | 'alert';
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  expiresIn?: number; // milliseconds
}

export interface UserNotifications {
  userId: string;
  notifications: Notification[];
  unreadCount: number;
}

class NotificationService {
  private userNotifications: Map<string, Notification[]> = new Map();
  private notificationExpiry: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Send notification to user
   */
  public async sendNotification(userId: string, options: NotificationOptions): Promise<Notification> {
    const notification: Notification = {
      id: uuidv4(),
      userId,
      type: options.type,
      title: options.title,
      message: options.message,
      data: options.data,
      read: false,
      createdAt: new Date()
    };

    // Store notification
    if (!this.userNotifications.has(userId)) {
      this.userNotifications.set(userId, []);
    }
    this.userNotifications.get(userId)!.push(notification);

    // Send via WebSocket
    webSocketService.sendNotification(userId, notification);

    // Set expiry if specified
    if (options.expiresIn) {
      const timeout = setTimeout(() => {
        this.expireNotification(userId, notification.id);
      }, options.expiresIn);
      this.notificationExpiry.set(notification.id, timeout);
    }

    logger.info(`Notification sent to ${userId}: ${options.title}`);
    return notification;
  }

  /**
   * Send payment notification
   */
  public async sendPaymentNotification(userId: string, data: {
    amount: number;
    currency: string;
    status: 'completed' | 'failed' | 'pending';
    transactionId: string;
  }): Promise<Notification> {
    return this.sendNotification(userId, {
      type: 'payment',
      title: `Payment ${data.status}`,
      message: `Payment of ${data.currency} ${data.amount} ${data.status}`,
      data,
      priority: data.status === 'failed' ? 'high' : 'normal'
    });
  }

  /**
   * Send booking notification
   */
  public async sendBookingNotification(userId: string, data: {
    showTitle: string;
    date: Date;
    confirmationNumber: string;
    bookingStatus: 'confirmed' | 'cancelled' | 'pending';
  }): Promise<Notification> {
    return this.sendNotification(userId, {
      type: 'booking',
      title: `Booking ${data.bookingStatus}`,
      message: `Your booking for "${data.showTitle}" has been ${data.bookingStatus}. Confirmation: ${data.confirmationNumber}`,
      data,
      priority: 'high'
    });
  }

  /**
   * Send flight notification
   */
  public async sendFlightNotification(userId: string, data: {
    flightNumber: string;
    status: string;
    departureTime?: Date;
    gate?: string;
    terminal?: string;
    delay?: number;
  }): Promise<Notification> {
    let message = `Flight ${data.flightNumber} is ${data.status}`;
    if (data.gate) message += ` at gate ${data.gate}`;
    if (data.delay) message += ` - Delayed by ${data.delay} minutes`;

    return this.sendNotification(userId, {
      type: 'flight',
      title: `Flight Update: ${data.flightNumber}`,
      message,
      data,
      priority: data.delay ? 'high' : 'normal'
    });
  }

  /**
   * Send settlement notification
   */
  public async sendSettlementNotification(userId: string, data: {
    settlementName: string;
    amount: number;
    currency: string;
    status: 'initiated' | 'completed' | 'failed';
  }): Promise<Notification> {
    return this.sendNotification(userId, {
      type: 'settlement',
      title: `Settlement ${data.status}`,
      message: `Settlement "${data.settlementName}" for ${data.currency} ${data.amount} has been ${data.status}`,
      data,
      priority: 'high'
    });
  }

  /**
   * Send system alert
   */
  public async sendAlert(userId: string, data: {
    urgency: 'low' | 'normal' | 'high' | 'critical';
    message: string;
    action?: string;
  }): Promise<Notification> {
    return this.sendNotification(userId, {
      type: 'alert',
      title: `System Alert - ${data.urgency.toUpperCase()}`,
      message: data.message,
      data,
      priority: data.urgency === 'critical' ? 'urgent' : 'high'
    });
  }

  /**
   * Broadcast notification to multiple users
   */
  public async broadcastNotification(userIds: string[], options: NotificationOptions): Promise<Notification[]> {
    const notifications: Notification[] = [];
    for (const userId of userIds) {
      const notification = await this.sendNotification(userId, options);
      notifications.push(notification);
    }
    logger.info(`Notification broadcasted to ${userIds.length} users: ${options.title}`);
    return notifications;
  }

  /**
   * Broadcast to all online users
   */
  public async broadcastToAll(options: NotificationOptions): Promise<void> {
    const onlineUsers = webSocketService.getOnlineUsers();
    const userIds = onlineUsers.map(u => u.userId);
    await this.broadcastNotification(userIds, options);
  }

  /**
   * Mark notification as read
   */
  public markAsRead(userId: string, notificationId: string): void {
    const notifications = this.userNotifications.get(userId);
    if (notifications) {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        logger.debug(`Notification ${notificationId} marked as read for ${userId}`);
      }
    }
  }

  /**
   * Mark all notifications as read
   */
  public markAllAsRead(userId: string): void {
    const notifications = this.userNotifications.get(userId);
    if (notifications) {
      notifications.forEach(n => n.read = true);
      logger.debug(`All notifications marked as read for ${userId}`);
    }
  }

  /**
   * Get user notifications
   */
  public getUserNotifications(userId: string): UserNotifications {
    const notifications = this.userNotifications.get(userId) || [];
    const unreadCount = notifications.filter(n => !n.read).length;

    return {
      userId,
      notifications,
      unreadCount
    };
  }

  /**
   * Get unread notifications
   */
  public getUnreadNotifications(userId: string): Notification[] {
    const notifications = this.userNotifications.get(userId) || [];
    return notifications.filter(n => !n.read);
  }

  /**
   * Clear notification
   */
  public clearNotification(userId: string, notificationId: string): void {
    const notifications = this.userNotifications.get(userId);
    if (notifications) {
      const index = notifications.findIndex(n => n.id === notificationId);
      if (index > -1) {
        notifications.splice(index, 1);
      }
    }

    // Clear expiry timer
    const timeout = this.notificationExpiry.get(notificationId);
    if (timeout) {
      clearTimeout(timeout);
      this.notificationExpiry.delete(notificationId);
    }
  }

  /**
   * Clear all notifications for user
   */
  public clearAllNotifications(userId: string): void {
    this.userNotifications.delete(userId);
  }

  /**
   * Expire notification (called by timer)
   */
  private expireNotification(userId: string, notificationId: string): void {
    this.clearNotification(userId, notificationId);
    logger.debug(`Notification ${notificationId} expired for ${userId}`);
  }

  /**
   * Get notification statistics
   */
  public getStats(): {
    totalNotifications: number;
    totalUsers: number;
    avgNotificationsPerUser: number;
    totalUnread: number;
  } {
    let totalNotifications = 0;
    let totalUnread = 0;

    for (const notifications of this.userNotifications.values()) {
      totalNotifications += notifications.length;
      totalUnread += notifications.filter(n => !n.read).length;
    }

    return {
      totalNotifications,
      totalUsers: this.userNotifications.size,
      avgNotificationsPerUser: this.userNotifications.size > 0 ? totalNotifications / this.userNotifications.size : 0,
      totalUnread
    };
  }
}

export const notificationService = new NotificationService();
