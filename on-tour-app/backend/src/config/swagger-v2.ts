import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'On Tour App Backend API',
      version: '2.0.0',
      description: `
        Comprehensive REST API for managing tours, shows, finance, travel, flight bookings, and payments.
        
        ### Features
        - **Shows Management**: Create, list, update, delete, and search shows
        - **Finance Tracking**: Income/expense management with settlements
        - **Travel Planning**: Itinerary and travel schedule management
        - **Flight Integration**: Amadeus flight search, booking, and status tracking
        - **Payment Processing**: Stripe payment intent, confirmation, refunds
        - **Email Notifications**: Template-based email system for confirmations and alerts
        
        ### Authentication
        All endpoints require JWT Bearer token authentication (except health check).
        Get a token from your authentication service.
      `,
      contact: {
        name: 'On Tour App Team',
        email: 'api@ontourapp.com',
        url: 'https://ontourapp.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
        variables: {
          protocol: {
            default: 'http',
          },
        },
      },
      {
        url: process.env.API_URL || 'https://api.ontourapp.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token. Format: "Authorization: Bearer <token>"',
        },
      },
      schemas: {
        // ============ SHOWS ============
        Show: {
          type: 'object',
          required: ['id', 'title', 'status', 'startDate', 'endDate', 'type', 'location', 'capacity', 'budget', 'currency'],
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier' },
            title: { type: 'string', description: 'Show title' },
            description: { type: 'string', description: 'Show description' },
            status: {
              type: 'string',
              enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'],
              description: 'Show status',
            },
            startDate: { type: 'string', format: 'date-time', description: 'Show start date' },
            endDate: { type: 'string', format: 'date-time', description: 'Show end date' },
            type: {
              type: 'string',
              description: 'Show type',
              example: 'concert, festival, conference, workshop, seminar, expo, gala, retreat',
            },
            location: { type: 'string', description: 'Show location (city, venue)' },
            capacity: { type: 'integer', minimum: 0, description: 'Expected attendance' },
            budget: { type: 'number', format: 'decimal', description: 'Total budget' },
            currency: { type: 'string', default: 'USD', description: 'Currency code' },
            organizationId: { type: 'string', format: 'uuid', description: 'Organization ID' },
            createdBy: { type: 'string', format: 'uuid', description: 'Creator user ID' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ============ FINANCE ============
        FinanceRecord: {
          type: 'object',
          required: ['id', 'showId', 'category', 'amount', 'currency', 'type', 'status', 'transactionDate'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            showId: { type: 'string', format: 'uuid', description: 'Associated show ID' },
            category: {
              type: 'string',
              description: 'Finance category',
              example: 'Artist Fees, Venue Rental, Marketing, Staffing, Catering',
            },
            amount: { type: 'number', format: 'decimal', minimum: 0 },
            currency: { type: 'string', default: 'USD' },
            type: {
              type: 'string',
              enum: ['income', 'expense'],
              description: 'Record type',
            },
            description: { type: 'string' },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
            },
            transactionDate: { type: 'string', format: 'date' },
            approvedBy: { type: 'string', format: 'uuid', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        FinanceReport: {
          type: 'object',
          properties: {
            showId: { type: 'string', format: 'uuid' },
            totalIncome: { type: 'number', format: 'decimal' },
            totalExpenses: { type: 'number', format: 'decimal' },
            netProfit: { type: 'number', format: 'decimal' },
            feesCharged: { type: 'number', format: 'decimal' },
            profitAfterFees: { type: 'number', format: 'decimal' },
            recordCount: { type: 'integer' },
            approvedCount: { type: 'integer' },
            pendingCount: { type: 'integer' },
            currency: { type: 'string' },
          },
        },

        Settlement: {
          type: 'object',
          required: ['id', 'name', 'settlementDate', 'totalAmount', 'currency', 'status', 'organizationId'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', description: 'Settlement name (e.g., Q2 2025 Settlement)' },
            settlementDate: { type: 'string', format: 'date' },
            totalAmount: { type: 'number', format: 'decimal', description: 'Total settlement amount' },
            currency: { type: 'string', default: 'USD' },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'failed'],
            },
            notes: { type: 'string' },
            organizationId: { type: 'string', format: 'uuid' },
            bankAccountNumber: { type: 'string', description: 'Masked account number' },
            bankRoutingNumber: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ============ TRAVEL ============
        Itinerary: {
          type: 'object',
          required: ['id', 'showId', 'title', 'startDate', 'endDate', 'destination', 'numberOfDays'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            showId: { type: 'string', format: 'uuid' },
            title: { type: 'string', description: 'Itinerary title' },
            description: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            destination: { type: 'string', description: 'Travel destination' },
            activities: {
              type: 'string',
              description: 'JSON stringified array of activities',
              example: '["Travel", "Hotel Check-in", "Sound Check"]',
            },
            status: {
              type: 'string',
              enum: ['draft', 'confirmed', 'in_progress', 'completed', 'cancelled'],
            },
            numberOfDays: { type: 'integer', minimum: 1 },
            estimatedCost: { type: 'number', format: 'decimal' },
            currency: { type: 'string', default: 'USD' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ============ FLIGHTS (AMADEUS) ============
        FlightOffer: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Flight offer ID' },
            source: { type: 'string', description: 'Departure city code' },
            destination: { type: 'string', description: 'Arrival city code' },
            departureTime: { type: 'string', format: 'date-time' },
            arrivalTime: { type: 'string', format: 'date-time' },
            duration: { type: 'string', description: 'Flight duration (ISO 8601)' },
            price: {
              type: 'object',
              properties: {
                total: { type: 'string' },
                base: { type: 'string' },
                fees: { type: 'array', items: { type: 'object' } },
                grandTotal: { type: 'string' },
              },
            },
            aircraft: { type: 'string', description: 'Aircraft type code' },
            airline: { type: 'string', description: 'Airline code' },
            flightNumber: { type: 'string' },
            numberOfStops: { type: 'integer' },
          },
        },

        FlightBooking: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            flightOfferId: { type: 'string' },
            travelers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  dateOfBirth: { type: 'string', format: 'date' },
                  gender: { type: 'string', enum: ['M', 'F'] },
                },
              },
            },
            status: { type: 'string', enum: ['confirmed', 'pending', 'cancelled'] },
            bookingReference: { type: 'string' },
            totalPrice: { type: 'number', format: 'decimal' },
            currency: { type: 'string' },
          },
        },

        // ============ PAYMENTS (STRIPE) ============
        PaymentIntent: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Payment Intent ID' },
            amount: { type: 'integer', description: 'Amount in cents' },
            currency: { type: 'string' },
            status: {
              type: 'string',
              enum: ['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'succeeded', 'canceled'],
            },
            clientSecret: { type: 'string', description: 'Client secret for frontend' },
            description: { type: 'string' },
            customer: { type: 'string' },
            metadata: { type: 'object' },
          },
        },

        Transfer: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Transfer ID' },
            amount: { type: 'integer', description: 'Amount in cents' },
            currency: { type: 'string' },
            destination: { type: 'string', description: 'Destination account' },
            status: {
              type: 'string',
              enum: ['pending', 'in_transit', 'paid', 'failed', 'canceled'],
            },
            description: { type: 'string' },
            sourceTransaction: { type: 'string' },
          },
        },

        Refund: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            paymentIntentId: { type: 'string' },
            amount: { type: 'integer', description: 'Amount in cents' },
            reason: { type: 'string', enum: ['requested_by_customer', 'duplicate', 'fraudulent', 'general'] },
            status: { type: 'string', enum: ['succeeded', 'failed', 'pending'] },
            created: { type: 'string', format: 'date-time' },
          },
        },

        // ============ EMAILS ============
        EmailRequest: {
          type: 'object',
          required: ['to', 'subject'],
          properties: {
            to: { type: 'string', format: 'email', description: 'Recipient email' },
            subject: { type: 'string' },
            html: { type: 'string', description: 'HTML body' },
            text: { type: 'string', description: 'Plain text body' },
            cc: { type: 'array', items: { type: 'string', format: 'email' } },
            bcc: { type: 'array', items: { type: 'string', format: 'email' } },
            replyTo: { type: 'string', format: 'email' },
          },
        },

        // ============ COMMON ============
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Error type' },
            message: { type: 'string', description: 'Error message' },
            statusCode: { type: 'integer', description: 'HTTP status code' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },

        ValidationError: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Validation failed' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
            statusCode: { type: 'integer', example: 400 },
          },
        },

        PaginatedResponse: {
          type: 'object',
          properties: {
            data: { type: 'array' },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            hasMore: { type: 'boolean' },
          },
        },

        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', format: 'date-time' },
            database: { type: 'string', enum: ['connected', 'disconnected'] },
          },
        },
      },

      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                error: 'Unauthorized',
                message: 'Missing or invalid authentication token',
                statusCode: 401,
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                error: 'Not Found',
                message: 'Show not found',
                statusCode: 404,
              },
            },
          },
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                error: 'Internal Server Error',
                message: 'An unexpected error occurred',
                statusCode: 500,
              },
            },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],

    tags: [
      { name: 'Health', description: 'Health and status checks' },
      { name: 'Shows', description: 'Show management (list, create, update, delete, search, statistics)' },
      { name: 'Finance', description: 'Financial tracking (income/expense, reports, settlements)' },
      { name: 'Travel', description: 'Travel planning and itineraries' },
      { name: 'Flights', description: 'Flight search, booking, and status (Amadeus integration)' },
      { name: 'Payments', description: 'Payment processing and refunds (Stripe integration)' },
      { name: 'Emails', description: 'Email notifications and communications' },
    ],
  },

  apis: [
    './src/routes/shows.ts',
    './src/routes/finance.ts',
    './src/routes/travel.ts',
    './src/routes/amadeus.ts',
    './src/routes/stripe.ts',
    './src/routes/email.ts',
  ],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
    } as any)
  );

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  app.get('/api-docs.yaml', (req, res) => {
    res.setHeader('Content-Type', 'application/yaml');
    res.send(JSON.stringify(specs));
  });
}
