
import { useToast } from "@/components/ui/use-toast";

// Common API error types
export enum ErrorType {
  NETWORK = "network",
  SERVER = "server",
  AUTH = "auth",
  VALIDATION = "validation",
  UNKNOWN = "unknown",
}

export interface ApiError {
  type: ErrorType;
  message: string;
  status?: number;
  details?: any;
}

// Base URL for API requests
const API_BASE_URL = "/api";

// Helper function to check if response is JSON
const isJsonResponse = (response: Response) => {
  const contentType = response.headers.get("content-type");
  return contentType && contentType.includes("application/json");
};

// Helper to handle API errors
export const handleApiError = async (response: Response): Promise<ApiError> => {
  let errorMessage = "An unexpected error occurred";
  let errorType = ErrorType.UNKNOWN;
  let errorDetails = undefined;

  if (!response.ok) {
    // Handle based on status code
    if (response.status === 401 || response.status === 403) {
      errorType = ErrorType.AUTH;
      errorMessage = "Authentication error. Please log in again.";
    } else if (response.status === 400) {
      errorType = ErrorType.VALIDATION;
      errorMessage = "Invalid request data.";
    } else if (response.status >= 500) {
      errorType = ErrorType.SERVER;
      errorMessage = "Server error. Please try again later.";
    }

    // Try to get detailed error from response if possible
    if (isJsonResponse(response)) {
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        if (errorData.details) {
          errorDetails = errorData.details;
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
    }
  }

  return {
    type: errorType,
    message: errorMessage,
    status: response.status,
    details: errorDetails,
  };
};

// Main API request function
export async function apiRequest<T = any>(
  method: string,
  endpoint: string,
  data?: any,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Prepare fetch options
  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...options?.headers,
    },
    credentials: "same-origin",
    ...options,
  };

  // Add body if data is provided and method is not GET
  if (data && method.toUpperCase() !== "GET") {
    fetchOptions.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, fetchOptions);
    
    // Handle failed responses
    if (!response.ok) {
      const error = await handleApiError(response);
      throw error;
    }
    
    // Parse successful response
    if (isJsonResponse(response)) {
      return await response.json();
    } else {
      return {} as T;
    }
  } catch (error) {
    // Handle network errors
    if (error instanceof Error && error.name === "TypeError") {
      throw {
        type: ErrorType.NETWORK,
        message: "Network error. Please check your connection.",
        details: error.message,
      } as ApiError;
    }
    
    // Rethrow other errors
    throw error;
  }
}

// Hook for API requests with toast notifications
export function useApi() {
  const { toast } = useToast();
  
  // Wrapper for apiRequest that includes toast notifications for errors
  async function request<T = any>(
    method: string,
    endpoint: string,
    data?: any,
    options?: { showErrorToast?: boolean } & RequestInit
  ): Promise<T> {
    const { showErrorToast = true, ...fetchOptions } = options || {};
    
    try {
      return await apiRequest<T>(method, endpoint, data, fetchOptions);
    } catch (error) {
      const apiError = error as ApiError;
      
      // Show error toast if enabled
      if (showErrorToast) {
        toast({
          variant: "destructive",
          title: "Error",
          description: apiError.message || "Something went wrong",
        });
      }
      
      // Redirect to login if auth error
      if (apiError.type === ErrorType.AUTH) {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      }
      
      throw error;
    }
  }
  
  return {
    get: <T = any>(endpoint: string, options?: RequestInit & { showErrorToast?: boolean }) => 
      request<T>("GET", endpoint, undefined, options),
    post: <T = any>(endpoint: string, data?: any, options?: RequestInit & { showErrorToast?: boolean }) => 
      request<T>("POST", endpoint, data, options),
    put: <T = any>(endpoint: string, data?: any, options?: RequestInit & { showErrorToast?: boolean }) => 
      request<T>("PUT", endpoint, data, options),
    patch: <T = any>(endpoint: string, data?: any, options?: RequestInit & { showErrorToast?: boolean }) => 
      request<T>("PATCH", endpoint, data, options),
    delete: <T = any>(endpoint: string, options?: RequestInit & { showErrorToast?: boolean }) => 
      request<T>("DELETE", endpoint, undefined, options),
  };
}
