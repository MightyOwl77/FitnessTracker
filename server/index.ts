import express from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { AuthRequest } from "./auth";
import { apiRateLimiter, speedLimiter, requestLogger, errorHandler, logger } from "./middleware";
import { db } from "./db";

const app = express();

// Enable trust proxy to properly handle X-Forwarded-For headers in Replit environment
app.set('trust proxy', true);

// Temporarily disable helmet to debug the frontend issues
// app.use(helmet());

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Apply rate limiting to all API requests
app.use('/api', apiRateLimiter);
app.use('/api', speedLimiter);

// Request logging middleware
app.use(requestLogger);

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple healthcheck for reconnection
app.get('/api/healthcheck', (req, res) => {
  res.status(200).end();
});

// Ping endpoint for connection checks
app.get('/api/ping', (req, res) => {
  res.status(200).end();
});

// Test database connection on startup
(async () => {
  try {
    // Check DB connection if we're using a real database
    if (process.env.DATABASE_URL) {
      await db.execute('SELECT 1');
      logger.info('Database connection successful');
    }
  } catch (error) {
    logger.error('Database connection failed:', error);
  }
})();

(async () => {
  const server = await registerRoutes(app);

  // Error handling middleware (must be last)
  app.use(errorHandler);
  
  // Global unhandled promise rejection handler
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
  // Global uncaught exception handler
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    // Give the logger some time to flush before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
    keepAliveTimeout: 65000, // Increase timeout for better connection stability
    connectionsCheckingInterval: 30000, // Check connections more frequently
  }, () => {
    log(`serving on port ${port}`);
  });

  // Handle graceful shutdown
  const signals = ['SIGINT', 'SIGTERM'] as const;
  signals.forEach((signal) => {
    process.on(signal, () => {
      log(`${signal} received, shutting down gracefully`);
      server.close(() => {
        log('HTTP server closed');
        process.exit(0);
      });
    });
  });
})();
