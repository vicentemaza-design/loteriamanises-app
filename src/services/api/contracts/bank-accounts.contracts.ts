/**
 * Bank account verification — FE contracts for this phase.
 * See docs/be-handoff/bank-account-verification.md.
 *
 * Model split on purpose:
 *  - `verificationStatus` ('unverified' | 'verified') is the ONLY
 *    persistent domain state of a bank account.
 *  - The result of a single `verifyOwnership()` attempt
 *    ('verified' | 'mismatch' | 'unavailable' | 'error') is an OPERATION
 *    OUTCOME, never written back as account state — except that a
 *    'verified' outcome is what moves the account's persistent
 *    verificationStatus to 'verified'. 'mismatch' / 'unavailable' / 'error'
 *    never touch verificationStatus; the account simply stays 'unverified'.
 *
 * This phase does not implement real ownership verification: no bank
 * provider is integrated, no titularity comparison happens in FE, no real
 * withdrawal/balance operation is triggered by any of this.
 */

export type BankAccountVerificationStatus = 'unverified' | 'verified';

export type BankAccountVerificationOutcome = 'verified' | 'mismatch' | 'unavailable' | 'error';

export interface BankAccountDto {
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

export interface AddBankAccountInput {
  /**
   * Full IBAN as typed by the user (spaces allowed). This is the only
   * point where the raw value exists — adapters must mask it before
   * storing/returning and must never log it. FE has already run UX-level
   * format + checksum validation before calling this; BE must re-validate
   * server-side.
   */
  iban: string;
  bank?: string;
  alias?: string;
}

export interface AddBankAccountResult {
  bankAccount: BankAccountDto;
}

export interface VerifyBankAccountInput {
  bankAccountId: string;
}

export interface VerifyBankAccountResult {
  outcome: BankAccountVerificationOutcome;
  bankAccount: BankAccountDto;
}
