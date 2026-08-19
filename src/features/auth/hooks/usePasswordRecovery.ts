import { useCallback, useState } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { getAuthErrorMessage } from '@/features/auth/lib/authErrors';
import { isValidEmail } from '@/features/auth/lib/authValidation';

export type PasswordRecoveryStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * usePasswordRecovery
 * Requests a password reset for the given email. Routes through
 * IApiProvider so BE can implement the real operation later without any
 * change to RecoverPasswordPage/EmailSentPage.
 *
 * The mock adapter always resolves successfully, regardless of whether the
 * email is registered — this mirrors the anti-enumeration behavior BE must
 * implement for the real endpoint (see docs/be-handoff/auth-registration-recovery.md).
 */
export function usePasswordRecovery() {
  const [status, setStatus] = useState<PasswordRecoveryStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestReset = useCallback(async (email: string): Promise<boolean> => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setStatus('error');
      setErrorMessage('Introduce tu email.');
      return false;
    }

    if (!isValidEmail(trimmedEmail)) {
      setStatus('error');
      setErrorMessage('Introduce un email válido.');
      return false;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const client = await createApiClient();
      await client.auth.requestPasswordReset({ email: trimmedEmail });
      setStatus('success');
      return true;
    } catch (err) {
      setStatus('error');
      setErrorMessage(getAuthErrorMessage(err));
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  return { status, errorMessage, requestReset, reset };
}
