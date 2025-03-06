
/**
 * Client-side performance monitoring utilities
 */

// Store page load metrics
export const trackPageLoad = () => {
  if (window.performance) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const domLoadTime = perfData.domComplete - perfData.domLoading;
    
    // Log for development, send to server in production
    console.info(`Page load time: ${pageLoadTime}ms`);
    console.info(`DOM load time: ${domLoadTime}ms`);
    
    // In production, you would send this to your analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      sendPerformanceMetrics({
        pageLoadTime,
        domLoadTime,
        url: window.location.pathname
      });
    }
  }
};

// Track component render time
export const useComponentTimer = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    console.info(`Component ${componentName} render time: ${renderTime.toFixed(2)}ms`);
    
    // In production, you would send this to your analytics endpoint
    if (process.env.NODE_ENV === 'production' && renderTime > 100) {
      sendPerformanceMetrics({
        componentRenderTime: renderTime,
        componentName,
        url: window.location.pathname
      });
    }
  };
};

// Send metrics to server
const sendPerformanceMetrics = async (metrics: Record<string, any>) => {
  try {
    await fetch('/api/metrics/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metrics),
      credentials: 'include'
    });
  } catch (error) {
    console.error('Error sending performance metrics', error);
  }
};

// Track API call performance
export const trackApiCall = async (url: string, method: string, callback: () => Promise<any>) => {
  const startTime = performance.now();
  try {
    const result = await callback();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.info(`API call to ${url} took ${duration.toFixed(2)}ms`);
    
    // Track slow API calls
    if (duration > 500) {
      console.warn(`Slow API call to ${url}: ${duration.toFixed(2)}ms`);
      if (process.env.NODE_ENV === 'production') {
        sendPerformanceMetrics({
          apiCallTime: duration,
          url,
          method
        });
      }
    }
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    console.error(`API call to ${url} failed after ${(endTime - startTime).toFixed(2)}ms`, error);
    throw error;
  }
};
