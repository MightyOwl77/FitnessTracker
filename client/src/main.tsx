import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

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
    sessionStorage.setItem('app_initialized', 'true');
    
    console.log('First load: Clearing non-essential browser storage...');
    
    // Save all items that should be preserved
    const preservedItems: Record<string, string> = {};
    PRESERVED_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        preservedItems[key] = value;
      }
    });
    
    // Clear storage
    localStorage.clear();
    
    // Restore preserved items
    Object.entries(preservedItems).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    console.log('Browser storage cleared successfully!');
  }
}

createRoot(document.getElementById("root")!).render(<App />);
