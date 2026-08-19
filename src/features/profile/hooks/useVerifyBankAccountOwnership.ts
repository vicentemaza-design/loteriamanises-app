import { useCallback, useState } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import type { BankAccount } from '@/features/profile/types/profile.types';

export type VerifyBankAccountStatus = 'idle' | 'verifying' | 'verified' | 'mismatch' | 'unavailable' | 'error';

/**
 * useVerifyBankAccountOwnership
 * Routes through IApiProvider — the FE never decides the outcome, it only
 * renders whatever the provider returns. See mock/bank-accounts.mock.ts for
 * the isolated demo outcomes.
 */
export function useVerifyBankAccountOwnership() {
  const [status, setStatus] = useState<VerifyBankAccountStatus>('idle');

  const verify = useCallback(async (bankAccountId: string): Promise<BankAccount | null> => {
    setStatus('verifying');
    try {
      const client = await createApiClient();
      const result = await client.wallet.bankAccounts.verifyOwnership({ bankAccountId });
      setStatus(result.outcome);
      return result.bankAccount;
    } catch {
      setStatus('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => setStatus('idle'), []);

  return { status, verify, reset };
}
