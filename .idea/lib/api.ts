/**
 * Utility functions for API calls
 */

const API_BASE_URL = 'http://localhost:8080/api';

// Use a type that's compatible with Next.js
type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

/**
 * Makes a fetch request to the backend API with consistent configuration
 * @param endpoint - The API endpoint (without the base URL)
 * @param options - Fetch options
 * @returns Promise with the fetch response
 */
export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Set default headers if not provided
  const headers = {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    ...options.headers,
  };

  // Always include credentials
  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  return fetch(url, config);
}

/**
 * Shorthand for GET requests
 */
export function getApi(endpoint: string, options: FetchOptions = {}) {
  return fetchApi(endpoint, { ...options, method: 'GET' });
}

/**
 * Shorthand for POST requests
 */
export function postApi(endpoint: string, data: any, options: FetchOptions = {}) {
  return fetchApi(endpoint, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Shorthand for PUT requests
 */
export function putApi(endpoint: string, data: any, options: FetchOptions = {}) {
  return fetchApi(endpoint, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Shorthand for DELETE requests
 */
export function deleteApi(endpoint: string, options: FetchOptions = {}) {
  return fetchApi(endpoint, { ...options, method: 'DELETE' });
}
