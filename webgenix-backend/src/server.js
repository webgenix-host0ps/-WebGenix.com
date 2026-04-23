import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import logger from './utils/logger.js';

const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(env.PORT, () => {
            logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
        });

        // Graceful shutdown
        const shutdown = async () => {
            logger.info('Shutting down gracefully...');
            server.close(async () => {
                logger.info('HTTP server closed');
                process.exit(0);
            });

            // Force close after 30s
            setTimeout(() => {
                logger.error('Forced shutdown');
                process.exit(1);
            }, 30000);
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();