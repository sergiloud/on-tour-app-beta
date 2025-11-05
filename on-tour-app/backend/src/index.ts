import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import pinoHttp from 'pino-http';
import http from 'http';
import { AppDataSource } from './database/datasource.js';
import { setupSwagger } from './config/swagger-v2.js';
import { showsRouter } from './routes/shows.js';
import { financeRouter } from './routes/finance.js';
import { travelRouter } from './routes/travel.js';
import { createAmadeusRouter } from './routes/amadeus.js';
import { createStripeRouter } from './routes/stripe.js';
import { createEmailRouter } from './routes/email.js';
import { createRealtimeRouter } from './routes/realtime.js';
import auditRouter from './routes/audit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { logger } from './utils/logger.js';
import { webSocketService } from './services/WebSocketService.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// Initialize database
async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    logger.info('✅ Database connected successfully');

    // Run migrations
    await AppDataSource.runMigrations();
    logger.info('✅ Migrations completed');
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Setup Swagger documentation
setupSwagger(app);

// Initialize WebSocket service
webSocketService.initialize(server);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/shows', authMiddleware, showsRouter);
app.use('/api/finance', authMiddleware, financeRouter);
app.use('/api/travel', authMiddleware, travelRouter);
app.use('/api/audit', authMiddleware, auditRouter);
app.use('/api/amadeus', createAmadeusRouter(logger));
app.use('/api/stripe', createStripeRouter(logger));
app.use('/api/email', createEmailRouter(logger));
app.use('/api/realtime', createRealtimeRouter());

// Error handling
app.use(errorHandler);

// Start server
async function start() {
  await initializeDatabase();

  server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`🔌 WebSocket server ready for connections`);
    logger.info(`📚 API Docs available at http://localhost:${PORT}/api-docs`);
  });
}

start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
