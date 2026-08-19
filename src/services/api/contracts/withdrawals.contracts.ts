/**
 * Withdrawals — FE contracts for this phase.
 * See docs/be-handoff/withdrawals.md.
 *
 * Model split on purpose:
 *  - `WithdrawalStatus` ('pending' | 'processing' | 'completed' | 'rejected'
 *    | 'failed') is the DOMAIN/PROCESS state of a withdrawal request — it
 *    lives on WithdrawalDto and is what BE controls.
 *  - UI states ('idle' | 'submitting' | 'error' | 'rate_limited' |
 *    'service_unavailable', see useCreateWithdrawal) describe the CREATE
 *    operation itself, not the withdrawal's lifecycle. Never conflate the two.
 *
 * This phase creates a DEMO withdrawal request only: no real transfer, no
 * authoritative balance change, no ledger, no idempotency guarantee, no
 * provider integration. FE is never authoritative over balance, eligibility,
 * ownership, final amount, limits, fees or final status.
 */

export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'failed';

export interface WithdrawalDto {
  id: string;
  amount: number;
  /** Always masked — e.g. "ES12 **** **** **** 7890". Never the full IBAN. */
  bankAccountMasked: string;
  status: WithdrawalStatus;
  createdAt: string;
  updatedAt?: string;
  /** Only present if BE decides to compute/return one — FE never calculates it. */
  fee?: number;
  /** Only present if BE decides to compute/return one — FE never calculates it. */
  netAmount?: number;
  /** Safe, pre-approved reason for a 'rejected' status — never a raw server/technical error. */
  safeReasonCode?: string;
  safeReasonMessage?: string;
}

export interface CreateWithdrawalInput {
  bankAccountId: string;
  amount: number;
}

export interface CreateWithdrawalResult {
  withdrawal: WithdrawalDto;
  /**
   * Only present if BE decides to return it. Absent by default in this
   * phase's mock — the client-visible balance is never treated as
   * authoritative and is never derived from this field automatically.
   */
  updatedBalance?: number;
}
