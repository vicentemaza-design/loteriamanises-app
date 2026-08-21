/**
 * WebAuthn / Passkey feature detection — FUTURE / NOT IMPLEMENTED.
 *
 * This file only answers "could this browser/device technically support a
 * platform passkey (Face ID, Touch ID, device PIN, etc.)?". It never
 * registers or verifies a credential, never calls
 * `navigator.credentials.create()`/`navigator.credentials.get()`, and never
 * talks to any backend. Real passkey registration/login requires a BE
 * contract that does not exist yet — see docs/be-handoff/passkeys-webauthn.md.
 *
 * Detecting "supported" here is NOT the same as the user having an actual
 * passkey registered for this account — that distinction is exactly
 * `WebAuthnSupport` below (device capability, FE-detectable, this file) vs
 * `PasskeyStatus` (user's real credential state, must come from BE) in
 * src/features/profile/types/profile.types.ts.
 */

export type WebAuthnSupport = 'supported' | 'unsupported' | 'unknown';

/**
 * Synchronous, best-effort check for basic WebAuthn API presence. Safe to
 * call during SSR/build/tests — never throws, never touches the network.
 */
export function getWebAuthnSupport(): WebAuthnSupport {
  if (typeof window === 'undefined') return 'unknown';
  try {
    return 'PublicKeyCredential' in window ? 'supported' : 'unsupported';
  } catch {
    return 'unknown';
  }
}

/**
 * Best-effort async check for a platform authenticator (Face ID, Touch ID,
 * Windows Hello, device PIN, etc.) — still pure feature detection, no
 * credential is created or requested. Resolves `false` on any error or lack
 * of support instead of throwing, so callers can use it directly for UI
 * copy without extra try/catch.
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (getWebAuthnSupport() !== 'supported') return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}
