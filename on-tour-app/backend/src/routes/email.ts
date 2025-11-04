import { Router, Request, Response } from 'express';
import { Logger } from 'pino';
import { EmailService } from '../services/EmailService.js';
import {
  EmailRequestSchema,
  BookingConfirmationEmailSchema,
  ReminderEmailSchema,
  InvoiceEmailSchema,
  SettlementReportEmailSchema,
  AlertEmailSchema,
} from '../schemas/integrations.schemas.js';
import { authMiddleware } from '../middleware/auth.js';

export function createEmailRouter(logger: Logger): Router {
  const router = Router();
  const emailService = new EmailService(logger);

  /**
   * POST /api/email/send
   * Send a generic email
   */
  router.post('/send', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = EmailRequestSchema.parse(req.body);

      const messageId = await emailService.sendEmail(validated);

      res.json({
        success: true,
        messageId,
        message: 'Email sent successfully',
      });
    } catch (error) {
      logger.error({ error, body: req.body }, 'Email sending failed');

      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email details',
          details: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Email sending failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/email/booking-confirmation
   * Send booking confirmation email
   */
  router.post('/booking-confirmation', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = BookingConfirmationEmailSchema.parse(req.body);

      const messageId = await emailService.sendBookingConfirmation(validated);

      res.json({
        success: true,
        messageId,
        message: 'Booking confirmation email sent',
      });
    } catch (error) {
      logger.error({ error, body: req.body }, 'Booking confirmation email failed');

      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid booking confirmation details',
          details: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Booking confirmation email failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/email/event-reminder
   * Send event reminder email
   */
  router.post('/event-reminder', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = ReminderEmailSchema.parse(req.body);

      const messageId = await emailService.sendEventReminder(validated);

      res.json({
        success: true,
        messageId,
        message: 'Event reminder email sent',
      });
    } catch (error) {
      logger.error({ error, body: req.body }, 'Event reminder email failed');

      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event reminder details',
          details: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Event reminder email failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/email/invoice
   * Send invoice email
   */
  router.post('/invoice', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = InvoiceEmailSchema.parse(req.body);

      const messageId = await emailService.sendInvoice(validated);

      res.json({
        success: true,
        messageId,
        message: 'Invoice email sent',
      });
    } catch (error) {
      logger.error({ error, body: req.body }, 'Invoice email failed');

      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid invoice details',
          details: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Invoice email failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/email/settlement-report
   * Send settlement report email
   */
  router.post('/settlement-report', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = SettlementReportEmailSchema.parse(req.body);

      const messageId = await emailService.sendSettlementReport(validated);

      res.json({
        success: true,
        messageId,
        message: 'Settlement report email sent',
      });
    } catch (error) {
      logger.error({ error, body: req.body }, 'Settlement report email failed');

      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid settlement report details',
          details: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Settlement report email failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/email/alert
   * Send alert email
   */
  router.post('/alert', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = AlertEmailSchema.parse(req.body);

      const messageId = await emailService.sendAlert(validated);

      res.json({
        success: true,
        messageId,
        message: 'Alert email sent',
      });
    } catch (error) {
      logger.error({ error, body: req.body }, 'Alert email failed');

      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid alert details',
          details: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Alert email failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/email/verify
   * Verify email service connection
   */
  router.post('/verify', authMiddleware, async (req: Request, res: Response) => {
    try {
      const verified = await emailService.verifyConnection();

      res.json({
        success: true,
        verified,
        message: verified ? 'Email service is connected' : 'Email service connection failed',
      });
    } catch (error) {
      logger.error({ error }, 'Email verification failed');

      res.status(500).json({
        success: false,
        error: 'Email verification failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}
