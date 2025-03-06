/**
 * Browser compatibility utilities for handling cross-browser inconsistencies
 */

/**
 * Safely access localStorage with fallback
 * Handles cases where localStorage is disabled or unavailable
 */
export function safeLocalStorage() {
  const storage = {
    getItem: (key: string): string | null => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn('localStorage is not available:', error);
        return null;
      }
    },
    
    setItem: (key: string, value: string): void => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    },
    
    removeItem: (key: string): void => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to remove from localStorage:', error);
      }
    },
    
    // Test if localStorage is actually working
    isAvailable: (): boolean => {
      try {
        const testKey = '_test_localStorage_';
        localStorage.setItem(testKey, testKey);
        const result = localStorage.getItem(testKey) === testKey;
        localStorage.removeItem(testKey);
        return result;
      } catch (e) {
        return false;
      }
    }
  };
  
  return storage;
}

/**
 * Consistent date formatting across browsers
 * @param date The date to format
 * @param format The format style to use
 */
export function formatDateConsistently(date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string {
  try {
    // Use Intl API for consistent cross-browser formatting
    const options: Intl.DateTimeFormatOptions = 
      format === 'short' ? { day: 'numeric', month: 'numeric', year: 'numeric' } :
      format === 'medium' ? { day: 'numeric', month: 'short', year: 'numeric' } :
      { day: 'numeric', month: 'long', year: 'numeric' };
      
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    // Fallback to a simple format in case Intl is not supported
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
}

/**
 * Safely parse a date string in a cross-browser compatible way
 * @param dateString The date string to parse
 */
export function parseDateSafely(dateString: string): Date | null {
  // First try native Date parsing
  const parsed = new Date(dateString);
  
  // Check if the result is valid
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  // If native parsing fails, try manual parsing for common formats
  const formats = [
    // MM/DD/YYYY
    {
      regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      parse: (matches: RegExpMatchArray) => new Date(
        parseInt(matches[3]), parseInt(matches[1]) - 1, parseInt(matches[2])
      )
    },
    // YYYY-MM-DD
    {
      regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      parse: (matches: RegExpMatchArray) => new Date(
        parseInt(matches[1]), parseInt(matches[2]) - 1, parseInt(matches[3])
      )
    }
  ];
  
  for (const format of formats) {
    const matches = dateString.match(format.regex);
    if (matches) {
      const date = format.parse(matches);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  
  // If all parsing attempts fail, return null
  console.warn(`Failed to parse date string: ${dateString}`);
  return null;
}

/**
 * Feature detection for browser capabilities
 * Use this to gracefully handle feature availability
 */
export const browserFeatures = {
  // Test if the browser supports the Web Share API
  webShare: (): boolean => {
    return typeof navigator !== 'undefined' && !!navigator.share;
  },
  
  // Test if the browser supports the IndexedDB API
  indexedDb: (): boolean => {
    return typeof window !== 'undefined' && !!window.indexedDB;
  },
  
  // Test if the browser supports Service Workers
  serviceWorker: (): boolean => {
    return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  },
  
  // Test if the browser is Safari (which has various limitations)
  isSafari: (): boolean => {
    return typeof navigator !== 'undefined' && 
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  },
  
  // Test if touch is supported for better mobile experience
  touchSupported: (): boolean => {
    return typeof window !== 'undefined' && 
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }
};