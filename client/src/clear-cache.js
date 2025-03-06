// Script to clear browser storage during development
if (typeof window !== 'undefined') {
  console.log('Clearing browser storage...');
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear any IndexedDB databases
  if (window.indexedDB) {
    window.indexedDB.databases().then(databases => {
      databases.forEach(database => {
        window.indexedDB.deleteDatabase(database.name);
      });
    });
  }
  
  // Attempt to clear cache via Cache API
  if (window.caches) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  console.log('Browser storage cleared successfully!');
}
