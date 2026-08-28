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
  // NOTE: defaults to 'mock' when unset — this is the DATA adapter choice,
  // not a security/visibility flag. Do not use this to gate demo-only UI
  // (see demoEnabled below) — an unconfigured production build would
  // otherwise silently expose demo-only affordances.
  apiProvider: ((import.meta.env.VITE_API_PROVIDER as ApiProviderType) || 'mock'),

  // Environment detection
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,

  /**
   * Single source of truth for demo-only UI/behaviour: the "Entrar en modo
   * demo (sin cuenta)" login button (LoginPage.tsx) and the demo/QA-only
   * PIN shortcut (features/profile/lib/security.ts). Explicit opt-in only
   * — controlled via VITE_ENABLE_DEMO_ACCESS, which must be the literal
   * string 'true'. Absent, empty, or any other value is `false` (fail
   * closed): an unconfigured production build, or a build where only
   * VITE_API_PROVIDER was forgotten (defaulting to 'mock' above), never
   * exposes demo-only UI just because the data adapter happens to be mock.
   * Set VITE_ENABLE_DEMO_ACCESS=true only for the Vercel demo/QA deployment.
   *
   * RAMA EXPERIMENTAL SOLAMENTE (debug/ios-keyboard-scroll-recovery): el
   * Preview de Vercel de esta rama no tiene VITE_ENABLE_DEMO_ACCESS
   * configurado (esa variable solo está puesta en el entorno Production
   * del proyecto), así que sin este override no aparece el botón de modo
   * demo y no se puede entrar a probar el fix en el iPhone. Forzado a
   * `true` aquí solo para permitir la prueba física. NUNCA mergear este
   * override a main.
   */
  demoEnabled: true,

  // App Version
  version: '2.5.0-industrial',
};
