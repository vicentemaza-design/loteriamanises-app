/**
 * Runtime Configuration
 * Defines which API provider is active and environment settings.
 */

export type ApiProviderType = 'mock' | 'firebase' | 'http';

export const RUNTIME_CONFIG = {
  // Controlled via VITE_API_PROVIDER env var (.env / .env.production / .env.local)
  // 'mock'    → datos locales simulados (demo)
  // 'firebase'→ Firestore en producción
  // 'http'    → REST API (pendiente de implementar)
  apiProvider: ((import.meta.env.VITE_API_PROVIDER as ApiProviderType) || 'mock'),

  // Environment detection
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,

  // App Version
  version: '2.5.0-industrial',
};
