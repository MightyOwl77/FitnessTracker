/**
 * Functions for clearing local storage and application cache
 */

/**
 * Clears all client-side storage for the application
 * Used when resetting the app for a new user or troubleshooting
 */
export function clearCache(): boolean {
  console.log('Clearing all browser storage for fresh start...');
  
  // Clear localStorage
  const keysToPreserve: string[] = []; // No keys are preserved for a complete reset
  const allKeys = Object.keys(localStorage);
  
  // Log what's being cleared
  console.log(`Found ${allKeys.length} items in localStorage`);
  
  // Remove all keys
  allKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Removed: ${key}`);
  });
  
  // Reset authentication state specifically
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('hasCompletedOnboarding');
  localStorage.removeItem('userId');
  localStorage.removeItem('userToken');
  localStorage.removeItem('username');
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear temp storage
  clearTempStorage();
  
  // Clear specific cache items
  clearItemsByPrefix('temp:');
  clearItemsByPrefix('cache:');
  
  console.log('Storage cleared successfully. App ready for fresh start.');
  
  return true;
}

/**
 * Clears all temporary storage
 */
export function clearTempStorage(): void {
  const now = Date.now();
  const allKeys = Object.keys(localStorage);
  
  // Find all keys with expiry information
  allKeys.forEach(key => {
    if (key.startsWith('expirable:')) {
      try {
        const item = JSON.parse(localStorage.getItem(key) || '{}');
        if (item && item.expiry && item.expiry < now) {
          localStorage.removeItem(key);
        }
      } catch (err) {
        // If item can't be parsed, remove it
        localStorage.removeItem(key);
      }
    }
  });
}

/**
 * Clears all items with a specific prefix
 */
export function clearItemsByPrefix(prefix: string): void {
  const allKeys = Object.keys(localStorage);
  const matchingKeys = allKeys.filter(key => key.startsWith(prefix));
  
  console.log(`Cleared ${matchingKeys.length} items with prefix "${prefix}" from localStorage`);
  
  matchingKeys.forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Resets the application database via API
 * This performs a server-side reset of the current user's data
 */
export async function resetUserData(): Promise<boolean> {
  try {
    const response = await fetch('/api/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Server data reset successful:', data);
    return true;
  } catch (error) {
    console.error('Failed to reset user data on server:', error);
    return false;
  }
}

/**
 * Complete application reset - both client and server
 * Returns promise that resolves when all reset operations are complete
 */
export async function performFullReset(): Promise<boolean> {
  // Clear client-side storage first
  clearCache();
  
  // Then reset server data
  const serverReset = await resetUserData();
  
  if (serverReset) {
    console.log('Full application reset completed successfully');
    return true;
  } else {
    console.warn('Client-side reset completed, but server reset failed');
    return false;
  }
}