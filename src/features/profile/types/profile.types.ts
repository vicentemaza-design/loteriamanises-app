export type MovementType = 'deposit' | 'bet' | 'prize' | 'withdrawal' | 'adjustment' | 'cancellation';

export interface MovementDetails {
  gameId?: string;
  gameLabel?: string;
  combinations?: string[];
  number?: string;
  quantity?: number;
  shippingCost?: number;
  deliveryMode?: 'custody' | 'shipping';
  iban?: string;
  bankName?: string;
  recipientName?: string;
}

export interface ProfileMovement {
  id: string;
  createdAt: string; // ISO String
  type: MovementType;
  amount: number;
  balanceAfter: number;
  description: string;
  orderId?: string;
  details?: MovementDetails;
}

export interface SubscriptionBet {
  numbers: number[];
  stars?: number[];
  complementario?: number;
  reintegro?: number;
}

export interface GameSubscription {
  id: string;
  gameId: string;
  gameName: string;
  betsCount: number;
  nextChargeDate: string; // ISO String
  amount: number;
  status: 'active' | 'pending-cancel';
  combinations: SubscriptionBet[];
  frequency?: string;
  registeredAt?: string;
  paymentMethod?: string;
  chargeMethod?: string;
}

export interface FavoritePlay {
  id: string;
  gameId: string;
  title: string;
  numbersLabel: string;
  frequency: string;
  budgetLabel: string;
  betsCount: number;
  combinations: SubscriptionBet[];
}

export interface PaymentCard {
  id: string;
  brand: 'Visa' | 'Mastercard' | 'Maestro';
  last4: string;
  expires: string;
  isDefault: boolean;
}

/**
 * `verificationStatus` is the only persistent domain state of a bank
 * account. It does NOT include 'mismatch' | 'unavailable' | 'error' — those
 * are one-off operation outcomes (see BankAccountVerificationOutcome in
 * services/api/contracts/bank-accounts.contracts.ts), never a state the
 * account can sit in.
 */
export type BankAccountVerificationStatus = 'unverified' | 'verified';

export interface BankAccount {
  id: string;
  /** Always masked, e.g. "ES12 **** **** **** 7890" — the full IBAN never lives in this type. */
  ibanMasked: string;
  bank?: string;
  alias?: string;
  isDefault: boolean;
  verificationStatus: BankAccountVerificationStatus;
  /** ISO date. Only meaningful once verificationStatus === 'verified'. */
  verifiedAt?: string;
}

/**
 * @deprecated Legacy mock-only shape (see MOCK_BIOMETRIC_SETTINGS in
 * profile.mock.ts) — not read by any screen. Kept because nothing else was
 * asked to be removed; PasskeyAvailability/PasskeyStatus below are the
 * types actually meant to model this going forward.
 */
export interface BiometricSettings {
  available: boolean;
  enabled: boolean;
}

/**
 * Passkeys/WebAuthn — FUTURE / NOT IMPLEMENTED. See
 * docs/be-handoff/passkeys-webauthn.md for the full contract. Two
 * deliberately separate concerns, intentionally two separate types so
 * neither can be mistaken for the other:
 *
 * A. Technical device/browser capability — 100% detectable client-side,
 *    never implies the user actually has a passkey registered. This is
 *    `WebAuthnSupport` in `src/shared/lib/webauthn.ts` (`'unknown' |
 *    'unsupported' | 'supported'`) — no separate type is declared here to
 *    avoid a second, redundant name for the same concept.
 * B. PasskeyStatus below — the user's real credential state. Must come
 *    from BE; localStorage/any client-only flag is NOT a valid source of
 *    truth for this (see security notes in the handoff doc). Never derive
 *    this from `WebAuthnSupport` — device capability says nothing about
 *    whether a credential was actually registered.
 */
export type PasskeyStatus =
  | 'not_configured' // BE reports no passkey registered for this account
  | 'configured'     // BE reports at least one active passkey credential
  | 'unavailable';   // cannot be determined right now (offline, BE endpoint not implemented yet, etc.)

/**
 * PIN-lock / reauthentication preferences — LOCAL UI GATE ONLY, never a
 * substitute for BE authorization (see
 * docs/be-handoff/security-reauthentication.md). Deliberately has NO
 * `requireOnProfileChange` field: reauthentication before a profile-data
 * edit is a fixed business rule, always on, never user-editable — see
 * `PROFILE_CHANGE_REAUTH_REQUIRED` in `src/features/profile/lib/security.ts`.
 */
export interface SecurityPreferences {
  securityEnabled: boolean;
  requireOnLaunch: boolean;
  requireOnPurchase: boolean;
  requireOnWithdrawal: boolean;
  requireOnTopUp: boolean;
}

/** Actions that can be gated behind a local PIN reauth — see useSecurityGate. */
export type ReauthAction = 'launch' | 'purchase' | 'withdrawal' | 'topUp' | 'profile';

export interface NotificationPreferences {
  push: {
    account: boolean;
    results: boolean;
    jackpots: boolean;
  };
  email: {
    account: boolean;
    marketing: boolean;
  };
  games: Record<string, boolean>; // Config independiente por juego
}

export interface SelfExclusionOption {
  key: string;
  label: string;
  durationDays?: number;
  isPermanent?: boolean;
}

export interface ResponsibleGamingSettings {
  monthlyPlayLimit: number;
  selfExclusion: {
    enabled: boolean;
    optionKey: string;
    expiryDate?: string;
  };
}

export interface DeliveredPrize {
  id: string;
  createdAt: string; // ISO String
  gameName: string;
  prizeAmount: number;
  location?: string;
  description: string;
  imageUrl?: string;
}
