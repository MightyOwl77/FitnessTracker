
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

// Create a logger with daily rotation
export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  defaultMeta: { service: 'fitness-app' },
  transports: [
    // Write all logs to rotating files
    new transports.DailyRotateFile({
      filename: 'logs/%DATE%-error.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new transports.DailyRotateFile({
      filename: 'logs/%DATE%-combined.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

// Rate limiter for API endpoints
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

// Speed limiter to gradually slow down repeat requests
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes without delay
  delayMs: (hits) => hits * 100, // add 100ms of delay per hit
});

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const path = req.path;
  
  // Clone response json method to capture response data
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    
    // Log API requests
    if (path.startsWith('/api')) {
      logger.info({
        method,
        path,
        statusCode,
        duration,
        ip: req.ip
      });
      
      // Log errors separately
      if (statusCode >= 400) {
        logger.error({
          method,
          path,
          statusCode,
          duration,
          ip: req.ip,
          body: typeof body === 'object' ? body : { message: body }
        });
      }
    }
    
    return originalJson.call(res, body);
  };
  
  next();
}

// Error handling middleware
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error
  logger.error({
    method: req.method,
    path: req.path,
    statusCode,
    error: err.stack || err,
    ip: req.ip
  });
  
  res.status(statusCode).json({ message });
}
