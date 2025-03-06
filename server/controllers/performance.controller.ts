
import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

/**
 * Middleware to track request performance metrics
 */
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl } = req;
  
  // Measure response time and log after response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    // Log performance data
    logger.info(`PERF ${method} ${originalUrl} ${status} ${duration}ms`);
    
    // Log slow requests (>500ms) as warnings
    if (duration > 500) {
      logger.warn(`SLOW REQUEST ${method} ${originalUrl} ${status} ${duration}ms`);
    }
  });
  
  next();
};

/**
 * Collect basic memory usage statistics
 */
export const memoryUsageMonitor = () => {
  const memoryUsage = process.memoryUsage();
  
  // Convert to MB for readability
  const formatMemoryUsage = (data: number) => 
    `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
  
  const memoryData = {
    rss: formatMemoryUsage(memoryUsage.rss), // Resident Set Size - total memory allocated
    heapTotal: formatMemoryUsage(memoryUsage.heapTotal), // Total size of allocated heap
    heapUsed: formatMemoryUsage(memoryUsage.heapUsed), // Actual memory used
    external: formatMemoryUsage(memoryUsage.external || 0), // Memory used by C++ objects
  };
  
  return memoryData;
};

/**
 * Endpoint to get server health metrics
 */
export const getHealthMetrics = (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memoryUsage = memoryUsageMonitor();
  
  res.json({
    status: 'UP',
    uptime: `${Math.floor(uptime / 60 / 60)} hours, ${Math.floor(uptime / 60) % 60} minutes, ${Math.floor(uptime) % 60} seconds`,
    memory: memoryUsage,
    timestamp: new Date().toISOString()
  });
};
