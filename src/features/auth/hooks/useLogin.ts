import { useCallback, useState } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { getAuthErrorMessage } from '@/features/auth/lib/authErrors';
import { isValidEmail } from '@/features/auth/lib/authValidation';
import type { LoginResult } from '@/services/api/contracts/auth.contracts';

export type LoginStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * useLogin
 * Email/password login. Routes through IApiProvider so BE can implement the
 * real operation in HttpAdapter later without any change to LoginPage.
 *
 * NOTE: today every adapter rejects this call (mock: explicit "not available
 * yet" error; firebase/http: explicit stub) — there is no real email/password
 * session anywhere in the app. Wiring a successful result into AuthContext is
 * intentionally left for when BE actually implements the operation.
 */
export function useLogin() {
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult | null> => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setStatus('error');
      setErrorMessage('Introduce tu email y contraseña.');
      return null;
    }

    if (!isValidEmail(trimmedEmail)) {
      setStatus('error');
      setErrorMessage('Introduce un email válido.');
      return null;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const client = await createApiClient();
      const result = await client.auth.loginWithEmail({ email: trimmedEmail, password });
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

  return { status, errorMessage, login, reset };
}
