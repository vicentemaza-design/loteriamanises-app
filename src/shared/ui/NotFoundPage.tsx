import { motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { AuthScreenShell } from '@/features/auth/components/AuthScreenShell';
import manisesIsotipo from '@/assets/brand/manises-isotipo.png';

const BALLS = ['4', '0', '4'];

/**
 * Wildcard 404 — matches any URL nothing else did. Deliberately outside
 * PublicLayout/PrivateLayout/RequireAuth (same reasoning as the "*" route
 * it replaces): it must render identically with or without a session, and
 * never depend on auth state resolving first. "Volver al inicio" navigates
 * to "/", which PublicLayout already redirects to "/home" for a signed-in
 * or demo user — the auth-aware routing decision stays there, not duplicated
 * here.
 *
 * Reuses AuthScreenShell — the exact background/overlay treatment of
 * Login/Register — for brand coherence, but renders none of its
 * auth-specific content (no Google button, no email/password fields, no
 * register footer). Only the isotipo (symbol) is shown, never the full
 * "manises lotería" wordmark, so this never reads as an access screen.
 */
export function NotFoundPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  return (
    <AuthScreenShell contentClassName="justify-center text-center">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        {/* Isotipo real de Lotería Manises — solo el símbolo, nunca el logotipo completo "manises lotería" */}
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-manises">
          <img src={manisesIsotipo} alt="Lotería Manises" className="h-8 w-auto object-contain" />
        </div>

        {/* Bolas "4 · 0 · 4" — mismo lenguaje visual que las bolas de ticket (BallSelection) */}
        <div className="mb-6 flex items-center gap-3">
          {BALLS.map((digit, i) => (
            <motion.div
              key={i}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/20 bg-white text-lg font-black text-manises-blue shadow-manises"
              animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }
              }
            >
              {digit}
            </motion.div>
          ))}
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-manises-gold opacity-90">
          404 · Página no encontrada
        </p>
        <h1 className="mt-2 text-xl font-black uppercase tracking-tight text-white">
          Este número no ha salido
        </h1>
        <p className="mt-2 max-w-70 text-sm font-medium text-white/60">
          Parece que esta combinación no existe. Comprueba el enlace o vuelve al inicio.
        </p>

        <PremiumTouchInteraction scale={0.96} className="mt-8">
          <Button
            className="h-12 rounded-xl bg-white px-8 font-semibold text-manises-blue shadow-manises hover:bg-gray-50"
            // '/home', no '/' — ver Header.tsx: '/' es el Login.
            onClick={() => navigate('/home')}
          >
            Volver al inicio
          </Button>
        </PremiumTouchInteraction>
      </motion.div>
    </AuthScreenShell>
  );
}
