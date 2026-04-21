/**
 * Runtime Configuration
 * Defines which API provider is active and environment settings.
 */

export type ApiProviderType = 'mock' | 'firebase' | 'http';

export const RUNTIME_CONFIG = {
  // Toggle this to switch between different data sources
  // 'mock': Use local simulated data (Demo mode)
  // 'firebase': Use live Firebase database
  // 'http': Use future REST API integration
  apiProvider: 'mock' as ApiProviderType,

  // Environment detection
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  
  // App Version
  version: '2.5.0-industrial',
};
