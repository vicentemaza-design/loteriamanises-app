/**
 * Profile Change Verification API Contracts
 *
 * Gate that requires a 6-digit code, sent to the user's email, before ANY
 * edit made on the account/profile screen is actually persisted. See
 * docs/be-handoff/profile-change-verification.md for the full handoff.
 *
 * Model split on purpose, mirroring auth.contracts.ts's email-verification
 * pattern:
 *  - 'confirmed' / 'invalid' / 'expired' are OUTCOMES of a single confirm
 *    attempt, never persistent user state.
 *  - Only genuine technical failures (network, rate limit, service down)
 *    reject with AuthError (see features/auth/lib/authErrors.ts) — reused
 *    as-is rather than inventing a parallel error type.
 */

export interface RequestProfileChangeVerificationInput {
  /**
   * Email address the 6-digit code is sent to. For most field changes this
   * is the user's current, already-verified email (profile.email) — the FE
   * always sends the code there, never to a value the user just typed and
   * hasn't verified yet.
   *
   * OPEN QUESTION (see be-handoff doc): when the field being changed IS the
   * email itself, should the code go to the OLD (current) address, the NEW
   * one, or both? The FE defaults to the current/verified address (the safer
   * default against account takeover) and does not implement anything else
   * — BE/product must confirm or override this.
   */
  email: string;
}

export interface RequestProfileChangeVerificationResult {
  sent: true;
}

export interface ConfirmProfileChangeVerificationInput {
  /** 6-digit numeric code as entered by the user. Never validated for real client-side. */
  code: string;
}

export type ProfileChangeVerificationOutcome = 'confirmed' | 'invalid' | 'expired';

export interface ConfirmProfileChangeVerificationResult {
  outcome: ProfileChangeVerificationOutcome;
}
