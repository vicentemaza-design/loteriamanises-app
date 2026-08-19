import { useCallback, useState } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { getAuthErrorMessage } from '@/features/auth/lib/authErrors';

export type VerifyEmailTokenStatus = 'verifying' | 'verified' | 'expired' | 'invalid' | 'error';

/**
 * useVerifyEmailToken
 * Consumes an opaque verification-link token via IApiProvider. 'verified' /
 * 'expired' / 'invalid' are OUTCOMES of this one operation, not persistent
 * user state — nothing here is written back to UserProfile. 'error' is the
 * only genuine failure case (network/rate-limit/service-unavailable).
 */
export function useVerifyEmailToken() {
  const [status, setStatus] = useState<VerifyEmailTokenStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verify = useCallback(async (token: string) => {
    setStatus('verifying');
    setErrorMessage(null);

    try {
      const client = await createApiClient();
      const result = await client.auth.verifyEmail({ token });
      setStatus(result.outcome);
    } catch (err) {
      setStatus('error');
      setErrorMessage(getAuthErrorMessage(err));
    }
  }, []);

  return { status, errorMessage, verify };
}
