import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { OtpInput } from '@/shared/ui/OtpInput';
import { createPin, verifyPin } from '@/features/profile/lib/security';

const PIN_LENGTH = 4;

// Posición vertical de la tarjeta dentro del visualViewport visible: no se
// centra a partir del punto medio, se desplaza a la mitad superior (offset
// de arriba pequeño, no pegado al borde) y se reserva un margen inferior de
// seguridad para que, sea cual sea la altura del teclado en ese momento, la
// tarjeta nunca llegue a tocar su borde superior. Ambos valores se restan de
// viewport.height — nunca de window.innerHeight — así que si el teclado
// cambia de altura, la tarjeta se recoloca dentro del rectángulo visible.
const POPUP_TOP_BIAS_RATIO = 0.12;
const POPUP_MIN_TOP_OFFSET_PX = 16;
const POPUP_BOTTOM_SAFE_MARGIN_PX = 24;

interface PinEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * 'verify' — checks a PIN already set (or the MVP default) and calls
   * onSuccess() only if it matches. 'create' — walks through "enter new
   * PIN" then "confirm PIN" and only calls onSuccess() once both match and
   * the new PIN has been stored (as a hash, see security.ts).
   */
  mode: 'create' | 'verify';
  title?: string;
  description?: string;
  onSuccess: () => void;
}

/**
 * Reusable 4-digit PIN modal — the single place that knows how to ask for
 * or set the local PIN, reused by useSecurityGate (verify) and SecurityPage
 * (create/change). LOCAL UI GATE ONLY: matching the PIN never talks to any
 * backend and never proves anything to it — see
 * docs/be-handoff/security-reauthentication.md.
 */
export function PinEntryModal({ isOpen, onClose, mode, title, description, onSuccess }: PinEntryModalProps) {
  const [step, setStep] = useState<'entry' | 'confirm'>('entry');
  const [value, setValue] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [viewport, setViewport] = useState<{ height: number | null; offsetTop: number }>({
    height: null,
    offsetTop: 0,
  });
  const sheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('entry');
      setValue('');
      setFirstPin('');
      setError(null);
      setIsBusy(false);
    }
  }, [isOpen]);

  // Mientras el modal está abierto, sigue el visualViewport para que el
  // teclado numérico de iOS no tape los 4 dígitos ni el mensaje de error —
  // sin esto, el modal (fixed bottom-0) queda anclado al viewport de layout,
  // que no se reduce cuando aparece el teclado en iOS Safari/PWA. Listeners
  // solo mientras isOpen; se retiran al cerrar/desmontar para no acumular.
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

  // Foco controlado: OtpInput recibe autoFocus={false} (ver más abajo) para
  // que iOS no dispare su propio scroll-to-reveal al enfocar automáticamente
  // en el mount. En su lugar, se enfoca aquí con preventScroll tras un doble
  // rAF (deja que el layout con el visualViewport ya asentado se pinte
  // antes de enfocar), evitando que el documento se desplace al buscar el
  // input — el modal ya está posicionado sobre el teclado por el wrapper
  // ligado al visualViewport, no hace falta que el navegador lo revele.
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

  const handleClose = () => {
    if (isBusy) return;
    onClose();
  };

  const handleVerifyComplete = async (pin: string) => {
    setIsBusy(true);
    try {
      const ok = await verifyPin(pin);
      setIsBusy(false);
      if (ok) {
        onSuccess();
      } else {
        setError('PIN incorrecto. Inténtalo de nuevo.');
        setValue('');
      }
    } catch {
      // Si verifyPin lanza inesperadamente, no dejar el modal atascado en
      // "ocupado" (handleClose ignora el cierre mientras isBusy es true).
      setIsBusy(false);
    }
  };

  const handleCreateFirstComplete = (pin: string) => {
    setFirstPin(pin);
    setValue('');
    setError(null);
    setStep('confirm');
  };

  const handleCreateConfirmComplete = async (pin: string) => {
    if (pin !== firstPin) {
      setError('Los PIN no coinciden. Inténtalo de nuevo.');
      setValue('');
      setFirstPin('');
      setStep('entry');
      return;
    }
    setIsBusy(true);
    try {
      await createPin(pin);
      setIsBusy(false);
      onSuccess();
    } catch {
      // Igual que en handleVerifyComplete: un throw inesperado de createPin
      // no debe dejar el modal atascado en "ocupado".
      setIsBusy(false);
    }
  };

  const handleComplete = mode === 'verify'
    ? handleVerifyComplete
    : step === 'entry' ? handleCreateFirstComplete : handleCreateConfirmComplete;

  // Offset superior derivado de viewport.height (nunca de window.innerHeight):
  // manda la tarjeta a la mitad superior de la zona visible, no al centro
  // exacto, dejando siempre POPUP_BOTTOM_SAFE_MARGIN_PX libres respecto al
  // borde inferior real del visualViewport (el borde superior del teclado).
  const popupTopOffsetPx = viewport.height != null
    ? Math.max(viewport.height * POPUP_TOP_BIAS_RATIO, POPUP_MIN_TOP_OFFSET_PX)
    : 0;

  const heading = title ?? (mode === 'verify' ? 'Confirma tu PIN' : step === 'entry' ? 'Crea un PIN de seguridad' : 'Confirma tu PIN');
  const subtext = description ?? (
    mode === 'verify'
      ? 'Introduce tu PIN de 4 dígitos para continuar.'
      : step === 'entry'
        ? 'Elige un PIN de 4 dígitos para proteger tu app.'
        : 'Vuelve a introducirlo para confirmarlo.'
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* z-[270]/[271]: este gate se abre desde GamesCartPanel/
              LotteryCartPanel (requireReauth('purchase')) y desde el propio
              TopUpModal (requireReauth('topUp'), z-[261]) — ambos carritos
              (z-[200]) y la cadena de recarga (TopUpModal/AddCardFlow/
              RedsysGateway, z-[261]/[262]/[263]) deben quedar SIEMPRE
              debajo. z-[90]/[100] (valor original) solo funcionaba por
              casualidad de anidación JSX en GamesCartPanel (el modal queda
              nested dentro de su div z-[200], así que no compite con él) —
              en LotteryCartPanel, donde es un hermano de ese div en el mismo
              fragment, quedaba tapado y no era clicable. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isBusy ? handleClose : undefined}
            className="fixed inset-0 z-[270] bg-manises-blue/40 backdrop-blur-sm"
          />
          {/* Wrapper ligado al visualViewport (no al layout viewport, no a
              window.innerHeight, no a bottom:0): en iOS, cuando aparece el
              teclado, visualViewport es el único que refleja la zona
              realmente visible. La tarjeta se alinea arriba (items-start)
              dentro de ESE rectángulo, con paddingTop = popupTopOffsetPx
              (mitad superior, no el centro exacto) y paddingBottom =
              POPUP_BOTTOM_SAFE_MARGIN_PX — ambos derivados de
              viewport.height, así que si el teclado cambia de altura la
              tarjeta se recalcula dentro de la nueva zona visible, nunca
              pegada a su borde inferior. pointer-events-none en el wrapper
              para no bloquear clics fuera de la tarjeta; la tarjeta
              recupera pointer-events-auto. */}
          <div
            className="fixed left-0 right-0 z-[271] flex items-start justify-center px-4 pointer-events-none"
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
              aria-labelledby="pin-entry-title"
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
                    <h3 id="pin-entry-title" className="text-xl font-black text-manises-blue">{heading}</h3>
                    <p className="max-w-xs text-sm font-semibold leading-relaxed text-slate-500">{subtext}</p>
                  </div>
                </div>
                {!isBusy && (
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
                  length={PIN_LENGTH}
                  value={value}
                  onChange={setValue}
                  onComplete={handleComplete}
                  // Deliberately NOT disabled while isBusy: verifyPin/createPin
                  // are local-only (Web Crypto, no network) and effectively
                  // instant, and a disabled <input> loses focus in the
                  // browser with nothing to restore it — that would strand
                  // the user after a wrong PIN with no visible way to retry
                  // without manually tapping a box again.
                  error={!!error}
                  ariaLabel="PIN de seguridad de 4 dígitos"
                  // autoFocus propio desactivado: el foco lo controla este
                  // componente (ver useEffect de arriba) con preventScroll,
                  // para que iOS no dispare su scroll-to-reveal al enfocar.
                  autoFocus={false}
                  // Único <input> real: el foco del DOM nunca cambia de
                  // elemento entre dígitos (causa física del "pim, pim" en
                  // iOS, no solo visual) — solo aquí; ProfileChangeVerification
                  // sigue con un input por casilla.
                  singleInputMode
                />

                {error && (
                  <div role="alert" aria-live="polite" className="flex w-full items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-left">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                    <p className="text-xs font-semibold text-red-700">{error}</p>
                  </div>
                )}

                {isBusy && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Comprobando...
                  </div>
                )}
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
