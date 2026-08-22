import type {
  LoginInput,
  LoginResult,
  RegisterInput,
  RegisterResult,
  RequestPasswordResetInput,
  RequestPasswordResetResult,
  ResendVerificationEmailInput,
  ResendVerificationEmailResult,
  ChangePendingEmailInput,
  ChangePendingEmailResult,
  VerifyEmailInput,
  VerifyEmailResult,
  ResetPasswordInput,
  ResetPasswordResult,
} from '../../contracts/auth.contracts';
import { AuthError } from '@/features/auth/lib/authErrors';

/**
 * Mock Auth Adapter
 *
 * Email/password login is NOT implemented against Firebase or any backend —
 * this mock exists only so the LoginPage form is fully wired end-to-end for
 * the demo, while making it explicit (via AuthError) that no real
 * authentication happens here. It never creates a session; it never touches
 * localStorage. The only real login path remains Google (see AuthProvider).
 */
export async function loginWithEmailMock(_input: LoginInput): Promise<LoginResult> {
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new AuthError('service_unavailable'));
    }, 600);
  });
}

/**
 * Password recovery mock — always resolves the same way regardless of the
 * email provided, matching the anti-enumeration behavior BE must implement.
 * No token is generated and no email is actually sent.
 */
export async function requestPasswordResetMock(_input: RequestPasswordResetInput): Promise<RequestPasswordResetResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ requested: true });
    }, 600);
  });
}

/**
 * Registration mock — resolves so the 3-step wizard can be demoed end to
 * end, but this is explicitly NOT a real account:
 *  - the returned uid/profile are synthetic, generated client-side;
 *  - the password, document number, birth date and phone from `input` are
 *    never persisted anywhere (not returned, not logged, not stored);
 *  - no session is created — AuthContext/RequireAuth are untouched, the
 *    caller is still logged out after this resolves;
 *  - emailVerified is always false (no verification flow exists yet).
 */
export async function registerMock(input: RegisterInput): Promise<RegisterResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const uid = `mock-${Math.random().toString(36).slice(2, 10)}`;
      const displayName = `${input.firstName} ${input.lastName}`.trim();
      resolve({
        user: { uid, email: input.email, displayName },
        profile: { uid, email: input.email, displayName, balance: 0, createdAt: new Date().toISOString() },
        emailVerified: false,
      });
    }, 800);
  });
}

/**
 * Resend verification email — always succeeds in the demo, regardless of
 * the email provided. No real email is sent, no token is generated. Never
 * touches AuthContext/session.
 */
export async function resendVerificationEmailMock(_input: ResendVerificationEmailInput): Promise<ResendVerificationEmailResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ sent: true });
    }, 700);
  });
}

// Reserved demo value to exercise the "email already in use" rejection path
// from the UI — NOT a real duplicate-detection mechanism. Anything else succeeds.
const DEMO_EMAIL_ALREADY_IN_USE = 'usado@example.com';

/**
 * Change the pending (unverified) email — resolves with the new email so the
 * UI can update immediately. Does NOT create another account, does NOT
 * persist the email anywhere, does NOT touch Firebase/AuthContext. One
 * reserved demo address (see above) rejects with 'email_already_in_use' so
 * the error UX can be demoed; every other value succeeds.
 */
export async function changePendingEmailMock(input: ChangePendingEmailInput): Promise<ChangePendingEmailResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (input.newEmail.trim().toLowerCase() === DEMO_EMAIL_ALREADY_IN_USE) {
        reject(new AuthError('email_already_in_use'));
        return;
      }
      resolve({ email: input.newEmail.trim() });
    }, 700);
  });
}

// Explicit, isolated demo tokens — the ONLY values this mock recognizes.
// Never decodes/infers anything from the token; any unrecognized value is
// treated as 'invalid' (safe default — an unrecognized token must never
// silently verify the account).
const DEMO_TOKEN_OUTCOMES: Record<string, VerifyEmailResult['outcome']> = {
  'demo-success': 'verified',
  'demo-expired': 'expired',
  'demo-invalid': 'invalid',
};

/**
 * Consume a verification link token. Purely a demo lookup against the 3
 * explicit strings above — never persists anything, never creates a
 * session, never marks any real account as verified.
 */
export async function verifyEmailMock(input: VerifyEmailInput): Promise<VerifyEmailResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ outcome: DEMO_TOKEN_OUTCOMES[input.token] ?? 'invalid' });
    }, 900);
  });
}

// Explicit, isolated demo tokens for password reset — the ONLY values this
// mock recognizes. Same token strings as DEMO_TOKEN_OUTCOMES above (kept as
// a separate map because the outcome type differs: 'reset' vs 'verified').
// Any unrecognized value defaults to 'invalid' — fail closed.
const DEMO_RESET_TOKEN_OUTCOMES: Record<string, ResetPasswordResult['outcome']> = {
  'demo-success': 'reset',
  'demo-expired': 'expired',
  'demo-invalid': 'invalid',
};

/**
 * Consume a password-reset link token + new password. Purely a demo lookup
 * against the 3 explicit tokens above — never persists the new password
 * anywhere, never creates a session, never logs the user in.
 */
export async function resetPasswordMock(input: ResetPasswordInput): Promise<ResetPasswordResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ outcome: DEMO_RESET_TOKEN_OUTCOMES[input.token] ?? 'invalid' });
    }, 900);
  });
}
