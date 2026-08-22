import { useCallback, useState } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { getAuthErrorMessage } from '@/features/auth/lib/authErrors';

export type ResetPasswordStatus = 'idle' | 'submitting' | 'success' | 'expired' | 'invalid' | 'error';

/**
 * useResetPasswordToken
 * Consumes an opaque password-reset link token together with the new
 * password, in a single call to IApiProvider. 'success' / 'expired' /
 * 'invalid' are OUTCOMES of this one operation, not persistent user state.
 * 'error' is the only genuine failure case (network/rate-limit/validation).
 * Never logs the user in — a successful reset only means the password
 * changed; the user still goes through the normal login afterwards.
 */
export function useResetPasswordToken() {
  const [status, setStatus] = useState<ResetPasswordStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = useCallback(async (token: string, password: string) => {
    setStatus('submitting');
    setErrorMessage(null);

    try {
      const client = await createApiClient();
      const result = await client.auth.resetPassword({ token, password });
      setStatus(result.outcome === 'reset' ? 'success' : result.outcome);
    } catch (err) {
      setStatus('error');
      setErrorMessage(getAuthErrorMessage(err));
    }
  }, []);

  const backToForm = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  return { status, errorMessage, submit, backToForm };
}
