import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'On Tour App Backend API',
      version: '1.0.0',
      description: 'Comprehensive REST API for managing tours, shows, finance, and travel',
      contact: {
        name: 'On Tour App Team',
        email: 'api@ontourapp.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
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
          description: 'JWT token obtained from authentication endpoint',
        },
      },
      schemas: {
        Show: {
          type: 'object',
          required: [
            'id',
            'title',
            'status',
            'startDate',
            'endDate',
            'type',
            'location',
            'capacity',
            'budget',
            'currency',
          ],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier',
            },
            title: {
              type: 'string',
              description: 'Show title',
            },
            description: {
              type: 'string',
              description: 'Show description',
            },
            status: {
              type: 'string',
              enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'],
            },
            startDate: {
              type: 'string',
              format: 'date-time',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
            },
            type: {
              type: 'string',
              description: 'Show type (concert, festival, conference, etc)',
            },
            location: {
              type: 'string',
            },
            capacity: {
              type: 'integer',
              minimum: 0,
            },
            budget: {
              type: 'number',
              format: 'decimal',
            },
            currency: {
              type: 'string',
              default: 'USD',
            },
            organizationId: {
              type: 'string',
              format: 'uuid',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        FinanceRecord: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            showId: {
              type: 'string',
              format: 'uuid',
            },
            category: {
              type: 'string',
            },
            amount: {
              type: 'number',
              format: 'decimal',
            },
            currency: {
              type: 'string',
            },
            type: {
              type: 'string',
              enum: ['income', 'expense'],
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
            },
            transactionDate: {
              type: 'string',
              format: 'date',
            },
          },
        },
        Itinerary: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            showId: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
            },
            destination: {
              type: 'string',
            },
            startDate: {
              type: 'string',
              format: 'date',
            },
            endDate: {
              type: 'string',
              format: 'date',
            },
            status: {
              type: 'string',
              enum: ['draft', 'confirmed', 'completed', 'cancelled'],
            },
            estimatedCost: {
              type: 'number',
              format: 'decimal',
            },
          },
        },
        Settlement: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            settlementDate: {
              type: 'string',
              format: 'date',
            },
            totalAmount: {
              type: 'number',
              format: 'decimal',
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'failed'],
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
            statusCode: {
              type: 'integer',
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
  },
  apis: ['./src/routes/*.ts', './src/middleware/*.ts'],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(specs, { explorer: true }));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}
