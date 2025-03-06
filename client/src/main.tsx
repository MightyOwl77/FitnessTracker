import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Clear browser storage (development only)
if (import.meta.env.DEV) {
  // Clear browser caches
  if (typeof window !== 'undefined') {
    console.log('Clearing browser storage...');
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any IndexedDB databases
    if (window.indexedDB) {
      try {
        window.indexedDB.databases().then(databases => {
          databases.forEach(database => {
            window.indexedDB.deleteDatabase(database.name);
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
  }
}

createRoot(document.getElementById("root")!).render(<App />);
