import { useCallback, useState } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { getAuthErrorMessage } from '@/features/auth/lib/authErrors';
import type { RegisterInput, RegisterResult } from '@/services/api/contracts/auth.contracts';

export type RegisterStatus = 'idle' | 'validating' | 'submitting' | 'success' | 'error';

/**
 * useRegister
 * Manual (email/password) registration. Routes through IApiProvider so BE
 * can implement the real operation in HttpAdapter later without any change
 * to RegisterPage.
 *
 * NOTE: today only the mock adapter resolves (with a synthetic, clearly-demo
 * result — see auth.mock.ts); firebase/http both reject with an explicit
 * "not implemented" AuthError. No real account is created anywhere.
 */
export function useRegister() {
  const [status, setStatus] = useState<RegisterStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const register = useCallback(async (input: RegisterInput): Promise<RegisterResult | null> => {
    setStatus('submitting');
    setErrorMessage(null);

    try {
      const client = await createApiClient();
      const result = await client.auth.register(input);
      setStatus('success');
      return result;
    } catch (err) {
      setStatus('error');
      setErrorMessage(getAuthErrorMessage(err));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  return { status, errorMessage, register, reset };
}
