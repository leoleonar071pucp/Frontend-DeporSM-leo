import { API_BASE_URL } from './config';
import { TokenResponse, getAccessToken, isTokenExpired } from './auth-utils';

/**
 * Auth API client
 * 
 * Provides specialized methods for authentication operations
 */
export class AuthApiClient {
  /**
   * Login a user and get tokens
   */
  static async login(email: string, password: string): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    return response.json();
  }
  /**
   * Refresh the access token
   */
  static async refreshToken(): Promise<TokenResponse> {
    const token = getAccessToken();
    const refreshToken = getRefreshToken();
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const tokenResponse = await response.json();
    
    // Update stored tokens
    storeTokens(tokenResponse.accessToken, tokenResponse.refreshToken, tokenResponse.user);
    
    return tokenResponse;
  }

  /**
   * Logout the user
   */
  static async logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get current user information
   */
  static async getCurrentUser(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to get user: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Check authentication status and refresh token if needed
   */
  static async checkAuthStatus(): Promise<any> {
    try {
      // First try getting user from session
      const userData = await this.getCurrentUser();
      return userData;
    } catch (error) {
      console.log('Session-based auth failed, trying token refresh');
      
      // If session check fails, try using refresh token
      if (!isTokenExpired()) {
        try {
          const refreshData = await this.refreshToken();
          return refreshData.user;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw refreshError;
        }
      }
      
      // If token is expired, propagate the error
      throw error;
    }
  }
  
  /**
   * Add auth headers to request
   */
  static addAuthHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }
}
