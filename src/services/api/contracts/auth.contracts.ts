import type { ApiResponseDto } from './common.contracts';

/**
 * Auth API Contracts
 */

export interface AuthUserDto {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface UserProfileDto extends AuthUserDto {
  balance: number;
  createdAt: string;
  address?: string;
  postalCode?: string;
  municipality?: string;
  province?: string;
  phone?: string;
  /**
   * Persistent verification state — the ONLY email-verification field that
   * belongs on the user/profile model. Optional so FE never assumes it's
   * populated until BE implements it; once BE does, it flows through the
   * existing getCurrentUser()/profile channel — no separate "status" endpoint.
   */
  emailVerified?: boolean;
}

export type GetProfileResponseDto = ApiResponseDto<UserProfileDto>;

/**
 * Email/password login — reserved for the future HttpAdapter (MySQL backend).
 * Not implemented against Firebase; Google Sign-In continues to be handled
 * directly by AuthProvider (see IApiProvider comment).
 */
export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  user: AuthUserDto;
  profile: UserProfileDto;
  /** Present once BE models email verification. Optional so FE doesn't assume it exists yet. */
  emailVerified?: boolean;
}

/**
 * Password recovery request. BE response must NOT let FE distinguish between
 * "email exists" and "email doesn't exist" — see docs/be-handoff/auth-registration-recovery.md.
 */
export interface RequestPasswordResetInput {
  email: string;
}

export interface RequestPasswordResetResult {
  requested: true;
}

/**
 * Error taxonomy the FE is already prepared to render for auth operations.
 * BE does not need to match these 1:1 with HTTP status codes — the FE maps
 * whatever BE returns onto this set. See handoff doc for details.
 */
export type AuthErrorCode =
  | 'invalid_credentials'
  | 'validation_error'
  | 'technical_error'
  | 'rate_limited'
  | 'service_unavailable'
  | 'email_already_in_use'
  | 'underage';

/**
 * Manual (email/password) registration — reserved for the future HttpAdapter
 * (MySQL backend), same as LoginInput/RequestPasswordResetInput. Not
 * implemented against Firebase; Google Sign-Up continues to be handled
 * directly by AuthProvider and is unaffected by this contract.
 *
 * All client-side validation (password rules, age, document format, phone
 * format) is UX-only. BE MUST re-validate every one of these fields
 * server-side — see docs/be-handoff/auth-registration-recovery.md.
 */
export type DocumentType = 'NIF' | 'NIE' | 'PASSPORT';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  /** ISO date string (YYYY-MM-DD). */
  birthDate: string;
  phone: string;
  acceptTerms: boolean;
  /** Independent, optional consent — must never be inferred from acceptTerms. */
  acceptMarketing: boolean;
}

export interface RegisterResult {
  user: AuthUserDto;
  profile: UserProfileDto;
  /** Always false immediately after registration in this phase — no verification flow exists yet. */
  emailVerified: boolean;
}

/**
 * Email verification — resend / change pending email / consume the link.
 * None implemented against a real backend yet: no email is sent, no token
 * is generated, AuthContext/session is never touched by any of these.
 * See docs/be-handoff/auth-registration-recovery.md.
 *
 * Model split on purpose (see handoff doc):
 *  - emailVerified (UserProfileDto above) is the ONLY persistent user state.
 *  - expired/invalid below are OUTCOMES of a single verify attempt, not
 *    states of the user — they are never written back to the profile.
 */
export interface ResendVerificationEmailInput {
  email: string;
}

export interface ResendVerificationEmailResult {
  sent: true;
}

export interface ChangePendingEmailInput {
  newEmail: string;
}

export interface ChangePendingEmailResult {
  email: string;
}

export interface VerifyEmailInput {
  /** Opaque — FE never decodes/infers anything from it (no userId, no email). */
  token: string;
}

export type VerifyEmailOutcome = 'verified' | 'expired' | 'invalid';

export interface VerifyEmailResult {
  outcome: VerifyEmailOutcome;
}

/**
 * Password reset — consumes the token from the recovery email link together
 * with the new password in a single call (no separate "check token" round
 * trip). Same opaque-token discipline as VerifyEmailInput: FE never decodes
 * it, never infers a userId/email from it. Not implemented against a real
 * backend yet — see docs/be-handoff/auth-email-password.md.
 */
export interface ResetPasswordInput {
  /** Opaque — FE never decodes/infers anything from it (no userId, no email). */
  token: string;
  password: string;
}

/** Same outcome-vs-error split as VerifyEmailResult: 'expired'/'invalid' are outcomes of this one attempt, never persistent user state. */
export type ResetPasswordOutcome = 'reset' | 'expired' | 'invalid';

export interface ResetPasswordResult {
  outcome: ResetPasswordOutcome;
}
