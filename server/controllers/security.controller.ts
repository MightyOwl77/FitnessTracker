
import { Request, Response, NextFunction } from "express";
import * as validator from 'validator';

/**
 * Security middleware for input sanitization
 */
export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }
  
  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Recursively sanitize all string values in an object
 */
function sanitizeObject(obj: any) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      // Sanitize string values to prevent XSS
      obj[key] = validator.escape(obj[key]);
    } else if (obj[key] && typeof obj[key] === 'object') {
      // Recursively sanitize nested objects
      sanitizeObject(obj[key]);
    }
  });
}

/**
 * Rate limiting middleware to prevent brute force attacks
 */
const requestCounts = new Map<string, { count: number, resetTime: number }>();

export const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      const data = requestCounts.get(ip)!;
      
      // Reset counter if time window has passed
      if (now > data.resetTime) {
        data.count = 1;
        data.resetTime = now + windowMs;
      } else {
        data.count++;
      }
      
      if (data.count > maxRequests) {
        return res.status(429).json({ 
          message: 'Too many requests, please try again later.' 
        });
      }
    }
    
    next();
  };
};
