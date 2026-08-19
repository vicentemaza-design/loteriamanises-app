import { useCallback, useState } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { AuthError, getAuthErrorMessage } from '@/features/auth/lib/authErrors';
import { isValidEmail } from '@/features/auth/lib/authValidation';
import type { ChangePendingEmailResult } from '@/services/api/contracts/auth.contracts';

export type ChangePendingEmailStatus = 'idle' | 'submitting' | 'success' | 'error' | 'rate_limited' | 'service_unavailable';

/**
 * useChangePendingEmail
 * Changes the email of a not-yet-verified account. Routes through
 * IApiProvider — see auth.mock.ts for the demo behavior (no other account
 * is created, nothing is persisted, Firebase/AuthContext are untouched).
 */
export function useChangePendingEmail() {
  const [status, setStatus] = useState<ChangePendingEmailStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const changeEmail = useCallback(async (newEmail: string): Promise<ChangePendingEmailResult | null> => {
    const trimmed = newEmail.trim();

    if (!trimmed || !isValidEmail(trimmed)) {
      setStatus('error');
      setErrorMessage('Introduce un email válido.');
      return null;
    }

    setStatus('submitting');
    setErrorMessage(null);

    try {
      const client = await createApiClient();
      const result = await client.auth.changePendingEmail({ newEmail: trimmed });
      setStatus('success');
      return result;
    } catch (err) {
      if (err instanceof AuthError && err.code === 'rate_limited') setStatus('rate_limited');
      else if (err instanceof AuthError && err.code === 'service_unavailable') setStatus('service_unavailable');
      else setStatus('error');
      setErrorMessage(getAuthErrorMessage(err));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  return { status, errorMessage, changeEmail, reset };
}
