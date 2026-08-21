import { useCallback, useState } from 'react';
import type { ReauthAction } from '@/features/profile/types/profile.types';
import {
  getSecurityPreferences,
  isReauthRequiredForPurchase,
  isReauthRequiredForWithdrawal,
  isReauthRequiredForTopUp,
  hasCustomPin,
  isDemoEnvironment,
  PROFILE_CHANGE_REAUTH_REQUIRED,
} from '@/features/profile/lib/security';
import { PinEntryModal } from '@/features/profile/components/PinEntryModal';

// Only applied when a PIN already exists (mode === 'verify') — when the
// person has never created one yet, PinEntryModal's own "create" copy is
// clearer than forcing this text onto a creation step.
const VERIFY_COPY: Partial<Record<ReauthAction, { title: string; description: string }>> = {
  profile: {
    title: 'Confirma tu identidad',
    description: 'Por seguridad, siempre pedimos tu PIN antes de modificar tus datos.',
  },
};

/**
 * Local reauthentication gate for sensitive in-flow actions (purchase,
 * withdrawal, top-up, profile edits). NOT app-launch — that's AppLock,
 * wired directly in PrivateLayout.tsx.
 *
 * `requireReauth('profile')` ALWAYS asks for the PIN, regardless of
 * `securityEnabled` or any toggle — this mirrors the fixed business rule in
 * `PROFILE_CHANGE_REAUTH_REQUIRED` (see security.ts). The other actions
 * only gate when the user opted in via SecurityPage.
 *
 * This is a LOCAL UI GATE ONLY. A resolved `true` means "the PIN matched
 * locally", never "the backend authorized this operation" — callers must
 * still go through their normal BE-validated flow afterwards (e.g. the
 * existing OTP modal for profile changes). See
 * docs/be-handoff/security-reauthentication.md.
 *
 * No universal fallback PIN exists in production (see security.ts). If the
 * person hasn't created a PIN yet:
 * - demo/QA (isDemoEnvironment()): opens in "verify" mode, where verifyPin()
 *   accepts the well-known `1234` purely as a testing convenience.
 * - production: opens PinEntryModal in "create" mode instead — they
 *   create+confirm a real PIN right there, and that creation itself is what
 *   resolves the gate (fail closed: an unconfigured PIN never lets anyone
 *   through silently in a real build).
 */
export function useSecurityGate() {
  const [pendingAction, setPendingAction] = useState<ReauthAction | null>(null);
  const [pendingMode, setPendingMode] = useState<'create' | 'verify'>('verify');
  const [resolver, setResolver] = useState<((ok: boolean) => void) | null>(null);

  const requireReauth = useCallback((action: ReauthAction): Promise<boolean> => {
    const prefs = getSecurityPreferences();
    const needed = action === 'profile'
      ? PROFILE_CHANGE_REAUTH_REQUIRED
      : action === 'purchase'
        ? isReauthRequiredForPurchase(prefs)
        : action === 'withdrawal'
          ? isReauthRequiredForWithdrawal(prefs)
          : action === 'topUp'
            ? isReauthRequiredForTopUp(prefs)
            : false; // 'launch' is handled by AppLock/PrivateLayout, not this gate

    if (!needed) return Promise.resolve(true);

    return new Promise<boolean>((resolve) => {
      // No custom PIN yet: demo/QA still opens "verify" (1234 works there —
      // see verifyPin()); production must create a real PIN first.
      setPendingMode(hasCustomPin() || isDemoEnvironment() ? 'verify' : 'create');
      setPendingAction(action);
      setResolver(() => resolve);
    });
  }, []);

  const handleSuccess = () => {
    resolver?.(true);
    setPendingAction(null);
    setResolver(null);
  };

  const handleClose = () => {
    resolver?.(false);
    setPendingAction(null);
    setResolver(null);
  };

  const copy = pendingMode === 'verify' && pendingAction ? VERIFY_COPY[pendingAction] : undefined;

  const gateModal = (
    <PinEntryModal
      isOpen={pendingAction !== null}
      mode={pendingMode}
      title={copy?.title}
      description={copy?.description}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );

  return { requireReauth, gateModal };
}
