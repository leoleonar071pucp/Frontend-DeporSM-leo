/**
 * Environment configuration variables for authentication
 * 
 * This file configures authentication settings that can be adjusted
 * based on the environment (development vs production)
 */

/**
 * Constants that should be available at build time
 */
export const AUTH_CONSTANTS = {
  // Session duration in minutes
  SESSION_DURATION_MINUTES: 60,
  
  // Token refresh threshold in seconds (refresh when < 5 min remaining)
  TOKEN_REFRESH_THRESHOLD_SECONDS: 300,
  
  // Cookie settings
  COOKIES: {
    REFRESH_TOKEN: "refresh_token",
    SESSION_ID: "JSESSIONID",
    CSRF: "XSRF-TOKEN"
  }
};

/**
 * Helper function to determine environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Helper function to determine if running in a browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get the current hostname in a way that works in both browser and SSR
 */
export function getHostname(): string {
  if (!isBrowser()) {
    return isProduction() ? 'deporsm-apiwith-1035693188565.us-central1.run.app' : 'localhost';
  }
  return window.location.hostname;
}

/**
 * Configuration object for environment variables
 */
export const ENV_CONFIG = {
  isLocalhost: isBrowser() && window.location.hostname === 'localhost',
  isProd: isProduction(),
  origin: isBrowser() ? window.location.origin : undefined
};
