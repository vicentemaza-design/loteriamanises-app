import type {
  RequestProfileChangeVerificationInput,
  RequestProfileChangeVerificationResult,
  ConfirmProfileChangeVerificationInput,
  ConfirmProfileChangeVerificationResult,
} from '../../contracts/profile.contracts';
import { AuthError } from '@/features/auth/lib/authErrors';

/**
 * MOCK — Profile change verification (OTP by email)
 *
 * Demo-only, deterministic behavior so the confirmation flow can be tested
 * end to end without a real backend. Never persists anything, never touches
 * AuthContext/Firestore directly — the caller (useProfileChangeVerification)
 * only applies the pending changes via AuthContext.updateProfile() AFTER
 * this mock resolves with outcome 'confirmed'. This file must never be
 * treated as an authority on whether a change is actually allowed — that is
 * BE's job once implemented (see docs/be-handoff/profile-change-verification.md).
 */

// Reserved demo email to exercise the "couldn't send" error path from the UI —
// NOT a real send-failure detector. Any other email "succeeds".
const DEMO_EMAIL_SEND_ERROR = 'error-envio@example.com';

/**
 * Explicit, isolated demo codes — the ONLY values this mock recognizes.
 * Never inferred from anything real; any unrecognized 6-digit code is
 * treated as 'invalid' (safe default — an unrecognized code must never
 * silently confirm the change).
 */
export const DEMO_OTP_CODE_CORRECT = '123456';
export const DEMO_OTP_CODE_EXPIRED = '000000';

export async function requestProfileChangeVerificationMock(
  input: RequestProfileChangeVerificationInput
): Promise<RequestProfileChangeVerificationResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (input.email.trim().toLowerCase() === DEMO_EMAIL_SEND_ERROR) {
        reject(new AuthError('service_unavailable', 'No hemos podido enviar el código. Inténtalo de nuevo.'));
        return;
      }
      resolve({ sent: true });
    }, 700);
  });
}

export async function confirmProfileChangeVerificationMock(
  input: ConfirmProfileChangeVerificationInput
): Promise<ConfirmProfileChangeVerificationResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (input.code === DEMO_OTP_CODE_EXPIRED) {
        resolve({ outcome: 'expired' });
        return;
      }
      if (input.code === DEMO_OTP_CODE_CORRECT) {
        resolve({ outcome: 'confirmed' });
        return;
      }
      resolve({ outcome: 'invalid' });
    }, 900);
  });
}
