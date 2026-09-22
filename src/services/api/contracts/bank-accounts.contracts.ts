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
 *  - `lastFailedVerification` RECUERDA el último intento fallido. Sigue sin
 *    ser un estado de la cuenta —verificationStatus solo tiene dos valores—
 *    pero sin esto el usuario que falló ayer abre hoy la app y solo ve un
 *    "Pendiente de verificar" que no explica nada: ni que se intentó, ni por
 *    qué falló, ni qué hacer. El aviso del intento vivía únicamente en el
 *    panel transitorio de la pantalla de retirada y desaparecía al salir.
 *    Se limpia en cuanto un intento sale 'verified'.
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
  /**
   * Último intento de verificación que NO salió bien. Presente solo
   * mientras verificationStatus sea 'unverified'; un intento 'verified'
   * lo borra. BE debe devolverlo con la cuenta para que la UI pueda
   * explicar por qué sigue sin verificar.
   */
  lastFailedVerification?: FailedVerificationAttempt;
}

/** Un intento fallido, con su motivo y cuándo fue. */
export interface FailedVerificationAttempt {
  outcome: Exclude<BankAccountVerificationOutcome, 'verified'>;
  /** ISO date-time del intento. */
  at: string;
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

export interface DeleteBankAccountInput {
  bankAccountId: string;
}

export interface DeleteBankAccountResult {
  /**
   * The remaining accounts after deletion, so the caller never has to
   * separately re-derive default/ordering client-side. If the deleted
   * account was the default one, no other account is auto-promoted — see
   * deleteBankAccountMock: minimal, explicit rule, nothing invented.
   */
  accounts: BankAccountDto[];
}

export interface SetDefaultBankAccountInput {
  bankAccountId: string;
}

export interface SetDefaultBankAccountResult {
  /** The full list, already reflecting the single new default. */
  accounts: BankAccountDto[];
}
