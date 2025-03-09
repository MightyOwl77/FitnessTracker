/**
 * Connection manager to handle server connection losses
 */

import { toast } from '@/hooks/use-toast';

interface ConnectionOptions {
  onReconnect?: () => void;
  onOffline?: () => void;
  onOnline?: () => void;
  maxRetries?: number;
  retryInterval?: number;
}

class ConnectionManager {
  private isOnline: boolean = navigator.onLine;
  private retryCount: number = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private options: Required<ConnectionOptions>;
  private reconnecting: boolean = false;

  constructor(options: ConnectionOptions = {}) {
    this.options = {
      onReconnect: options.onReconnect || (() => {}),
      onOffline: options.onOffline || (() => {}),
      onOnline: options.onOnline || (() => {}),
      maxRetries: options.maxRetries || 5,
      retryInterval: options.retryInterval || 5000,
    };

    // Initialize listeners
    this.initEventListeners();
  }

  /**
   * Initialize event listeners for online/offline status
   */
  private initEventListeners(): void {
    // Listen for online status changes
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Set up periodic server ping to detect connection issues
    this.startPing();
  }

  /**
   * Handle when the browser detects we're online
   */
  private handleOnline(): void {
    if (!this.isOnline) {
      this.isOnline = true;
      this.attemptReconnect();
      toast({
        title: "You're back online",
        description: "Reconnected to server",
        variant: "default",
      });
      this.options.onOnline();
    }
  }

  /**
   * Handle when the browser detects we're offline
   */
  private handleOffline(): void {
    this.isOnline = false;
    this.reconnecting = false;

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    toast({
      title: "You're offline",
      description: "Please check your connection",
      variant: "destructive",
    });

    this.options.onOffline();
  }

  /**
   * Ping the server to check connection
   */
  private async pingServer(): Promise<boolean> {
    try {
      // Use a simple fetch with a manual timeout instead of AbortSignal
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('/api/ping', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start pinging the server periodically
   */
  private startPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    // Ping server every 30 seconds to check connection
    this.pingInterval = setInterval(async () => {
      if (!this.reconnecting && navigator.onLine) {
        const isConnected = await this.pingServer();

        if (!isConnected && this.isOnline) {
          this.isOnline = false;
          toast({
            title: "Server connection lost",
            description: "Attempting to reconnect...",
            variant: "destructive",
          });
          this.attemptReconnect();
        }
      }
    }, 30000);
  }

  /**
   * Attempt to reconnect to the server
   */
  private attemptReconnect(): void {
    if (this.reconnecting) return;

    this.reconnecting = true;
    this.retryCount = 0;

    const tryReconnect = async () => {
      if (this.retryCount >= this.options.maxRetries) {
        toast({
          title: "Reconnection failed",
          description: "Please refresh the page",
          variant: "destructive",
        });
        this.reconnecting = false;
        return;
      }

      const isConnected = await this.pingServer();

      if (isConnected) {
        this.isOnline = true;
        this.reconnecting = false;
        toast({
          title: "Reconnected to server",
          description: "Your connection has been restored",
          variant: "default",
        });
        this.options.onReconnect();
      } else {
        this.retryCount++;
        this.retryTimer = setTimeout(tryReconnect, this.options.retryInterval);
      }
    };

    tryReconnect();
  }

  /**
   * Public method to manually attempt reconnection
   */
  public reconnect(): void {
    if (!this.reconnecting) {
      this.attemptReconnect();
    }
  }

  /**
   * Cleanup resources when no longer needed
   */
  public cleanup(): void {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }
}

// Create a singleton instance for the app
const connectionManager = new ConnectionManager();

export default connectionManager;

// Implement robust reconnection logic for iOS
const reconnect = () => {
  console.log("[vite] server connection lost. Polling for restart...");

  // For iOS devices, we need to handle reconnection more gracefully
  const maxRetries = 5;
  let retryCount = 0;

  const attemptReconnect = () => {
    if (retryCount < maxRetries) {
      retryCount++;
      setTimeout(() => {
        // Check online status - important for iOS which can switch between WiFi/cellular
        if (navigator.onLine) {
          // Create a test fetch to see if we can reach the server
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          fetch('/api/healthcheck', { 
            method: 'HEAD',
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
            signal: controller.signal
          })
          .then(response => {
            clearTimeout(timeoutId);
            if (response.ok) {
              // If successful, reload the app
              window.location.reload();
            } else {
              attemptReconnect();
            }
          })
          .catch(() => {
            clearTimeout(timeoutId);
            attemptReconnect();
          });
        } else {
          // If device is offline, wait for online event
          window.addEventListener('online', () => {
            window.location.reload();
          }, { once: true });
        }
      }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
    } else {
      // Show offline message to user
      document.body.classList.add('app-offline');
    }
  };

  attemptReconnect();
};