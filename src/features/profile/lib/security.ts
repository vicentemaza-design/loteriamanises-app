import type { SecurityPreferences } from '../types/profile.types';
import { RUNTIME_CONFIG } from '@/config/runtime';

/**
 * Local PIN-lock / reauthentication preferences.
 *
 * IMPORTANT — this is a LOCAL UI GATE ONLY (a device screen-lock), never a
 * substitute for server-side authorization. It decides whether the app asks
 * the person holding the device to re-enter a PIN before continuing with a
 * sensitive screen/action. It is NOT secure server authorization, NOT bank
 * authentication, and NOT payment authorization: matching the PIN proves
 * nothing to the backend, and the backend MUST independently re-validate
 * every sensitive operation (purchase, withdrawal, top-up, profile change)
 * regardless of what happened on this screen. See
 * docs/be-handoff/security-reauthentication.md.
 *
 * There is no universal fallback PIN in production. A single demo/QA-only
 * convenience PIN (`1234`) exists, gated by the exact same explicit flag
 * already used to show/hide "Entrar en modo demo (sin cuenta)" on
 * LoginPage.tsx (`RUNTIME_CONFIG.demoEnabled`, from
 * VITE_ENABLE_DEMO_ACCESS — see src/config/runtime.ts). This is a
 * dedicated, explicit-opt-in flag — deliberately NOT `apiProvider ===
 * 'mock'`, since that one defaults to 'mock' whenever VITE_API_PROVIDER is
 * simply left unset (to keep local dev/data-adapter behaviour unchanged),
 * which would otherwise silently enable demo-only UI/PIN in any
 * unconfigured build. It never depends on `import.meta.env.DEV` alone,
 * since a Vercel demo build can be a production build. See
 * isDemoEnvironment()/verifyPin() below.
 */

const SECURITY_PREFS_STORAGE_KEY = 'app_security_preferences';
const PIN_HASH_STORAGE_KEY = 'app_pin_hash';
/** Demo/QA-only convenience PIN — see isDemoEnvironment(). Never valid once a custom PIN exists, never valid outside the explicit demo environment. */
const DEMO_QA_PIN = '1234';

/**
 * Reuses the exact same explicit flag that gates the demo-login button on
 * LoginPage.tsx (`RUNTIME_CONFIG.demoEnabled`). Absent/unconfigured builds
 * — including one where only VITE_API_PROVIDER was forgotten — always
 * return false here: fail closed by default, opt-in only.
 */
export function isDemoEnvironment(): boolean {
  return RUNTIME_CONFIG.demoEnabled;
}

export const DEFAULT_SECURITY_PREFERENCES: SecurityPreferences = {
  securityEnabled: false,
  requireOnLaunch: true,
  requireOnPurchase: false,
  requireOnWithdrawal: true,
  requireOnTopUp: false,
};

/**
 * Fixed business rule, NOT a user preference — see section 4 of the client
 * request: reauthentication before editing profile data is mandatory and
 * cannot be disabled, independently of `securityEnabled` or any other
 * toggle. Exported as a constant (rather than a field on
 * SecurityPreferences) precisely so no UI can ever render a switch for it.
 */
export const PROFILE_CHANGE_REAUTH_REQUIRED = true as const;

export function getSecurityPreferences(): SecurityPreferences {
  try {
    const raw = localStorage.getItem(SECURITY_PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_SECURITY_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SECURITY_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_SECURITY_PREFERENCES;
  }
}

export function saveSecurityPreferences(prefs: SecurityPreferences): void {
  localStorage.setItem(SECURITY_PREFS_STORAGE_KEY, JSON.stringify(prefs));
}

export function isReauthRequiredForLaunch(prefs: SecurityPreferences): boolean {
  return prefs.securityEnabled && prefs.requireOnLaunch;
}

export function isReauthRequiredForPurchase(prefs: SecurityPreferences): boolean {
  return prefs.securityEnabled && prefs.requireOnPurchase;
}

export function isReauthRequiredForWithdrawal(prefs: SecurityPreferences): boolean {
  return prefs.securityEnabled && prefs.requireOnWithdrawal;
}

export function isReauthRequiredForTopUp(prefs: SecurityPreferences): boolean {
  return prefs.securityEnabled && prefs.requireOnTopUp;
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * True once the person has explicitly created their own PIN. Callers (see
 * useSecurityGate) check this before deciding how to gate an action: if
 * false AND not in the demo environment, walk the person through creating
 * one first (PinEntryModal mode="create") rather than calling verifyPin()
 * expecting a real PIN to already exist.
 */
export function hasCustomPin(): boolean {
  return localStorage.getItem(PIN_HASH_STORAGE_KEY) !== null;
}

/**
 * Stores only a SHA-256 hash of the PIN, never the plain digits — the
 * closest thing to "not plaintext" available in this pure-frontend
 * architecture (there is no OS keychain/secure-enclave API exposed to a
 * web app). This is still just a local deterrent, not real cryptographic
 * protection: a 4-digit PIN has only 10,000 possibilities, so the hash
 * cannot be treated as secret-proof — it only avoids storing/displaying
 * the literal digits at rest.
 */
export async function createPin(pin: string): Promise<void> {
  const hash = await sha256Hex(pin);
  localStorage.setItem(PIN_HASH_STORAGE_KEY, hash);
}

/**
 * If a custom PIN exists, ONLY that PIN is ever accepted — `1234` is never
 * a backdoor once the person has created their own (e.g. custom PIN 2468:
 * "2468" → true, "1234" → false).
 *
 * If no custom PIN exists yet: in the demo/QA environment (see
 * isDemoEnvironment()) the well-known `1234` is accepted purely as a
 * testing convenience; in a real BE/production build it is never accepted
 * — this fails closed, and callers must route to `createPin` first (see
 * useSecurityGate, which checks `hasCustomPin()` before deciding whether to
 * open "create" or "verify").
 */
export async function verifyPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_HASH_STORAGE_KEY);
  if (stored) {
    const hash = await sha256Hex(pin);
    return hash === stored;
  }
  return isDemoEnvironment() && pin === DEMO_QA_PIN;
}
