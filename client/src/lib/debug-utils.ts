
// Debug utilities for tracking application flow
export const logAuthEvent = (event: string, data?: any) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
  console.log(`[AUTH ${timestamp}] ${event}`, data || '');
  
  // Store last 20 auth events in sessionStorage for debugging
  try {
    const authEvents = JSON.parse(sessionStorage.getItem('authEvents') || '[]');
    authEvents.push({ timestamp, event, data });
    
    // Keep only last 20 events
    while (authEvents.length > 20) {
      authEvents.shift();
    }
    
    sessionStorage.setItem('authEvents', JSON.stringify(authEvents));
  } catch (error) {
    console.error('Failed to store auth event:', error);
  }
};

// Function to dump auth debug logs to console
export const dumpAuthLogs = () => {
  try {
    const authEvents = JSON.parse(sessionStorage.getItem('authEvents') || '[]');
    console.table(authEvents);
    return authEvents;
  } catch (error) {
    console.error('Failed to dump auth logs:', error);
    return [];
  }
};

// Function to check authentication state
export const checkAuthState = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('userId');
  const lastLoginTime = localStorage.getItem('lastLoginTime');
  
  return {
    isAuthenticated,
    hasCompletedOnboarding,
    username,
    userId,
    lastLoginTime,
    currentPath: window.location.pathname
  };
};
