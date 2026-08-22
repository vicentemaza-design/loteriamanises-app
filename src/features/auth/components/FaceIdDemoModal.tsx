import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ScanFace, CheckCircle2 } from 'lucide-react';

const VERIFYING_MS = 1500;
const SUCCESS_MS = 900;

interface FaceIdDemoModalProps {
  isOpen: boolean;
  /** Called once, after the "verificada" state has been shown briefly. The caller is responsible for the actual sign-in (reuses signInDemo — this modal has no auth logic of its own). */
  onVerified: () => void;
}

/**
 * DEMO-ONLY visual simulation of "Entrar con Face ID" — gated by
 * RUNTIME_CONFIG.demoEnabled at the call site (LoginPage.tsx), never
 * rendered here directly. Purely cosmetic: two timed states
 * ("Verificando identidad…" → "Identidad verificada") and nothing else.
 *
 * NOT real biometrics. No navigator.credentials.create()/get(), no
 * WebAuthn, no stored credential, no new token/PIN. See
 * docs/be-handoff/passkeys-webauthn.md for the real (FUTURE/NOT
 * IMPLEMENTED) Passkey preparation this deliberately does not touch.
 */
export function FaceIdDemoModal({ isOpen, onVerified }: FaceIdDemoModalProps) {
  const [phase, setPhase] = useState<'verifying' | 'verified'>('verifying');
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    setPhase('verifying');

    const toVerified = setTimeout(() => setPhase('verified'), VERIFYING_MS);
    const toComplete = setTimeout(() => onVerified(), VERIFYING_MS + SUCCESS_MS);

    return () => {
      clearTimeout(toVerified);
      clearTimeout(toComplete);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[220] flex flex-col items-center justify-center bg-[#052a5a]/95 backdrop-blur-md px-6 text-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="face-id-demo-title"
        >
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10"
            role="status"
            aria-live="polite"
            aria-label={phase === 'verifying' ? 'Verificando identidad' : 'Identidad verificada'}
          >
            {phase === 'verifying' ? (
              <motion.span
                animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
                transition={reduceMotion ? undefined : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ScanFace className="h-10 w-10 text-white" aria-hidden="true" />
              </motion.span>
            ) : (
              <motion.span
                initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <CheckCircle2 className="h-10 w-10 text-emerald-400" aria-hidden="true" />
              </motion.span>
            )}
          </div>

          <h2 id="face-id-demo-title" className="text-lg font-black uppercase tracking-tight text-white">
            {phase === 'verifying' ? 'Verificando identidad…' : 'Identidad verificada'}
          </h2>
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-manises-gold opacity-90">
            Face ID · Modo demo
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
