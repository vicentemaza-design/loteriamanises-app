import { useCallback, useEffect, useRef, useState } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';

export type ProfileChangeVerificationStatus =
  | 'idle'
  | 'sending'
  | 'sent'
  | 'verifying'
  | 'confirmed'
  | 'invalid_code'
  | 'expired'
  | 'send_error'
  | 'confirm_error';

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * useProfileChangeVerification
 *
 * Drives the "confirm profile change with a 6-digit email code" flow via
 * IApiProvider.profile — see services/api/contracts/profile.contracts.ts.
 * This hook NEVER applies the pending profile changes itself: it only tells
 * the caller whether the code was confirmed (status === 'confirmed'). The
 * caller is responsible for calling AuthContext.updateProfile() with the
 * actual changes ONLY after that, keeping "apply the change" and "confirm
 * the code" as two explicit, sequential steps.
 */
export function useProfileChangeVerification() {
  const [status, setStatus] = useState<ProfileChangeVerificationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownIntervalRef = useRef<number | null>(null);

  const clearCooldownInterval = useCallback(() => {
    if (cooldownIntervalRef.current !== null) {
      window.clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }
  }, []);

  const startCooldown = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    clearCooldownInterval();
    cooldownIntervalRef.current = window.setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearCooldownInterval();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearCooldownInterval]);

  useEffect(() => clearCooldownInterval, [clearCooldownInterval]);

  const sendCode = useCallback(async (email: string): Promise<boolean> => {
    setStatus('sending');
    setErrorMessage(null);
    try {
      const client = await createApiClient();
      await client.profile.requestProfileChangeVerification({ email });
      setStatus('sent');
      startCooldown();
      return true;
    } catch {
      setStatus('send_error');
      setErrorMessage('No hemos podido enviar el código. Inténtalo de nuevo.');
      return false;
    }
  }, [startCooldown]);

  // Returns the resolved outcome directly rather than relying on the caller
  // reading `status` after the await — an async function's closure over
  // `status` is captured at CREATION time, so re-reading it post-await would
  // see a stale value from before this call started, not the fresh one just
  // set below. Callers that need to branch on the outcome (e.g. clear the
  // code box only when it expired) must use this return value, not `status`.
  const confirmCode = useCallback(async (code: string): Promise<ProfileChangeVerificationStatus> => {
    setStatus('verifying');
    setErrorMessage(null);
    try {
      const client = await createApiClient();
      const result = await client.profile.confirmProfileChangeVerification({ code });
      if (result.outcome === 'confirmed') {
        setStatus('confirmed');
        return 'confirmed';
      }
      if (result.outcome === 'expired') {
        setStatus('expired');
        setErrorMessage('El código ha caducado. Solicita uno nuevo.');
        return 'expired';
      }
      setStatus('invalid_code');
      setErrorMessage('El código introducido no es correcto. Inténtalo de nuevo.');
      return 'invalid_code';
    } catch {
      setStatus('confirm_error');
      setErrorMessage('No hemos podido confirmar el cambio. Inténtalo de nuevo.');
      return 'confirm_error';
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
    setResendCooldown(0);
    clearCooldownInterval();
  }, [clearCooldownInterval]);

  return { status, errorMessage, resendCooldown, sendCode, confirmCode, reset };
}
