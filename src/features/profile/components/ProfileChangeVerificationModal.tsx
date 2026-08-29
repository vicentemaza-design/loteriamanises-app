import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Loader2, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/Button';
import { OtpInput } from '@/shared/ui/OtpInput';
import { maskEmail } from '@/shared/lib/maskEmail';
import { useProfileChangeVerification } from '@/features/profile/hooks/useProfileChangeVerification';

// Mismas tres constantes que src/features/profile/components/PinEntryModal.tsx
// (duplicadas a propósito, no extraídas a un módulo compartido — cambio
// mínimo pedido, sin refactor amplio): posicionan la tarjeta en la mitad
// superior del visualViewport visible con un margen de seguridad respecto al
// teclado, en vez de centrarla en el punto medio exacto.
const POPUP_TOP_BIAS_RATIO = 0.12;
const POPUP_MIN_TOP_OFFSET_PX = 16;
const POPUP_BOTTOM_SAFE_MARGIN_PX = 24;

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
  const [viewport, setViewport] = useState<{ height: number | null; offsetTop: number }>({
    height: null,
    offsetTop: 0,
  });
  const sheetRef = useRef<HTMLDivElement | null>(null);

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

  // Mismo patrón que PinEntryModal.tsx: sigue window.visualViewport (no el
  // layout viewport, no window.innerHeight) para que el teclado numérico de
  // iOS no tape el código ni el mensaje de error.
  useEffect(() => {
    if (!isOpen || !window.visualViewport) return;

    const vv = window.visualViewport;
    const updateViewport = () => {
      setViewport({ height: vv.height, offsetTop: vv.offsetTop });
    };
    updateViewport();
    vv.addEventListener('resize', updateViewport);
    vv.addEventListener('scroll', updateViewport);
    return () => {
      vv.removeEventListener('resize', updateViewport);
      vv.removeEventListener('scroll', updateViewport);
    };
  }, [isOpen]);

  // Mismo patrón que PinEntryModal.tsx: OtpInput recibe autoFocus={false} y
  // el foco se controla aquí con preventScroll tras un doble rAF, para que
  // iOS no dispare su propio scroll-to-reveal al enfocar en el mount.
  useEffect(() => {
    if (!isOpen) return;
    let frame1 = 0;
    let frame2 = 0;
    frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        sheetRef.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
      });
    });
    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [isOpen]);

  // Offset superior derivado de viewport.height (nunca de window.innerHeight):
  // manda la tarjeta a la mitad superior de la zona visible, no al centro
  // exacto, dejando siempre POPUP_BOTTOM_SAFE_MARGIN_PX libres respecto al
  // borde inferior real del visualViewport (el borde superior del teclado).
  const popupTopOffsetPx = viewport.height != null
    ? Math.max(viewport.height * POPUP_TOP_BIAS_RATIO, POPUP_MIN_TOP_OFFSET_PX)
    : 0;

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
            className="fixed inset-0 z-[90] bg-manises-blue/40 backdrop-blur-sm"
          />
          {/* Mismo wrapper que PinEntryModal.tsx: ligado al visualViewport
              (no a window.innerHeight, no a bottom:0), tarjeta alineada
              arriba (items-start) con paddingTop/paddingBottom derivados de
              popupTopOffsetPx/POPUP_BOTTOM_SAFE_MARGIN_PX — mitad superior
              de la zona visible, siempre por encima del teclado. */}
          <div
            className="fixed left-0 right-0 z-[100] flex items-start justify-center px-4 pointer-events-none"
            style={{
              top: viewport.height != null ? `${viewport.offsetTop}px` : 0,
              height: viewport.height != null ? `${viewport.height}px` : '100dvh',
              paddingTop: viewport.height != null ? `${popupTopOffsetPx}px` : '12vh',
              paddingBottom: `${POPUP_BOTTOM_SAFE_MARGIN_PX}px`,
            }}
          >
            <motion.div
              ref={sheetRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-verification-title"
              className="pointer-events-auto relative flex w-full max-w-sm flex-col rounded-[1.75rem] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
              style={{
                maxHeight: viewport.height != null
                  ? `${Math.max(viewport.height - popupTopOffsetPx - POPUP_BOTTOM_SAFE_MARGIN_PX, 240)}px`
                  : 'calc(100dvh - 12vh - 2rem)',
              }}
            >
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-6 pb-6">
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
                  // Mismo patrón que PinEntryModal.tsx: foco controlado por
                  // el efecto de arriba (preventScroll), único input real
                  // superpuesto a las 6 casillas visuales — sin focus()
                  // entre dígitos.
                  autoFocus={false}
                  singleInputMode
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

            <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-3">
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
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
