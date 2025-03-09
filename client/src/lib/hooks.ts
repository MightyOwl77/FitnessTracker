
import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce, throttle } from '@/lib/utils';

/**
 * Hook to track window dimensions with optimizations
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const handleResize = useCallback(
    debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, 200),
    []
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return windowSize;
}

/**
 * Hook to debounce a fast-changing value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for intersection observer to detect elements in viewport
 */
export function useInView(options = {}) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { ref, isInView };
}

/**
 * Hook for network status with retries
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnectionSlow, setIsConnectionSlow] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection speed periodically
    const checkConnectionSpeed = async () => {
      const startTime = Date.now();
      try {
        await fetch('/api/ping', { 
          method: 'GET',
          cache: 'no-store',
          signal: AbortSignal.timeout(5000)
        });
        const duration = Date.now() - startTime;
        setIsConnectionSlow(duration > 1000); // More than 1 second is considered slow
      } catch (e) {
        // Failed or timed out
        setIsConnectionSlow(true);
      }
    };

    const intervalId = setInterval(checkConnectionSpeed, 60000); // Check every minute

    // Initial check
    checkConnectionSpeed();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return { isOnline, isConnectionSlow };
}

/**
 * Hook for fetching data with caching and retry logic
 */
export function useFetch<T>(url: string, options?: {
  initialData?: T,
  refetchInterval?: number,
  retries?: number,
  dependencies?: any[]
}) {
  const {
    initialData,
    refetchInterval,
    retries = 2,
    dependencies = []
  } = options || {};

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWithRetry = useCallback(async (retriesLeft: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (e) {
      if (retriesLeft > 0) {
        // Wait before retrying
        await new Promise(r => setTimeout(r, 1000));
        return fetchWithRetry(retriesLeft - 1);
      }
      setError(e instanceof Error ? e : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchWithRetry(retries);
    
    let intervalId: number | undefined;
    
    if (refetchInterval) {
      intervalId = window.setInterval(() => {
        fetchWithRetry(retries);
      }, refetchInterval);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchWithRetry, refetchInterval, retries, ...dependencies]);

  const refetch = useCallback(() => {
    return fetchWithRetry(retries);
  }, [fetchWithRetry, retries]);

  return { data, isLoading, error, refetch };
}

/**
 * Hook for persisting state to localStorage with throttling
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Use throttled version for localStorage updates
  const setPersistedValue = useCallback(
    throttle((newValue: T) => {
      try {
        // Allow function updates
        const valueToStore = newValue instanceof Function ? newValue(state) : newValue;
        // Save state
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }, 1000), // Only update localStorage at most once per second
    [key, state]
  );

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow function updates
      const valueToStore = value instanceof Function ? value(state) : value;
      // Save state
      setState(valueToStore);
      // Update localStorage (throttled)
      setPersistedValue(valueToStore);
    } catch (error) {
      console.error(error);
    }
  };

  return [state, setValue] as const;
}
