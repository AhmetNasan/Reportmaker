// React Query Client Configuration - client/src/lib/queryClient.ts (converted to JS)

import { QueryClient } from "@tanstack/react-query";

/**
 * API request function with error handling
 * @param {string} url - The URL to make the request to
 * @param {object} options - Fetch options
 * @returns {Promise} - Promise that resolves to the response data
 */
export async function apiRequest(url, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Default query function for React Query
 * @param {object} queryKey - The query key object
 * @returns {Promise} - Promise that resolves to the fetched data
 */
async function defaultQueryFn({ queryKey }) {
  const [url] = queryKey;
  return apiRequest(url);
}

/**
 * Create and configure the React Query client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

/**
 * Utility functions for common API operations
 */
export const queryUtils = {
  /**
   * Invalidate queries by pattern
   * @param {string|string[]} queryKey - Query key or pattern to invalidate
   */
  invalidate: (queryKey) => {
    queryClient.invalidateQueries({ queryKey });
  },

  /**
   * Remove queries by pattern
   * @param {string|string[]} queryKey - Query key or pattern to remove
   */
  remove: (queryKey) => {
    queryClient.removeQueries({ queryKey });
  },

  /**
   * Set query data manually
   * @param {string|string[]} queryKey - Query key
   * @param {any} data - Data to set
   */
  setData: (queryKey, data) => {
    queryClient.setQueryData(queryKey, data);
  },

  /**
   * Get cached query data
   * @param {string|string[]} queryKey - Query key
   * @returns {any} - Cached data or undefined
   */
  getData: (queryKey) => {
    return queryClient.getQueryData(queryKey);
  },

  /**
   * Prefetch a query
   * @param {string|string[]} queryKey - Query key
   * @param {function} queryFn - Optional custom query function
   */
  prefetch: (queryKey, queryFn) => {
    return queryClient.prefetchQuery({ queryKey, queryFn });
  },
};

/**
 * Custom hooks for common patterns
 */

/**
 * Hook for creating mutations with common error handling
 * @param {string} url - The URL for the mutation
 * @param {object} options - Additional options
 * @returns {object} - Mutation object
 */
export function useApiMutation(url, options = {}) {
  const { 
    method = 'POST', 
    onSuccess, 
    onError, 
    invalidateQueries = [], 
    ...mutationOptions 
  } = options;

  return useMutation({
    mutationFn: (data) => apiRequest(url, {
      method,
      body: data ? JSON.stringify(data) : undefined,
    }),
    onSuccess: (data, variables, context) => {
      // Invalidate specified queries
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      // Call custom onSuccess
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error(`Mutation failed for ${url}:`, error);
      
      // Call custom onError
      if (onError) {
        onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });
}

/**
 * Hook for queries with common configuration
 * @param {string|string[]} queryKey - Query key
 * @param {object} options - Additional options
 * @returns {object} - Query object
 */
export function useApiQuery(queryKey, options = {}) {
  return useQuery({
    queryKey,
    ...options,
  });
}

/**
 * Error boundary for React Query errors
 */
export class QueryErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Query Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HTTP status code utilities
 */
export const httpStatus = {
  isSuccess: (status) => status >= 200 && status < 300,
  isClientError: (status) => status >= 400 && status < 500,
  isServerError: (status) => status >= 500,
  isError: (status) => status >= 400,
};

/**
 * Request interceptors for common headers/auth
 */
export const requestInterceptors = {
  /**
   * Add authorization header
   * @param {string} token - Auth token
   * @returns {object} - Headers object
   */
  withAuth: (token) => ({
    'Authorization': `Bearer ${token}`,
  }),

  /**
   * Add API key header
   * @param {string} apiKey - API key
   * @returns {object} - Headers object
   */
  withApiKey: (apiKey) => ({
    'X-API-Key': apiKey,
  }),

  /**
   * Add request ID for tracking
   * @returns {object} - Headers object
   */
  withRequestId: () => ({
    'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  }),
};

/**
 * Cache utilities
 */
export const cacheUtils = {
  /**
   * Get cache size information
   * @returns {object} - Cache size info
   */
  getCacheSize: () => {
    const cache = queryClient.getQueryCache();
    return {
      totalQueries: cache.getAll().length,
      staleQueries: cache.getAll().filter(query => query.isStale()).length,
      activeQueries: cache.getAll().filter(query => query.observers.length > 0).length,
    };
  },

  /**
   * Clear all cached data
   */
  clearAll: () => {
    queryClient.clear();
  },

  /**
   * Clear stale queries only
   */
  clearStale: () => {
    const cache = queryClient.getQueryCache();
    cache.getAll()
      .filter(query => query.isStale())
      .forEach(query => cache.remove(query));
  },

  /**
   * Get memory usage estimate (approximate)
   * @returns {number} - Estimated memory usage in bytes
   */
  getMemoryUsage: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    // Rough estimate based on JSON serialization
    let totalSize = 0;
    queries.forEach(query => {
      try {
        const dataSize = JSON.stringify(query.state.data || {}).length;
        totalSize += dataSize;
      } catch (e) {
        // Skip queries with non-serializable data
      }
    });
    
    return totalSize;
  },
};

/**
 * Development utilities
 */
export const devUtils = {
  /**
   * Log query cache state
   */
  logCacheState: () => {
    if (process.env.NODE_ENV === 'development') {
      console.group('React Query Cache State');
      console.log('Cache size:', cacheUtils.getCacheSize());
      console.log('Memory usage:', `${(cacheUtils.getMemoryUsage() / 1024).toFixed(2)} KB`);
      console.log('All queries:', queryClient.getQueryCache().getAll());
      console.groupEnd();
    }
  },

  /**
   * Monitor query performance
   * @param {string} queryKey - Query to monitor
   */
  monitorQuery: (queryKey) => {
    if (process.env.NODE_ENV === 'development') {
      const query = queryClient.getQueryCache().find({ queryKey });
      if (query) {
        console.log(`Query ${queryKey}:`, {
          status: query.state.status,
          fetchStatus: query.state.fetchStatus,
          dataUpdatedAt: new Date(query.state.dataUpdatedAt),
          errorUpdatedAt: new Date(query.state.errorUpdatedAt),
          fetchFailureCount: query.state.fetchFailureCount,
        });
      }
    }
  },
};

// Export default object
export default {
  queryClient,
  apiRequest,
  queryUtils,
  httpStatus,
  requestInterceptors,
  cacheUtils,
  devUtils,
};