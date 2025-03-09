import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Only clear storage on initial load, not on hot reloads
if (import.meta.env.DEV && !window.localStorage.getItem('app_initialized')) {
  // Set flag to prevent clearing on subsequent reloads
  window.localStorage.setItem('app_initialized', 'true');
  
  // Clear browser caches on first load only
  if (typeof window !== 'undefined') {
    console.log('First load: Clearing browser storage...');
    // We'll keep the authentication-related items
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    localStorage.clear();
    sessionStorage.clear();
    
    // Restore auth items
    if (authToken) localStorage.setItem('authToken', authToken);
    if (userId) localStorage.setItem('userId', userId);
    if (username) localStorage.setItem('username', username);
    
    console.log('Browser storage cleared successfully!');
  }
}

createRoot(document.getElementById("root")!).render(<App />);
