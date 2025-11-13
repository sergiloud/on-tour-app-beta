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
import { calendarSyncRouter } from './routes/calendarSync.js';
import auditRouter from './routes/audit.js';
import organizationsRouter from './routes/organizations.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { generalRateLimit } from './middleware/rateLimiting.js';
import { logger } from './utils/logger.js';
import { webSocketService } from './services/WebSocketService.js';
import { initializeFirebaseAdmin } from './config/firebase.js';
import { startCalendarSyncWorker } from './workers/calendarSyncWorker.js';

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

// Initialize Firebase Admin
function initializeFirebase() {
  try {
    const initialized = initializeFirebaseAdmin();
    if (initialized) {
      logger.info('🔥 Firebase Admin initialized successfully');
    } else {
      logger.warn('⚠️  Firebase Admin not configured - authentication features disabled');
    }
  } catch (error) {
    logger.error('❌ Firebase Admin initialization failed:', error);
    // No exit - la app puede funcionar sin Firebase en modo demo
  }
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Security: Rate limiting global (antes de las rutas)
app.use(generalRateLimit);

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
// Authentication routes (sin authMiddleware - manejan su propia autenticación)
app.use('/api/auth', authRouter);

// User management with Firebase Auth + Firestore
app.use('/api/users', usersRouter);

// Protected routes (requieren autenticación)
app.use('/api/organizations', organizationsRouter);
app.use('/api/shows', authMiddleware, showsRouter);
app.use('/api/finance', authMiddleware, financeRouter);
app.use('/api/travel', authMiddleware, travelRouter);
app.use('/api/audit', authMiddleware, auditRouter);

// External service routes
app.use('/api/amadeus', createAmadeusRouter(logger));
app.use('/api/stripe', createStripeRouter(logger));
app.use('/api/email', createEmailRouter(logger));
app.use('/api/realtime', createRealtimeRouter());
app.use('/api/calendar-sync', authMiddleware, calendarSyncRouter);

// Security: Handle 404 errors (antes del error handler)
app.use(notFoundHandler);

// Error handling global (DEBE SER EL ÚLTIMO MIDDLEWARE)
app.use(errorHandler);

// Start server
async function start() {
  // Initialize services
  await initializeDatabase();
  initializeFirebase();
  
  // Start background workers
  startCalendarSyncWorker();

  server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`🔌 WebSocket server ready for connections`);
    logger.info(`🔥 Firebase Auth integration active`);
    logger.info(`📚 API Docs available at http://localhost:${PORT}/api-docs`);
  });
}

start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
