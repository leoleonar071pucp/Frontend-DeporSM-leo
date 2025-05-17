/**
 * Authentication and cookie utilities
 */
// Use a try-catch for importing jwt-decode to handle cases where it might not be available
let jwtDecode: any = null;
try {
  // Dynamic import for better compatibility
  jwtDecode = require('jwt-decode').jwtDecode;
} catch (error) {
  console.error('Error importing jwt-decode:', error);
}

/**
 * Token response interface definition
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType?: string;
  user: any;
}

/**
 * Clears all session-related cookies with various path and domain combinations
 * to ensure cookies are properly cleared across all scenarios
 */
export function clearAuthCookies(): void {
  const cookiesToClear = ['JSESSIONID', 'refresh_token', 'XSRF-TOKEN'];
  const domains = [
    window.location.hostname,           // Current domain (e.g., localhost)
    `.${window.location.hostname}`,     // Domain with leading dot (e.g., .localhost)
    window.location.hostname.includes('.') ? 
      window.location.hostname.split('.').slice(1).join('.') : null // Parent domain
  ].filter(Boolean) as string[];

  const paths = ['/', '/api'];

  // Try multiple domain and path combinations to ensure cookies are cleared
  cookiesToClear.forEach(cookieName => {
    // Clear with specific domains and paths
    domains.forEach(domain => {
      paths.forEach(path => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
      });
      // Also try without specifying path
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}`;
    });
    
    // Also try without domain specification
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  });
}

/**
 * Gets all cookies as a key-value object
 */
export function getAllCookies(): Record<string, string> {
  return document.cookie
    .split(';')
    .reduce((cookies: Record<string, string>, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name) cookies[name] = value || '';
      return cookies;
    }, {});
}

/**
 * Gets a specific cookie by name
 */
export function getCookie(name: string): string | null {
  const cookies = getAllCookies();
  return cookies[name] || null;
}

/**
 * Checks if authentication cookies are present
 */
export function hasAuthCookies(): boolean {
  return !!getCookie('JSESSIONID');
}

/**
 * Stores a timestamp when logout occurs to prevent immediate re-authentication attempts
 */
export function setLogoutTimestamp(durationMs = 3000): void {
  localStorage.setItem('logoutTimestamp', Date.now().toString());
  localStorage.setItem('logoutDuration', durationMs.toString());
}

/**
 * Checks if a recent logout has occurred within the specified duration
 */
export function hasRecentLogout(): boolean {
  const timestamp = localStorage.getItem('logoutTimestamp');
  const duration = localStorage.getItem('logoutDuration') || '3000';
  
  if (!timestamp) return false;
  
  const logoutTime = parseInt(timestamp, 10);
  const durationMs = parseInt(duration, 10);
  const currentTime = Date.now();
  
  return (currentTime - logoutTime) < durationMs;
}

/**
 * Stores an authentication token in localStorage
 */
export function storeAuthToken(token: TokenResponse): void {
  try {
    localStorage.setItem('auth_token', token.accessToken);
    localStorage.setItem('refresh_token', token.refreshToken);
    localStorage.setItem('auth_token_expiry', (Date.now() + (token.expiresIn * 1000)).toString());
    localStorage.setItem('auth_user', JSON.stringify(token.user));
  } catch (e) {
    console.error('Error storing auth token:', e);
  }
}

/**
 * Store tokens and user data separately
 */
export function storeTokens(accessToken: string, refreshToken: string, user: any): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('auth_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  localStorage.setItem('auth_token_expiry', (Date.now() + (3600 * 1000)).toString()); // Default 1 hour expiry
  localStorage.setItem('auth_user', JSON.stringify(user));
}

/**
 * Clears the stored authentication token
 */
export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('auth_token_expiry');
  localStorage.removeItem('auth_user');
}

/**
 * Checks if the stored token is expired
 */
export function isTokenExpired(): boolean {
  const expiryStr = localStorage.getItem('auth_token_expiry');
  if (!expiryStr) return true;
  
  const expiry = parseInt(expiryStr, 10);
  return Date.now() > expiry;
}

/**
 * Gets the stored user from localStorage
 */
export function getStoredUser(): any | null {
  try {
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Error parsing stored user:', e);
    return null;
  }
}

/**
 * Gets the stored access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Gets the stored refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

/**
 * Check if token is expired based on JWT payload
 * This provides a more accurate check than just using the stored expiry
 */
export function isJwtExpired(token: string | null): boolean {
  if (!token) return true;
  
  try {
    // If jwtDecode is not available, fall back to checking the stored expiry
    if (!jwtDecode) {
      return isTokenExpired(); // Use the time-based approach as fallback
    }
    
    const decodedToken: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Add 30-second buffer to prevent edge cases
    return decodedToken.exp < currentTime + 30;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
}

/**
 * Get time remaining until token expires (in seconds) based on JWT payload
 */
export function getTokenTimeRemaining(): number {
  const token = getAccessToken();
  if (!token) return 0;
  
  try {
    // If jwtDecode is not available, fall back to checking the stored expiry
    if (!jwtDecode) {
      const expiryStr = localStorage.getItem('auth_token_expiry');
      if (!expiryStr) return 0;
      const expiry = parseInt(expiryStr, 10);
      return Math.max(0, Math.floor((expiry - Date.now()) / 1000));
    }
    
    const decodedToken: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return Math.max(0, decodedToken.exp - currentTime);
  } catch {
    return 0;
  }
}
