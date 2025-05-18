// This file contains configuration constants for the frontend application

// API base URL
// ...existing code...
export const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000/';

// Authentication settings
export const AUTH_CONFIG = {
  INCLUDE_CREDENTIALS: true,
  SESSION_STORAGE_KEY: 'authData',
  SESSION_TIMEOUT_MINUTES: 60
};

// API Fetch configuration
export const API_CONFIG = {
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  TIMEOUT_MS: 10000, // 10 seconds timeout for API calls
};

// Application metadata
export const APP_NAME: string = 'DeporSM';
export const APP_VERSION: string = '1.0.0';

// Feature flags - easily enable/disable features
export const FEATURES = {
  NOTIFICATIONS: true,
  CHAT: false,
  DARK_MODE: true,
};