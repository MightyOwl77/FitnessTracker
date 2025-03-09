import axios from 'axios';
import { storageManager } from './storage-utils';
import connectionManager from './connection-manager';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// In-memory request cache for deduplication
const requestCache = new Map();
const CACHE_DURATION = 60 * 1000; // 1 minute cache

// Generic request function with caching and retry logic
async function request<T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  options?: {
    cacheDuration?: number,
    forceRefresh?: boolean,
    retries?: number,
    retryDelay?: number,
    cacheKey?: string
  }
): Promise<T> {
  const {
    cacheDuration = CACHE_DURATION,
    forceRefresh = false,
    retries = 2,
    retryDelay = 1000,
    cacheKey = `${method}:${url}:${data ? JSON.stringify(data) : ''}`
  } = options || {};

  // Check cache for GET requests if not forcing refresh
  if (method === 'get' && !forceRefresh) {
    // Check in-memory cache first
    const cachedResponse = requestCache.get(cacheKey);
    if (cachedResponse && cachedResponse.expiry > Date.now()) {
      return cachedResponse.data;
    }

    // Then check storage cache
    const storedResponse = storageManager.getItem<{data: T, timestamp: number}>(`cache:${cacheKey}`);
    if (storedResponse && (Date.now() - storedResponse.timestamp < cacheDuration)) {
      // Refresh in-memory cache
      requestCache.set(cacheKey, {
        data: storedResponse.data,
        expiry: Date.now() + cacheDuration
      });
      return storedResponse.data;
    }
  }

  // Function to execute the request with retries
  const executeRequest = async (retriesLeft: number): Promise<T> => {
    try {
      const response = method === 'get' 
        ? await api.get(url)
        : await api[method](url, data);

      // Cache successful GET responses
      if (method === 'get') {
        requestCache.set(cacheKey, {
          data: response.data,
          expiry: Date.now() + cacheDuration
        });

        // Store in persistent cache
        storageManager.setItem(`cache:${cacheKey}`, {
          data: response.data,
          timestamp: Date.now()
        });
      }

      // Clear related caches after POST/PUT/DELETE
      if (method !== 'get') {
        const prefix = url.split('/')[1]; // e.g., 'profile' from '/profile'

        // Clear in-memory cache
        for (const key of requestCache.keys()) {
          if (key.includes(`:/${prefix}`)) {
            requestCache.delete(key);
          }
        }

        // Clear storage cache
        storageManager.clearItems(`cache:get:/${prefix}`);
      }

      return response.data;
    } catch (error) {
      // Handle retries for network errors
      if (retriesLeft > 0 && (
        axios.isAxiosError(error) &&
        (error.code === 'ECONNABORTED' || !error.response || error.response.status >= 500)
      )) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return executeRequest(retriesLeft - 1);
      }

      // No more retries, throw the error
      console.error(`Error in ${method.toUpperCase()} ${url}:`, error);
      throw error;
    }
  };

  return executeRequest(retries);
}

// API Functions with improved caching and error handling
export async function fetchProfile() {
  try {
    const data = await request<any>('get', '/profile');
    console.log('Loading profile data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

export async function saveProfile(profileData: any) {
  try {
    return await request<any>('post', '/profile', profileData);
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
}

export async function saveGoals(goalsData: any) {
  try {
    return await request<any>('post', '/goals', goalsData);
  } catch (error) {
    console.error('Error saving goals:', error);
    throw error;
  }
}

export async function fetchGoals() {
  try {
    return await request<any>('get', '/goals');
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
}

export async function fetchBodyStats() {
  try {
    return await request<any>('get', '/body-stats');
  } catch (error) {
    console.error('Error fetching body stats:', error);
    throw error;
  }
}

export async function saveBodyStat(statData: any) {
  try {
    return await request<any>('post', '/body-stats', statData);
  } catch (error) {
    console.error('Error saving body stat:', error);
    throw error;
  }
}

export async function fetchPredictedWeight() {
  try {
    const data = await request<any>('get', '/predicted-weight');
    console.log('Graph data:', data.predictions, 'Weeks:', data.weeksToGoal, 'Weekly loss:', data.weeklyLoss, 'Current Weight:', data.currentWeight);
    return data;
  } catch (error) {
    console.error('Error fetching predicted weight:', error);
    throw error;
  }
}

// Simple ping endpoint to check connectivity
export async function pingServer() {
  try {
    await api.get('/ping', { timeout: 3000 });
    return true;
  } catch (error) {
    return false;
  }
}

// Add request interceptor for connection handling
api.interceptors.request.use(
  (config) => {
    // You could add additional logic here, like adding auth tokens
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && !error.response) {
      // Network error - might be offline
      connectionManager.reconnect();
    }
    return Promise.reject(error);
  }
);