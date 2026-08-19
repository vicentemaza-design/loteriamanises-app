import { useCallback, useState } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { AuthError, getAuthErrorMessage } from '@/features/auth/lib/authErrors';

export type ResendVerificationStatus = 'idle' | 'resending' | 'resent' | 'error' | 'rate_limited' | 'service_unavailable';

/**
 * useResendVerificationEmail
 * Routes through IApiProvider so BE can implement the real operation in
 * HttpAdapter later without any change to VerifyEmailPage.
 */
export function useResendVerificationEmail() {
  const [status, setStatus] = useState<ResendVerificationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resend = useCallback(async (email: string): Promise<boolean> => {
    setStatus('resending');
    setErrorMessage(null);

    try {
      const client = await createApiClient();
      await client.auth.resendVerificationEmail({ email });
      setStatus('resent');
      return true;
    } catch (err) {
      if (err instanceof AuthError && err.code === 'rate_limited') setStatus('rate_limited');
      else if (err instanceof AuthError && err.code === 'service_unavailable') setStatus('service_unavailable');
      else setStatus('error');
      setErrorMessage(getAuthErrorMessage(err));
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  return { status, errorMessage, resend, reset };
}
