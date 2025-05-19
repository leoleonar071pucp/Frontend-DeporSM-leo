/**
 * API client utilities for making consistent fetch calls across the application
 */

import { API_BASE_URL, API_CONFIG, AUTH_CONFIG } from './config';

interface FetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * Enhanced fetch function with timeout and default configuration
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = API_CONFIG.TIMEOUT_MS, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Base API fetch function that all other API calls should use
 */
export async function apiFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Merge default headers with provided headers
  const headers = {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...options.headers,
  };

  // Set credentials based on configuration
  const credentials = AUTH_CONFIG.INCLUDE_CREDENTIALS ? 'include' : 'same-origin';

  return fetchWithTimeout(url, {
    ...options,
    headers,
    credentials,
  });
}

/**
 * GET request helper
 */
export async function apiGet(endpoint: string, options: FetchOptions = {}): Promise<Response> {
  return apiFetch(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost(endpoint: string, data: any, options: FetchOptions = {}): Promise<Response> {
  console.log(`Llamando a apiPost con endpoint: ${endpoint}`, data);

  // Asegurarse de que el cuerpo de la solicitud sea un string
  const body = typeof data === 'string' ? data : JSON.stringify(data);

  // Asegurarse de que los headers incluyan Content-Type
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  return apiFetch(endpoint, {
    ...options,
    method: 'POST',
    body,
    headers,
  });
}

/**
 * PUT request helper
 */
export async function apiPut(endpoint: string, data: any, options: FetchOptions = {}): Promise<Response> {
  return apiFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete(endpoint: string, options: FetchOptions = {}): Promise<Response> {
  return apiFetch(endpoint, { ...options, method: 'DELETE' });
}

/**
 * Processes API responses and handles common error patterns
 */
export async function handleApiResponse<T = any>(response: Response): Promise<T> {
  if (!response.ok) {
    // Try to extract error information from the response
    let errorMessage = `Error ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore if we can't parse the error response
    }

    throw new Error(errorMessage);
  }

  // For successful responses, parse and return the JSON data
  return response.json();
}
