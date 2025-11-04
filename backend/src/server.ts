import 'dotenv/config';
import app from './app.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3001;

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                  🎵 ON TOUR BACKEND v1.0.0              ║
╠═══════════════════════════════════════════════════════════╣
║  Status: Starting...                                      ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(44)}║
║  Port: ${PORT.toString().padEnd(52)}║
╚═══════════════════════════════════════════════════════════╝
`);

const server = app.listen(PORT, () => {
  logger.info(`✅ Server running on http://localhost:${PORT}`);
  logger.info(`📊 API Health: http://localhost:${PORT}/health`);
  logger.info(`� Routes available:`);
  logger.info(`   - POST /api/auth/login`);
  logger.info(`   - GET  /api/shows`);
  logger.info(`   - POST /api/shows`);
  logger.info(`   - GET  /api/finance/overview`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default server;
