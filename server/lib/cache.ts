
import NodeCache from 'node-cache';

// Configure cache with standard TTL of 5 minutes
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes in seconds
  checkperiod: 60 // Check for expired keys every minute
});

/**
 * Generic cache middleware for Express routes
 * @param key Function to generate cache key from request
 * @param ttl Time to live in seconds (optional)
 */
export const cacheMiddleware = (
  keyFn: (req: any) => string,
  ttl?: number
) => {
  return (req: any, res: any, next: any) => {
    const key = keyFn(req);
    const cachedData = cache.get(key);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to cache the response
    res.json = function(data: any) {
      // Cache the data
      cache.set(key, data, ttl);
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Invalidate cache by key pattern
 * @param pattern String pattern to match keys
 */
export const invalidateCache = (pattern: string) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  cache.del(matchingKeys);
};

export default cache;
