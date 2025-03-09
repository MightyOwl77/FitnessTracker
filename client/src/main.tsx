// Main entry point of the React application
// This file is responsible for rendering the root component (App) and setting up browser storage management.
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Keys to be preserved during storage clearing operations
// These keys are essential for maintaining user session and app state
// Preserve these keys during any clearing operations
const PRESERVED_KEYS = [
  'authToken',
  'userId',
  'username',
  'isAuthenticated',
  'hasCompletedOnboarding',
  'app_initialized'
];

// Only clear storage on initial page load, never on hot reloads
// Use a different approach that doesn't rely on modifying hot.data
let hasInitialized = false;

// Only run this once per actual page load (not on hot updates)
if (!hasInitialized && typeof window !== 'undefined') {
  hasInitialized = true;
  
  // Check if this is the first load within this browser session
  if (!sessionStorage.getItem('app_initialized')) {
    // Set flag to prevent clearing on page reloads within the same session
    // Check if the app has been initialized in the current session
    // This prevents clearing storage on subsequent page reloads within the same session
sessionStorage.setItem('app_initialized', 'true');
    
    console.log('First load: Clearing non-essential browser storage...');
    
    // Save all items that should be preserved
    // Save all items that should be preserved
    // This ensures that essential data is retained during storage clearing
const preservedItems: Record<string, string> = {};
    PRESERVED_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        preservedItems[key] = value;
      }
    });
    
    // Clear all items from local storage except for preserved items
    // This ensures a clean slate for the application while retaining essential data
    localStorage.clear();
    
    // Restore preserved items
    Object.entries(preservedItems).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    // Log a message indicating that browser storage has been cleared successfully
console.log('Browser storage cleared successfully!');
  }
}

createRoot(document.getElementById("root")!).render(<App />);
