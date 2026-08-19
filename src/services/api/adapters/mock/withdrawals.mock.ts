import type {
  CreateWithdrawalInput,
  CreateWithdrawalResult,
  WithdrawalStatus,
} from '../../contracts/withdrawals.contracts';
import { WithdrawalError } from '@/features/profile/lib/withdrawalErrors';
import { readStoredAccounts } from './bank-accounts.mock';

/**
 * MockAdapter — withdrawals.
 *
 * Demo-only: does NOT execute any real transfer, does NOT create a ledger,
 * does NOT re-validate real ownership, does NOT modify any authoritative
 * balance, does NOT touch Firebase/Firestore. There is no polling — every
 * status this can represent is returned synchronously as the one-shot
 * result of createWithdrawalMock, purely so a demo can show every outcome
 * without a real async backend.
 *
 * Demo outcome switch, isolated to this file and controlled by reserved
 * `amount` values (not a security mechanism — see IApiProvider doc comment).
 * Any other amount resolves as a normal 'pending' request.
 */
const DEMO_STATUS_TRIGGERS: Record<string, WithdrawalStatus> = {
  '13.13': 'rejected',
  '14.14': 'failed',
  '15.15': 'processing',
  '16.16': 'completed',
};

let demoCounter = 0;

export async function createWithdrawalMock(input: CreateWithdrawalInput): Promise<CreateWithdrawalResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const amountKey = input.amount.toFixed(2);

      if (amountKey === '17.17') {
        reject(new WithdrawalError('rate_limited'));
        return;
      }
      if (amountKey === '18.18') {
        reject(new WithdrawalError('service_unavailable'));
        return;
      }

      const status = DEMO_STATUS_TRIGGERS[amountKey] ?? 'pending';
      const account = readStoredAccounts().find((a) => a.id === input.bankAccountId);
      const now = new Date().toISOString();

      demoCounter += 1;

      resolve({
        withdrawal: {
          id: `wd-demo-${Date.now()}-${demoCounter}`,
          amount: input.amount,
          bankAccountMasked: account?.ibanMasked ?? 'ES?? **** **** **** ????',
          status,
          createdAt: now,
          updatedAt: status !== 'pending' ? now : undefined,
          ...(status === 'rejected'
            ? { safeReasonCode: 'demo_rejected', safeReasonMessage: 'La operación no ha podido validarse (demo).' }
            : {}),
        },
      });
    }, 900);
  });
}
