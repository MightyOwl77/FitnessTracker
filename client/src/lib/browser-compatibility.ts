/**
 * Browser compatibility utilities for handling cross-browser inconsistencies
 */

/**
 * Safely access localStorage with fallback
 * Handles cases where localStorage is disabled or unavailable
 */
export function safeLocalStorage() {
  const memoryStorage: Record<string, string> = {};
  
  try {
    // Test if localStorage is available
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    
    return {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: (key: string) => localStorage.removeItem(key)
    };
  } catch (e) {
    // Fallback to in-memory storage if localStorage is unavailable
    console.warn('localStorage is not available, using in-memory storage instead.');
    return {
      getItem: (key: string) => memoryStorage[key] || null,
      setItem: (key: string, value: string) => { memoryStorage[key] = value; },
      removeItem: (key: string) => { delete memoryStorage[key]; }
    };
  }
}

/**
 * Consistent date formatting across browsers
 * @param date The date to format
 * @param format The format style to use
 */
export function formatDateConsistently(date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  // Using Intl.DateTimeFormat for consistent cross-browser formatting
  const options: Intl.DateTimeFormatOptions = 
    format === 'short' ? { month: 'numeric', day: 'numeric', year: '2-digit' } :
    format === 'long' ? { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' } :
    { month: 'short', day: 'numeric', year: 'numeric' };
  
  try {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (e) {
    // Fallback in case of issues with Intl
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
}

/**
 * Safely parse a date string in a cross-browser compatible way
 * @param dateString The date string to parse
 */
export function parseDateSafely(dateString: string): Date | null {
  if (!dateString) return null;
  
  // Try standard Date parsing first
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Fallback parsing for common date formats if the standard parsing fails
  const formats = [
    // MM/DD/YYYY or MM-DD-YYYY
    {
      regex: /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/,
      parse: (matches: RegExpMatchArray) => new Date(
        parseInt(matches[3], 10),
        parseInt(matches[1], 10) - 1,
        parseInt(matches[2], 10)
      )
    },
    // YYYY/MM/DD or YYYY-MM-DD
    {
      regex: /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/,
      parse: (matches: RegExpMatchArray) => new Date(
        parseInt(matches[1], 10),
        parseInt(matches[2], 10) - 1, 
        parseInt(matches[3], 10)
      )
    }
  ];
  
  for (const format of formats) {
    const matches = dateString.match(format.regex);
    if (matches) {
      const parsedDate = format.parse(matches);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
  }
  
  return null;
}

/**
 * Feature detection for browser capabilities
 * Use this to gracefully handle feature availability
 */
export const browserFeatures = {
  supportsLocalStorage: (function() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  })(),
  
  supportsTouch: (function() {
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 ||
           (navigator as any).msMaxTouchPoints > 0;
  })(),
  
  supportsInputType: function(type: string): boolean {
    const input = document.createElement('input');
    input.setAttribute('type', type);
    return input.type === type;
  },
  
  // Check for passive event listener support
  supportsPassiveEvents: (function() {
    let supportsPassive = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: function() {
          supportsPassive = true;
          return true;
        }
      });
      window.addEventListener('test', null as any, opts);
      window.removeEventListener('test', null as any, opts);
    } catch (e) {}
    return supportsPassive;
  })(),
  
  // Check for IntersectionObserver support
  supportsIntersectionObserver: 'IntersectionObserver' in window
};