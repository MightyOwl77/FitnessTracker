
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  userId: string | null;
  username: string | null;
  login: (token: string, userId: string, username: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const storedHasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');
    
    setIsAuthenticated(storedIsAuthenticated);
    setHasCompletedOnboarding(storedHasCompletedOnboarding);
    setUserId(storedUserId);
    setUsername(storedUsername);
    
    console.log('Auth context initialized:', { storedIsAuthenticated, storedHasCompletedOnboarding });
  }, []);

  // Login function
  const login = (token: string, userId: string, username: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    localStorage.setItem('isAuthenticated', 'true');
    
    setIsAuthenticated(true);
    setUserId(userId);
    setUsername(username);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.setItem('isAuthenticated', 'false');
    
    setIsAuthenticated(false);
    setUserId(null);
    setUsername(null);
  };

  // Complete onboarding function
  const completeOnboarding = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setHasCompletedOnboarding(true);
  };

  const value = {
    isAuthenticated,
    hasCompletedOnboarding,
    userId,
    username,
    login,
    logout,
    completeOnboarding
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
