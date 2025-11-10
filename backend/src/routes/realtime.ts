import { Router, Request, Response } from 'express';
import { webSocketService } from '../services/WebSocketService.js';
import { flightUpdateService, FlightTrackingData } from '../services/FlightUpdateService.js';
import { notificationService } from '../services/NotificationService.js';
import { collaborativeEditingService } from '../services/CollaborativeEditingService.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * Real-time Status Endpoints
 * Monitor WebSocket connections and real-time services
 */

// GET: Online users count
router.get('/users/online', (req: Request, res: Response) => {
  const onlineCount = webSocketService.getOnlineUsersCount();
  const onlineUsers = webSocketService.getOnlineUsers();

  res.json({
    statusCode: 200,
    data: {
      onlineCount,
      users: onlineUsers
    }
  });
});

// GET: Active flights being tracked
router.get('/flights/active', (req: Request, res: Response) => {
  const activeFlights = flightUpdateService.getActiveFlights();
  const flightCount = flightUpdateService.getFlightCount();

  res.json({
    statusCode: 200,
    data: {
      count: flightCount,
      flights: activeFlights
    }
  });
});

// POST: Start tracking a flight
router.post('/flights/track', (req: Request, res: Response) => {
  try {
    const { flightId, carrierCode, flightNumber, departureCity, arrivalCity, scheduledDeparture, scheduledArrival } = req.body;

    if (!flightId || !carrierCode || !flightNumber) {
      return res.status(400).json({
        statusCode: 400,
        error: 'Missing required fields'
      });
    }

    const flightData: FlightTrackingData = {
      flightId,
      carrierCode,
      flightNumber,
      departureCity,
      arrivalCity,
      scheduledDeparture: new Date(scheduledDeparture),
      scheduledArrival: new Date(scheduledArrival)
    };

    flightUpdateService.startFlightTracking(flightData);

    res.status(201).json({
      statusCode: 201,
      data: {
        message: 'Flight tracking started',
        flight: flightData
      }
    });
  } catch (error) {
    logger.error('Error starting flight tracking:', error);
    res.status(500).json({
      statusCode: 500,
      error: 'Failed to start flight tracking'
    });
  }
});

// POST: Stop tracking a flight
router.post('/flights/:flightId/stop', (req: Request, res: Response) => {
  try {
    const { flightId } = req.params;
    flightUpdateService.stopFlightTracking(flightId);

    res.json({
      statusCode: 200,
      data: {
        message: 'Flight tracking stopped',
        flightId
      }
    });
  } catch (error) {
    logger.error('Error stopping flight tracking:', error);
    res.status(500).json({
      statusCode: 500,
      error: 'Failed to stop flight tracking'
    });
  }
});

// GET: Flight history
router.get('/flights/:flightId/history', (req: Request, res: Response) => {
  try {
    const { flightId } = req.params;
    const history = flightUpdateService.getFlightHistory(flightId);

    res.json({
      statusCode: 200,
      data: {
        flightId,
        updates: history
      }
    });
  } catch (error) {
    logger.error('Error fetching flight history:', error);
    res.status(500).json({
      statusCode: 500,
      error: 'Failed to fetch flight history'
    });
  }
});

// GET: User notifications
router.get('/notifications/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const notifications = notificationService.getUserNotifications(userId);

    res.json({
      statusCode: 200,
      data: notifications
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({
      statusCode: 500,
      error: 'Failed to fetch notifications'
    });
  }
});

// POST: Send notification to user
router.post('/notifications/send', (req: Request, res: Response) => {
  try {
    const { userId, type, title, message, data } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        statusCode: 400,
        error: 'Missing required fields'
      });
    }

    notificationService.sendNotification(userId, {
      type,
      title,
      message,
      data
    }).then(notification => {
      res.status(201).json({
        statusCode: 201,
        data: notification
      });
    });
  } catch (error) {
    logger.error('Error sending notification:', error);
    res.status(500).json({
      statusCode: 500,
      error: 'Failed to send notification'
    });
  }
});

// POST: Broadcast notification to multiple users
router.post('/notifications/broadcast', (req: Request, res: Response) => {
  try {
    const { userIds, type, title, message, data } = req.body;

    if (!userIds || !Array.isArray(userIds) || !type || !title || !message) {
      return res.status(400).json({
        statusCode: 400,
        error: 'Missing required fields or invalid userIds'
      });
    }

    notificationService.broadcastNotification(userIds, {
      type,
      title,
      message,
      data
    }).then(notifications => {
      res.status(201).json({
        statusCode: 201,
        data: {
          message: `Notification sent to ${userIds.length} users`,
          count: notifications.length
        }
      });
    });
  } catch (error) {
    logger.error('Error broadcasting notification:', error);
    res.status(500).json({
      statusCode: 500,
      error: 'Failed to broadcast notification'
    });
  }
});

// POST: Create collaborative document
router.post('/documents/create', (req: Request, res: Response) => {
  try {
    const { ownerId, title, content } = req.body;

    if (!ownerId || !title) {
      return res.status(400).json({
        statusCode: 400,
        error: 'Missing required fields'
      });
    }

    const document = collaborativeEditingService.createDocument(ownerId, title, content || '');

    res.status(201).json({
      statusCode: 201,
      data: document
    });
  } catch (error) {
    logger.error('Error creating document:', error);
    res.status(500).json({
      statusCode: 500,
      error: 'Failed to create document'
    });
  }
});

// GET: Document details
router.get('/documents/:documentId', (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const document = collaborativeEditingService.getDocument(documentId);

    if (!document) {
      return res.status(404).json({
        statusCode: 404,
        error: 'Document not found'
      });
    }

    const session = collaborativeEditingService.getSession(documentId);

    res.json({
      statusCode: 200,
      data: {
        document,
        session
      }
    });
  } catch (error) {
    logger.error('Error fetching document:', error);
    res.status(500).json({
      statusCode: 500,
      error: 'Failed to fetch document'
    });
  }
});

// POST: Share document
router.post('/documents/:documentId/share', (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        statusCode: 400,
        error: 'Invalid userIds'
      });
    }

    collaborativeEditingService.shareDocument(documentId, userIds);

    res.json({
      statusCode: 200,
      data: {
        message: `Document shared with ${userIds.length} users`,
        documentId
      }
    });
  } catch (error) {
    logger.error('Error sharing document:', error);
    res.status(500).json({
      statusCode: 500,
      error: 'Failed to share document'
    });
  }
});

// GET: Notification statistics
router.get('/stats/notifications', (req: Request, res: Response) => {
  try {
    const stats = notificationService.getStats();

    res.json({
      statusCode: 200,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching notification stats:', error);
    res.status(500).json({
      statusCode: 500,
      error: 'Failed to fetch notification stats'
    });
  }
});

// GET: Collaborative editing statistics
router.get('/stats/collaborative', (req: Request, res: Response) => {
  try {
    const stats = collaborativeEditingService.getStats();

    res.json({
      statusCode: 200,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching collaborative stats:', error);
    res.status(500).json({
      statusCode: 500,
      error: 'Failed to fetch collaborative stats'
    });
  }
});

// GET: Overall real-time statistics
router.get('/stats', (req: Request, res: Response) => {
  try {
    const onlineUsers = webSocketService.getOnlineUsersCount();
    const activeFlights = flightUpdateService.getFlightCount();
    const notificationStats = notificationService.getStats();
    const collaborativeStats = collaborativeEditingService.getStats();

    res.json({
      statusCode: 200,
      data: {
        timestamp: new Date(),
        websocket: {
          onlineUsers
        },
        flights: {
          activeFlights
        },
        notifications: notificationStats,
        collaborative: collaborativeStats
      }
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({
      statusCode: 500,
      error: 'Failed to fetch stats'
    });
  }
});

export const createRealtimeRouter = () => router;
