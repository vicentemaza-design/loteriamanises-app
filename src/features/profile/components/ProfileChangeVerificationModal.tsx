import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Loader2, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/Button';
import { OtpInput } from '@/shared/ui/OtpInput';
import { maskEmail } from '@/shared/lib/maskEmail';
import { useProfileChangeVerification } from '@/features/profile/hooks/useProfileChangeVerification';

interface ProfileChangeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Email the code is sent to — already resolved by the caller (see AccountPage). */
  email: string;
  /**
   * Called ONLY after the code is confirmed. This is where the caller
   * actually persists the pending changes (e.g. AuthContext.updateProfile).
   * If it throws, the modal stays open and shows an inline error instead of
   * closing — the code was right, but applying the change itself failed.
   */
  onConfirmed: () => Promise<void>;
}

function formatCooldown(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * ProfileChangeVerificationModal
 *
 * Gate shown before ANY edit on the account/profile screen is persisted:
 * requests a 6-digit code by email on open, and only calls onConfirmed()
 * once that code is verified. Closing/cancelling at any point (X, backdrop,
 * wrong code, expired code, abandoning) leaves the confirmed data exactly
 * as it was — nothing here applies a change on its own.
 */
export function ProfileChangeVerificationModal({ isOpen, onClose, email, onConfirmed }: ProfileChangeVerificationModalProps) {
  const { status, errorMessage, resendCooldown, sendCode, confirmCode, reset } = useProfileChangeVerification();
  const [code, setCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setIsApplying(false);
      setApplyError(false);
      void sendCode(email);
    }
    // sendCode/reset are stable (useCallback) — only re-run when the modal opens/target email changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, email]);

  const handleClose = () => {
    if (isApplying) return; // avoid closing mid-apply
    reset();
    setCode('');
    onClose();
  };

  const handleValidate = async (fullCode: string) => {
    const outcome = await confirmCode(fullCode);
    if (outcome !== 'confirmed') {
      // Wrong code: leave it on screen so the user can see/edit their mistake.
      // Expired: the code itself is no longer usable, so clear it and require a resend.
      if (outcome === 'expired') {
        setCode('');
      }
      return;
    }
    setIsApplying(true);
    setApplyError(false);
    try {
      await onConfirmed();
      reset();
      setCode('');
      onClose();
    } catch {
      setApplyError(true);
    } finally {
      setIsApplying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || status === 'sending') return;
    setCode('');
    const ok = await sendCode(email);
    if (ok) {
      toast.success('Código enviado', { description: 'Hemos enviado un nuevo código a tu email.' });
    }
  };

  const isVerifying = status === 'verifying' || isApplying;
  const isSending = status === 'sending';
  const canValidate = code.length === 6 && !isVerifying;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isVerifying ? handleClose : undefined}
            className="fixed inset-0 z-[90] bg-[#0a4792]/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-verification-title"
            className="fixed bottom-0 left-0 right-0 z-[100] flex max-h-[calc(100dvh-0.75rem)] flex-col rounded-t-[2.5rem] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.15)]"
          >
            <div className="flex w-full shrink-0 justify-center pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-gray-200" />
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-6">
              <div className="mb-5 flex items-start justify-between">
                <div className="flex flex-col items-center text-center w-full gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-manises-blue/20 bg-manises-blue/10 text-manises-blue">
                    <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h3 id="profile-verification-title" className="text-xl font-black text-manises-blue">Confirma el cambio</h3>
                    <p className="max-w-xs text-sm font-semibold leading-relaxed text-slate-500">
                      Te hemos enviado un código de 6 dígitos a tu email.
                      Introdúcelo para confirmar el cambio.
                    </p>
                    <p className="text-sm font-black text-manises-blue">{maskEmail(email)}</p>
                  </div>
                </div>
                {!isVerifying && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    aria-label="Cerrar"
                    className="absolute right-5 top-6 h-10 w-10 shrink-0 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <div className="flex flex-col items-center gap-4">
                <OtpInput
                  value={code}
                  onChange={setCode}
                  onComplete={handleValidate}
                  disabled={isVerifying}
                  error={status === 'invalid_code' || status === 'expired' || applyError}
                  ariaLabel="Código de verificación de 6 dígitos"
                />

                {status === 'invalid_code' && (
                  <div role="alert" aria-live="polite" className="flex w-full items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-left">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                    <p className="text-xs font-semibold text-red-700">{errorMessage}</p>
                  </div>
                )}

                {status === 'expired' && (
                  <div role="alert" aria-live="polite" className="flex w-full items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-left">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                    <p className="text-xs font-semibold text-amber-700">{errorMessage}</p>
                  </div>
                )}

                {(status === 'confirm_error' || applyError) && (
                  <div role="alert" aria-live="polite" className="flex w-full items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-left">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                    <p className="text-xs font-semibold text-red-700">No hemos podido confirmar el cambio. Inténtalo de nuevo.</p>
                  </div>
                )}

                {status === 'send_error' && (
                  <div role="alert" aria-live="polite" className="flex w-full items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-left">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                    <p className="text-xs font-semibold text-red-700">{errorMessage}</p>
                  </div>
                )}

                <div className="text-center">
                  {resendCooldown > 0 ? (
                    <p className="text-xs font-semibold text-slate-400">
                      Puedes reenviar el código en {formatCooldown(resendCooldown)}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isSending || isVerifying}
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-manises-blue hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSending ? 'animate-spin' : ''}`} aria-hidden="true" />
                      {isSending ? 'Enviando...' : 'Reenviar código'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div
              className="shrink-0 border-t border-gray-100 bg-white px-5 pt-3"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
            >
              <Button
                onClick={() => handleValidate(code)}
                disabled={!canValidate}
                className="h-14 w-full rounded-2xl bg-manises-blue text-base font-black text-white shadow-manises hover:bg-[#083d7d] disabled:opacity-40"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                    Validando...
                  </>
                ) : (
                  'VALIDAR CÓDIGO'
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
