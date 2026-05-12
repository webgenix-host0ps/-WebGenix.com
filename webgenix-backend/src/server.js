import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import logger from './utils/logger.js';
import { initCrons } from './services/cron.service.js';

// Prevent crash on EPIPE (broken pipe) when client disconnects
process.on('uncaughtException', (err) => {
    if (err.code === 'EPIPE') return;
    logger.error('Uncaught exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    if (reason?.code === 'EPIPE') return;
    logger.error('Unhandled rejection:', reason);
});

const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(env.PORT, () => {
            logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
            initCrons();
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