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
  }
}

// Register service worker for caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);