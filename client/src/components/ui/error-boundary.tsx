
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error information
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You could send this to an error reporting service
    // reportError(error, errorInfo);
  }

  private handleReset = (): void => {
    // Clear any cached state that might be causing the issue
    try {
      const keysToKeep = ['auth', 'preferences'];
      
      // Get all local storage keys
      const allKeys = Object.keys(localStorage);
      
      // Filter out keys to keep
      const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
      
      // Remove filtered keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Reset state and force refresh
      this.setState({ hasError: false, error: null, errorInfo: null });
      
      // Reload the application
      window.location.reload();
    } catch (e) {
      console.error('Error during reset:', e);
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background">
          <div className="w-full max-w-md p-6 space-y-4 bg-white rounded-lg shadow-lg">
            <div className="flex justify-center">
              <AlertCircle className="w-16 h-16 text-destructive" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800">Something went wrong</h1>
            
            <div className="p-3 text-sm bg-gray-100 rounded text-left overflow-auto max-h-32">
              {this.state.error?.message || 'An unexpected error occurred'}
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={this.handleReset}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset and reload
              </Button>
              
              <div className="text-xs text-gray-500">
                If this problem persists, please contact support.
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
