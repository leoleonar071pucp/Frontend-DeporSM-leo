/**
 * Utility for caching configuration values
 */

import { ConfiguracionGeneral } from './api-configuracion';

class ConfigCache {
  private cache: { [key: string]: any } = {};
  private expiryTime: number = 15 * 60 * 1000; // 15 minutes
  private lastFetchTime: number = 0;

  // Check if cache is valid
  isValid(): boolean {
    return (
      Object.keys(this.cache).length > 0 &&
      Date.now() - this.lastFetchTime < this.expiryTime
    );
  }

  // Store configuration in cache
  set(config: ConfiguracionGeneral): void {
    this.cache = { ...config };
    this.lastFetchTime = Date.now();
  }

  // Get configuration from cache
  get(): ConfiguracionGeneral | null {
    if (!this.isValid()) return null;
    return this.cache as ConfiguracionGeneral;
  }

  // Clear cache
  clear(): void {
    this.cache = {};
    this.lastFetchTime = 0;
  }
}

// Export a singleton instance
export const configCache = new ConfigCache();
