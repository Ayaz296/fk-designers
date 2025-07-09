// API Configuration with enhanced error handling and retry logic
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://fk-designers-backend.onrender.com/api' 
  : 'http://localhost:5000/api';

// Request timeout configuration
const REQUEST_TIMEOUT = 15000; // 15 seconds (reduced)
const RETRY_ATTEMPTS = 2; // Reduced from 3 to prevent excessive retries
const RETRY_DELAY = 3000; // Increased to 3 seconds

// Global request tracking to prevent duplicate requests
const globalRequestTracker = new Map<string, Promise<any>>();

// Enhanced API client with automatic retry and better error handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = sessionStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle different content types
    const contentType = response.headers.get('content-type');
    let data: any;

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }
    } catch (parseError) {
      throw new Error('Invalid response format from server');
    }

    if (!response.ok) {
      // Handle specific HTTP status codes
      switch (response.status) {
        case 401:
          // Clear invalid token
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_user');
          throw new Error(data.message || 'Authentication required. Please log in again.');
        
        case 403:
          throw new Error(data.message || 'Access denied. Insufficient permissions.');
        
        case 404:
          throw new Error(data.message || 'Resource not found.');
        
        case 409:
          throw new Error(data.message || 'Conflict. Resource already exists.');
        
        case 429:
          const retryAfter = data.retryAfter || 60;
          // Don't throw immediately for rate limits, let retry logic handle it
          const rateLimitError = new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`);
          rateLimitError.name = 'RateLimitError';
          throw rateLimitError;
        
        case 500:
          throw new Error(data.message || 'Server error. Please try again later.');
        
        case 502:
        case 503:
        case 504:
          throw new Error('Service temporarily unavailable. Please try again in a moment.');
        
        default:
          throw new Error(data.message || `Request failed with status ${response.status}`);
      }
    }
    
    if (data && typeof data === 'object' && 'success' in data && !data.success) {
      throw new Error(data.message || 'Request failed');
    }
    
    return data && typeof data === 'object' && 'data' in data ? data.data : data;
  }

  private async makeRequest<T>(
    url: string, 
    options: RequestInit, 
    attempt: number = 1
  ): Promise<T> {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);

    } catch (error) {
      // Handle different types of errors
      if (error instanceof Error) {
        // Rate limiting errors should not be retried immediately
        if (error.name === 'RateLimitError' || error.message.includes('Rate limit exceeded')) {
          console.warn('⚠️ Rate limit exceeded, not retrying immediately');
          throw error;
        }

        // Network errors that might benefit from retry
        const retryableErrors = [
          'Failed to fetch',
          'Network request failed',
          'The operation was aborted',
          'Service temporarily unavailable'
        ];

        const shouldRetry = retryableErrors.some(msg => 
          error.message.includes(msg)
        ) && attempt < RETRY_ATTEMPTS;

        if (shouldRetry) {
          console.log(`🔄 Retrying request (attempt ${attempt + 1}/${RETRY_ATTEMPTS}):`, url);
          await this.delay(RETRY_DELAY * Math.pow(2, attempt - 1)); // Exponential backoff
          return this.makeRequest<T>(url, options, attempt + 1);
        }

        // Handle specific error types
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Please check your connection and try again.');
        }

        if (error.message.includes('Failed to fetch')) {
          throw new Error('Connection failed. Please check your internet connection and try again.');
        }
      }

      throw error;
    }
  }

  // Global request deduplication to prevent multiple identical requests
  private async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (globalRequestTracker.has(key)) {
      console.log(`🔄 Deduplicating request: ${key.substring(0, 50)}...`);
      return globalRequestTracker.get(key);
    }

    const promise = requestFn().finally(() => {
      globalRequestTracker.delete(key);
    });

    globalRequestTracker.set(key, promise);
    return promise;
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value);
        }
      });
    }

    // Create shorter, more efficient cache keys
    const requestKey = `GET:${endpoint}:${JSON.stringify(params || {})}`;
    
    return this.deduplicateRequest(requestKey, () =>
      this.makeRequest<T>(url.toString(), {
        method: 'GET',
        cache: 'no-store' // Prevent any browser caching issues
      })
    );
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const requestKey = `POST:${endpoint}:${JSON.stringify(data || {})}`;
    
    return this.deduplicateRequest(requestKey, () =>
      this.makeRequest<T>(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      })
    );
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const requestKey = `PUT:${endpoint}:${JSON.stringify(data || {})}`;
    
    return this.deduplicateRequest(requestKey, () =>
      this.makeRequest<T>(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      })
    );
  }

  async delete<T>(endpoint: string): Promise<T> {
    const requestKey = `DELETE:${endpoint}`;
    
    return this.deduplicateRequest(requestKey, () =>
      this.makeRequest<T>(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
      })
    );
  }

  // Health check method
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      throw new Error('API health check failed');
    }
  }

  // Clear global request tracker
  clearRequestTracker(): void {
    globalRequestTracker.clear();
    console.log('🗑️ Global request tracker cleared');
  }

  // Get active requests for debugging
  getActiveRequests(): string[] {
    return Array.from(globalRequestTracker.keys());
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { API_BASE_URL };

// Export utility functions for error handling
export const isNetworkError = (error: Error): boolean => {
  return error.message.includes('Network error') || 
         error.message.includes('Failed to fetch') ||
         error.message.includes('Request timeout');
};

export const isAuthError = (error: Error): boolean => {
  return error.message.includes('Authentication required') ||
         error.message.includes('Access denied');
};

export const isRateLimitError = (error: Error): boolean => {
  return error.message.includes('Rate limit exceeded');
};