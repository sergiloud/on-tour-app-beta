import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import pinoHttp from 'pino-http';
import { AppDataSource } from './database/datasource.js';
import { setupSwagger } from './config/swagger.js';
import { showsRouter } from './routes/shows.js';
import { financeRouter } from './routes/finance.js';
import { travelRouter } from './routes/travel.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

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

// Error handling
app.use(errorHandler);

// Start server
async function start() {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
  });
}

start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
