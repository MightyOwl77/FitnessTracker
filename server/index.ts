import express, { type Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { tempUserData } from "@shared/schema";
import cors from "cors";
import helmet from "helmet";
import { rateLimit, sanitizeInputs } from "./controllers/security.controller";

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

// Extend Express Request type to include user property
interface Request extends express.Request {
  user?: {
    id: number;
    username: string;
  };
}

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
})); // Set secure HTTP headers with relaxed CSP for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL || 'https://bodytransform.replit.app'] // Set your production domain
    : '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Apply rate limiting to all requests (100 requests per 15 minutes)
app.use(rateLimit());

// Body parsing middleware
app.use(express.json({ limit: '1mb' })); // Limit payload size
app.use(express.urlencoded({ extended: false }));

// Input sanitization middleware
app.use(sanitizeInputs);

// Import performance monitoring
import { performanceMonitor, getHealthMetrics } from './controllers/performance.controller';
import logger from './lib/logger';

// Add performance monitoring middleware
app.use(performanceMonitor);

// Health check endpoint
app.get('/api/health', getHealthMetrics);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

import { startMonitoringTasks } from './tasks/monitor';

(async () => {
  const server = await registerRoutes(app);
  
  // Start monitoring tasks
  startMonitoringTasks();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
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
