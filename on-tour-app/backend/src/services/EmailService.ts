import { Logger } from 'pino';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
  }>;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export interface BookingConfirmationData {
  customerName: string;
  customerEmail: string;
  bookingId: string;
  flightDetails: {
    origin: string;
    destination: string;
    departureDate: string;
    departureTime: string;
    airline: string;
    flightNumber: string;
    totalPrice: number;
    currency: string;
  };
  bookingReference: string;
  confirmationDate: string;
}

export interface ReminderData {
  customerName: string;
  customerEmail: string;
  showName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  bookingReference: string;
  hoursUntilEvent: number;
}

export interface InvoiceData {
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  companyName?: string;
  companyAddress?: string;
}

export interface SettlementReportData {
  artistName: string;
  artistEmail: string;
  reportPeriod: string;
  totalEarnings: number;
  totalShows: number;
  averageEarningPerShow: number;
  currency: string;
  shows: Array<{
    name: string;
    date: string;
    earnings: number;
  }>;
  reportDate: string;
}

export interface AlertData {
  recipientName: string;
  recipientEmail: string;
  alertType: string;
  alertMessage: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  actionUrl?: string;
  actionButtonText?: string;
  timestamp: string;
}

export class EmailService {
  private transporter: Transporter;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(
    private logger: Logger,
    smtpConfig?: {
      host: string;
      port: number;
      secure: boolean;
      auth: { user: string; pass: string };
    }
  ) {
    this.fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@ontourapp.com';
    this.fromName = process.env.SMTP_FROM_NAME || 'On Tour App';

    if (smtpConfig) {
      this.transporter = nodemailer.createTransport(smtpConfig);
    } else if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Mock transporter for testing
      this.transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        ignoreTLS: true,
      });
    }
  }

  /**
   * Send a generic email
   */
  async sendEmail(request: EmailRequest): Promise<string> {
    try {
      const mailOptions: SendMailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: Array.isArray(request.to) ? request.to.join(',') : request.to,
        subject: request.subject,
        html: request.html,
        text: request.text,
      };

      if (request.cc) {
        mailOptions.cc = Array.isArray(request.cc) ? request.cc.join(',') : request.cc;
      }

      if (request.bcc) {
        mailOptions.bcc = Array.isArray(request.bcc) ? request.bcc.join(',') : request.bcc;
      }

      if (request.replyTo) {
        mailOptions.replyTo = request.replyTo;
      }

      if (request.attachments) {
        mailOptions.attachments = request.attachments;
      }

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.info(
        {
          messageId: info.messageId,
          to: request.to,
          subject: request.subject,
        },
        'Email sent'
      );

      return info.messageId || 'mock-message-id';
    } catch (error) {
      this.logger.error({ request, error }, 'Email sending failed');
      throw new Error(`Email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(data: BookingConfirmationData): Promise<string> {
    const html = this.generateBookingConfirmationTemplate(data);

    return this.sendEmail({
      to: data.customerEmail,
      subject: `Booking Confirmation - ${data.flightDetails.airline} ${data.flightDetails.flightNumber}`,
      html,
      text: `Your booking ${data.bookingReference} has been confirmed.`,
    });
  }

  /**
   * Send event reminder
   */
  async sendEventReminder(data: ReminderData): Promise<string> {
    const html = this.generateReminderTemplate(data);

    return this.sendEmail({
      to: data.customerEmail,
      subject: `Reminder: ${data.showName} is coming up in ${data.hoursUntilEvent} hours!`,
      html,
      text: `Don't forget! ${data.showName} is happening on ${data.eventDate} at ${data.eventTime}.`,
    });
  }

  /**
   * Send invoice email
   */
  async sendInvoice(data: InvoiceData): Promise<string> {
    const html = this.generateInvoiceTemplate(data);

    return this.sendEmail({
      to: data.customerEmail,
      subject: `Invoice ${data.invoiceNumber} - ${data.companyName || 'On Tour App'}`,
      html,
      text: `Invoice ${data.invoiceNumber} for ${data.total} ${data.currency}.`,
    });
  }

  /**
   * Send settlement report
   */
  async sendSettlementReport(data: SettlementReportData): Promise<string> {
    const html = this.generateSettlementReportTemplate(data);

    return this.sendEmail({
      to: data.artistEmail,
      subject: `Settlement Report - ${data.reportPeriod}`,
      html,
      text: `Your settlement report for ${data.reportPeriod} shows ${data.totalEarnings} ${data.currency}.`,
    });
  }

  /**
   * Send alert email
   */
  async sendAlert(data: AlertData): Promise<string> {
    const html = this.generateAlertTemplate(data);
    const urgencyLabel = data.urgency.charAt(0).toUpperCase() + data.urgency.slice(1);

    return this.sendEmail({
      to: data.recipientEmail,
      subject: `[${urgencyLabel}] ${data.alertType} - ${data.alertMessage}`,
      html,
      text: data.alertMessage,
    });
  }

  /**
   * Generate booking confirmation HTML template
   */
  private generateBookingConfirmationTemplate(data: BookingConfirmationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
            .content { background: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }
            .flight-info { background: white; padding: 15px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmation</h1>
              <p>Thank you, ${data.customerName}!</p>
            </div>

            <div class="content">
              <p>Your booking has been confirmed. Here are your flight details:</p>

              <div class="flight-info">
                <div class="detail-row">
                  <strong>Flight Number:</strong>
                  <span>${data.flightDetails.airline} ${data.flightDetails.flightNumber}</span>
                </div>
                <div class="detail-row">
                  <strong>Route:</strong>
                  <span>${data.flightDetails.origin} → ${data.flightDetails.destination}</span>
                </div>
                <div class="detail-row">
                  <strong>Departure:</strong>
                  <span>${data.flightDetails.departureDate} at ${data.flightDetails.departureTime}</span>
                </div>
                <div class="detail-row">
                  <strong>Total Price:</strong>
                  <span>${data.flightDetails.currency} ${data.flightDetails.totalPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                  <strong>Booking Reference:</strong>
                  <span><strong>${data.bookingReference}</strong></span>
                </div>
              </div>

              <p>Please save your booking reference for check-in. You should receive your boarding pass via email 24 hours before departure.</p>

              <center>
                <a href="https://ontourapp.com/bookings/${data.bookingId}" class="button">View Booking Details</a>
              </center>
            </div>

            <div class="footer">
              <p>Confirmed on ${data.confirmationDate}</p>
              <p>&copy; 2025 On Tour App. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate reminder HTML template
   */
  private generateReminderTemplate(data: ReminderData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px; }
            .content { background: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #f5576c; }
            .event-details { background: white; padding: 15px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
            .button { display: inline-block; background: #f5576c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Event Reminder</h1>
            </div>

            <div class="content">
              <h2>Don't forget, ${data.customerName}!</h2>
              <p><strong>${data.showName}</strong> is coming up in <strong>${data.hoursUntilEvent} hours</strong>!</p>

              <div class="event-details">
                <p><strong>Date:</strong> ${data.eventDate}</p>
                <p><strong>Time:</strong> ${data.eventTime}</p>
                <p><strong>Venue:</strong> ${data.venue}</p>
                <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
              </div>

              <p>Make sure you have your booking confirmation handy. We're excited to see you there!</p>

              <center>
                <a href="https://ontourapp.com/events/${data.bookingReference}" class="button">View Event</a>
              </center>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate invoice HTML template
   */
  private generateInvoiceTemplate(data: InvoiceData): string {
    const itemsHtml = data.items
      .map(
        (item) =>
          `
      <tr>
        <td>${item.description}</td>
        <td style="text-align: right;">${item.quantity}</td>
        <td style="text-align: right;">${data.currency} ${item.unitPrice.toFixed(2)}</td>
        <td style="text-align: right;">${data.currency} ${item.total.toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { margin-bottom: 30px; }
            .invoice-title { font-size: 24px; font-weight: bold; margin: 10px 0; }
            .company-info { font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #333; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            .totals { margin: 20px 0; }
            .total-row { display: flex; justify-content: flex-end; padding: 8px 0; }
            .final-total { font-size: 18px; font-weight: bold; background: #f0f0f0; padding: 15px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="invoice-title">INVOICE</div>
              <p><strong>Invoice #:</strong> ${data.invoiceNumber}</p>
              <p><strong>Invoice Date:</strong> ${data.invoiceDate}</p>
              <p><strong>Due Date:</strong> ${data.dueDate}</p>
              ${data.companyName ? `<div class="company-info"><p>${data.companyName}</p>${data.companyAddress ? `<p>${data.companyAddress}</p>` : ''}</div>` : ''}
            </div>

            <div>
              <h3>Bill To:</h3>
              <p>${data.customerName}</p>
              <p>${data.customerEmail}</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row">
                <span>Subtotal: ${data.currency} ${data.subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Tax: ${data.currency} ${data.tax.toFixed(2)}</span>
              </div>
              <div class="final-total">
                TOTAL: ${data.currency} ${data.total.toFixed(2)}
              </div>
            </div>

            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
              &copy; 2025 On Tour App. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate settlement report HTML template
   */
  private generateSettlementReportTemplate(data: SettlementReportData): string {
    const showsHtml = data.shows
      .map(
        (show) =>
          `
      <tr>
        <td>${show.name}</td>
        <td>${show.date}</td>
        <td style="text-align: right;">${data.currency} ${show.earnings.toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
            .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-box { background: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
            .stat-label { font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #333; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Settlement Report</h1>
              <p>Period: ${data.reportPeriod}</p>
            </div>

            <div class="stats">
              <div class="stat-box">
                <div class="stat-value">${data.currency} ${data.totalEarnings.toFixed(2)}</div>
                <div class="stat-label">Total Earnings</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${data.totalShows}</div>
                <div class="stat-label">Shows</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${data.currency} ${data.averageEarningPerShow.toFixed(2)}</div>
                <div class="stat-label">Avg Per Show</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${data.reportDate}</div>
                <div class="stat-label">Report Date</div>
              </div>
            </div>

            <h3>Show Details:</h3>
            <table>
              <thead>
                <tr>
                  <th>Show Name</th>
                  <th>Date</th>
                  <th style="text-align: right;">Earnings</th>
                </tr>
              </thead>
              <tbody>
                ${showsHtml}
              </tbody>
            </table>

            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
              This is an automated report. Please contact support if you have any questions.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate alert HTML template
   */
  private generateAlertTemplate(data: AlertData): string {
    const urgencyColor = {
      low: '#4CAF50',
      medium: '#FFC107',
      high: '#FF5722',
      critical: '#9C27B0',
    }[data.urgency];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${urgencyColor}; color: white; padding: 20px; border-radius: 8px; }
            .content { background: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid ${urgencyColor}; }
            .button { display: inline-block; background: ${urgencyColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .urgency-badge { display: inline-block; background: ${urgencyColor}; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Alert Notification</h1>
              <span class="urgency-badge">${data.urgency.toUpperCase()}</span>
            </div>

            <div class="content">
              <p>Hi ${data.recipientName},</p>
              <p><strong>${data.alertType}:</strong> ${data.alertMessage}</p>

              ${data.actionRequired && data.actionUrl ? `
                <p>Action required. Please click the button below:</p>
                <center>
                  <a href="${data.actionUrl}" class="button">${data.actionButtonText || 'Take Action'}</a>
                </center>
              ` : ''}

              <p style="font-size: 12px; color: #999;">
                Timestamp: ${data.timestamp}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Verify transporter connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.info('Email transporter verified');
      return true;
    } catch (error) {
      this.logger.error({ error }, 'Email transporter verification failed');
      return false;
    }
  }
}
