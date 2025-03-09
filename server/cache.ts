
import NodeCache from 'node-cache';

// Create a cache with standard TTL of 5 minutes (300 seconds)
export const cache = new NodeCache({ 
  stdTTL: 300,
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Store and retrieve references instead of cloning objects
});

// Cache keys format helpers
export const cacheKeys = {
  profile: (userId: number) => `profile:${userId}`,
  goal: (userId: number) => `goal:${userId}`,
  logs: (userId: number) => `logs:${userId}`,
  logByDate: (userId: number, date: Date) => `log:${userId}:${date.toISOString().split('T')[0]}`,
  stats: (userId: number) => `stats:${userId}`,
  statByDate: (userId: number, date: Date) => `stat:${userId}:${date.toISOString().split('T')[0]}`
};

// Clear all cache for a specific user
export function clearUserCache(userId: number): void {
  const keysToDelete = [
    cacheKeys.profile(userId),
    cacheKeys.goal(userId),
    cacheKeys.logs(userId)
  ];
  
  // Also clear any stats/logs by date
  const allKeys = cache.keys();
  const userSpecificKeys = allKeys.filter(key => 
    key.startsWith(`log:${userId}:`) || 
    key.startsWith(`stat:${userId}:`)
  );
  
  // Combine all keys and delete them
  [...keysToDelete, ...userSpecificKeys].forEach(key => cache.del(key));
}
