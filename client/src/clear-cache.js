// Script to clear browser storage during development
// This file is no longer used automatically - main.tsx now has a more selective approach
// This file can be manually imported when a full cache reset is needed
export function clearCache() {
  if (typeof window !== 'undefined') {
    console.log('Manual cache clearing triggered...');
    
    // Preserve authentication data
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const appInitialized = localStorage.getItem('app_initialized');
    
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Restore authentication data
    if (authToken) localStorage.setItem('authToken', authToken);
    if (userId) localStorage.setItem('userId', userId);
    if (username) localStorage.setItem('username', username);
    if (appInitialized) localStorage.setItem('app_initialized', appInitialized);
    
    // Clear any IndexedDB databases
    if (window.indexedDB) {
      try {
        window.indexedDB.databases().then(databases => {
          databases.forEach(database => {
            if (database.name) {
              window.indexedDB.deleteDatabase(database.name);
            }
          });
        });
      } catch (e) {
        console.warn('Failed to clear IndexedDB:', e);
      }
    }
    
    // Attempt to clear cache via Cache API
    if (window.caches) {
      try {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      } catch (e) {
        console.warn('Failed to clear Cache API:', e);
      }
    }
    
    console.log('Browser storage cleared successfully!');
    return true;
  }
  return false;
}
