/**
 * Optimized browser storage utility with throttling and batching
 */
import { debounce } from '@/lib/utils';

type StorageType = 'localStorage' | 'sessionStorage';

// Track pending operations to allow batching
const pendingOperations: Record<string, boolean> = {};

// Cleanup interval in milliseconds
const CLEANUP_INTERVAL = 60_000; // 1 minute

/**
 * Throttled storage setter - prevents excessive storage operations
 */
const throttledSet = debounce((storageType: StorageType, key: string, value: string) => {
  try {
    window[storageType].setItem(key, value);
  } catch (error) {
    console.error(`Failed to save to ${storageType}:`, error);
  }
  delete pendingOperations[`${storageType}:${key}`];
}, 500);

/**
 * Enhanced storage manager with operation batching and error handling
 */
export const storageManager = {
  /**
   * Set a value in storage with throttling
   */
  setItem: (key: string, value: any, storage: StorageType = 'localStorage') => {
    const operationKey = `${storage}:${key}`;
    pendingOperations[operationKey] = true;
    throttledSet(storage, key, JSON.stringify(value));
  },

  /**
   * Get a value from storage with error handling
   */
  getItem: <T>(key: string, storage: StorageType = 'localStorage', defaultValue: T | null = null): T | null => {
    try {
      const value = window[storage].getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error(`Failed to retrieve from ${storage}:`, error);
      return defaultValue;
    }
  },

  /**
   * Remove an item from storage
   */
  removeItem: (key: string, storage: StorageType = 'localStorage') => {
    try {
      window[storage].removeItem(key);
    } catch (error) {
      console.error(`Failed to remove from ${storage}:`, error);
    }
  },

  /**
   * Clear storage selectively based on prefix (safer than clearing everything)
   */
  clearItems: (prefixFilter: string = '', storage: StorageType = 'localStorage') => {
    try {
      if (!prefixFilter) {
        // Only log instead of actually clearing all storage
        console.log(`Attempted to clear all ${storage} - using selective clearing instead`);
        return;
      }

      const keysToRemove: string[] = [];

      for (let i = 0; i < window[storage].length; i++) {
        const key = window[storage].key(i);
        if (key && key.startsWith(prefixFilter)) {
          keysToRemove.push(key);
        }
      }

      // Remove keys in batch
      keysToRemove.forEach(key => window[storage].removeItem(key));
      console.log(`Cleared ${keysToRemove.length} items with prefix "${prefixFilter}" from ${storage}`);
    } catch (error) {
      console.error(`Failed to clear ${storage}:`, error);
    }
  },

  /**
   * Init function to set up periodic cleanup
   */
  init: () => {
    // Set up periodic cleanup of old cache entries
    setInterval(() => {
      // Clean up old temporary data
      const cleanupPrefixes = ['temp:', 'cache:'];
      cleanupPrefixes.forEach(prefix => {
        storageManager.clearItems(prefix, 'localStorage');
      });
    }, CLEANUP_INTERVAL);
  }
};

// Keep track of last clear time
let lastClearTime = 0;
const CLEAR_INTERVAL = 1000 * 60 * 15; // 15 minutes

export const clearBrowserStorage = (force = false) => {
  const now = Date.now();

  // Only clear if forced or if enough time has passed since last clear
  if (force || now - lastClearTime > CLEAR_INTERVAL) {
    console.log(force ? "Forced clearing browser storage..." : "Clearing browser storage...");
    try {
      // Only clear non-essential items
      const essentialKeys = ['user_token', 'profile_data', 'current_goals'];

      // For localStorage
      Object.keys(localStorage).forEach(key => {
        if (!essentialKeys.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // For sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (!essentialKeys.includes(key)) {
          sessionStorage.removeItem(key);
        }
      });

      lastClearTime = now;
      console.log("Browser storage cleared successfully!");
    } catch (error) {
      console.error("Error clearing browser storage:", error);
    }
  }
};