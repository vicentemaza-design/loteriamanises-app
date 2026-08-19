import { useCallback, useState } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { WithdrawalError, getWithdrawalErrorMessage } from '@/features/profile/lib/withdrawalErrors';
import type { CreateWithdrawalInput, WithdrawalDto } from '@/services/api/contracts/withdrawals.contracts';

export type CreateWithdrawalStatus = 'idle' | 'submitting' | 'success' | 'error' | 'rate_limited' | 'service_unavailable';

/**
 * useCreateWithdrawal
 * Creates a DEMO withdrawal request through IApiProvider. `status` here
 * describes the CREATE operation only (UI state) — the resulting
 * `withdrawal.status` (pending/processing/completed/rejected/failed) is a
 * separate, domain-level concept the caller reads off the returned DTO.
 *
 * The `submitting` guard below blocks a second call while one is in
 * flight — this is a UX safeguard against double-clicks only, NOT real
 * idempotency. BE must implement idempotency server-side.
 */
export function useCreateWithdrawal() {
  const [status, setStatus] = useState<CreateWithdrawalStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [withdrawal, setWithdrawal] = useState<WithdrawalDto | null>(null);

  const submit = useCallback(async (input: CreateWithdrawalInput): Promise<WithdrawalDto | null> => {
    if (status === 'submitting') return null;

    setStatus('submitting');
    setErrorMessage(null);

    try {
      const client = await createApiClient();
      const result = await client.wallet.createWithdrawal(input);
      setWithdrawal(result.withdrawal);
      setStatus('success');
      return result.withdrawal;
    } catch (err) {
      if (err instanceof WithdrawalError && err.code === 'rate_limited') setStatus('rate_limited');
      else if (err instanceof WithdrawalError && err.code === 'service_unavailable') setStatus('service_unavailable');
      else setStatus('error');
      setErrorMessage(getWithdrawalErrorMessage(err));
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
    setWithdrawal(null);
  }, []);

  return { status, errorMessage, withdrawal, submit, reset };
}
