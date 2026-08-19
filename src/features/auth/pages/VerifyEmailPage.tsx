import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Mail, MailOpen, Pencil, RefreshCw, CheckCircle2, AlertTriangle, Clock, Inbox } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthScreenShell } from '@/features/auth/components/AuthScreenShell';
import { useResendVerificationEmail } from '@/features/auth/hooks/useResendVerificationEmail';
import { useChangePendingEmail } from '@/features/auth/hooks/useChangePendingEmail';

interface RegisterLocationState {
  email?: string;
}

/**
 * Shown immediately after a successful (mock) registration.
 *
 * IMPORTANT — this phase does NOT implement real email verification: no
 * token is generated, no email is actually sent, emailVerified is never
 * flipped to true here. Both "Reenviar email" and "Cambiar email" are wired
 * end to end through IApiProvider (see useResendVerificationEmail /
 * useChangePendingEmail), but the mock adapter is the only implementation —
 * firebase/http both reject with an explicit "not implemented" AuthError.
 *
 * View states rendered here (see section 6 of the handoff doc):
 *  - no email in location.state → dedicated fallback screen (not part of the
 *    named state list below — see the early return).
 *  - mode === 'view'   → idle | resending | resent | error | rate_limited | service_unavailable
 *                        (driven by useResendVerificationEmail's status)
 *  - mode === 'change-email' → the inline change-email form (this IS the
 *                        'changing_email' state from the spec)
 */
export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = (location.state as RegisterLocationState | null)?.email;

  const [email, setEmail] = useState(initialEmail ?? '');
  const [mode, setMode] = useState<'view' | 'change-email'>('view');
  const [newEmailInput, setNewEmailInput] = useState('');

  const { status: resendStatus, errorMessage: resendError, resend, reset: resetResend } = useResendVerificationEmail();
  const { status: changeStatus, errorMessage: changeError, changeEmail, reset: resetChange } = useChangePendingEmail();

  // ── FALLBACK: refresh / direct access with no verification pending in this
  // session. Deliberately does NOT try to recover the email from storage —
  // location.state is the only source of truth for this phase.
  if (!initialEmail) {
    return (
      <AuthScreenShell contentClassName="gap-6 pt-14 justify-center">
        <motion.div className="flex min-h-max flex-col items-center justify-center gap-6 w-full">
          <motion.div className="w-full max-w-sm shrink-0">
            <motion.div className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-2xl p-7 shadow-[0_18px_42px_rgba(0,0,0,0.28)] flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Inbox className="w-7 h-7 text-white/50" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h1 className="text-white text-xl font-black tracking-tight">Sin verificación pendiente</h1>
                <p className="text-white/60 text-xs font-medium leading-relaxed max-w-xs">
                  No tenemos una verificación pendiente en esta sesión.
                </p>
              </div>
              <div className="w-full flex flex-col gap-2 mt-2">
                <Button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full h-11 rounded-xl font-semibold bg-manises-gold text-manises-blue shadow-gold hover:opacity-90 transition-all text-sm"
                >
                  Volver a iniciar sesión
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate('/register')}
                  variant="outline"
                  className="w-full h-11 rounded-xl font-semibold border-white/15 bg-white/5 text-white hover:bg-white/10 text-sm"
                >
                  Volver al registro
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AuthScreenShell>
    );
  }

  const handleResend = async () => {
    await resend(email);
  };

  const handleStartChangeEmail = () => {
    setMode('change-email');
    setNewEmailInput('');
    resetChange();
  };

  const handleCancelChangeEmail = () => {
    setMode('view');
    resetChange();
  };

  const handleSubmitChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await changeEmail(newEmailInput);
    if (result) {
      setEmail(result.email);
      setMode('view');
      resetResend();
    }
  };

  const isChanging = changeStatus === 'submitting';
  const isResending = resendStatus === 'resending';

  return (
    <AuthScreenShell contentClassName="gap-6 pt-14 justify-center">
      <motion.div className="flex min-h-max flex-col items-center justify-center gap-6 w-full">
        <motion.div className="w-full max-w-sm shrink-0">
          <motion.div className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-2xl p-7 shadow-[0_18px_42px_rgba(0,0,0,0.28)] flex flex-col items-center text-center gap-4">

            {mode === 'view' ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-manises-gold/10 border border-manises-gold/40 flex items-center justify-center">
                  <MailOpen className="w-7 h-7 text-manises-gold" aria-hidden="true" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-white text-xl font-black tracking-tight">Verifica tu email</h1>
                  <p className="text-white/60 text-xs font-medium leading-relaxed max-w-xs">
                    Tu cuenta se ha creado correctamente. Hemos enviado un email de verificación a{' '}
                    <span className="text-white font-semibold">{email}</span>.
                  </p>
                  <p className="text-white/40 text-[10.5px] font-medium leading-relaxed max-w-xs">
                    Ya puedes entrar y consultar sorteos. Para retirar premios necesitarás verificar tu email e identidad.
                  </p>
                </div>

                {resendStatus === 'resent' && (
                  <div role="status" aria-live="polite" className="w-full flex items-start gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3 py-2.5 text-left">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-300 shrink-0" aria-hidden="true" />
                    <p className="text-[11px] font-semibold text-emerald-100">Te hemos enviado un nuevo email de verificación.</p>
                  </div>
                )}

                {resendStatus === 'rate_limited' && (
                  <div role="alert" aria-live="polite" className="w-full flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2.5 text-left">
                    <Clock className="w-4 h-4 mt-0.5 text-amber-300 shrink-0" aria-hidden="true" />
                    <p className="text-[11px] font-semibold text-amber-100">{resendError}</p>
                  </div>
                )}

                {(resendStatus === 'error' || resendStatus === 'service_unavailable') && (
                  <div role="alert" aria-live="polite" className="w-full flex items-start gap-2 rounded-xl border border-red-400/40 bg-red-400/10 px-3 py-2.5 text-left">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-red-300 shrink-0" aria-hidden="true" />
                    <p className="text-[11px] font-semibold text-red-100">{resendError}</p>
                  </div>
                )}

                <div className="w-full flex flex-col gap-2 mt-2">
                  <Button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    variant="outline"
                    className="w-full h-11 rounded-xl font-semibold border-white/15 bg-white/5 text-white hover:bg-white/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} aria-hidden="true" />
                    {isResending ? 'Enviando...' : 'Reenviar email'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleStartChangeEmail}
                    variant="ghost"
                    className="w-full h-11 rounded-xl font-semibold text-white/50 hover:text-white flex items-center justify-center gap-2"
                  >
                    <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                    Cambiar email
                  </Button>
                </div>

                <Button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full h-11 rounded-xl font-semibold bg-manises-gold text-manises-blue shadow-gold hover:opacity-90 transition-all text-sm mt-1"
                >
                  Entrar
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-white/70" aria-hidden="true" />
                </div>

                <div className="space-y-1">
                  <h1 className="text-white text-xl font-black tracking-tight">Cambiar email</h1>
                  <p className="text-white/60 text-xs font-medium leading-relaxed max-w-xs">
                    Introduce el nuevo email al que quieres recibir la verificación.
                  </p>
                </div>

                <form onSubmit={handleSubmitChangeEmail} className="w-full space-y-3" noValidate>
                  <div>
                    <label htmlFor="new-email" className="sr-only">Nuevo email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" aria-hidden="true" />
                      <Input
                        id="new-email"
                        type="email"
                        placeholder="Nuevo email"
                        autoComplete="email"
                        disabled={isChanging}
                        aria-invalid={changeStatus === 'error'}
                        aria-describedby={changeStatus === 'error' ? 'new-email-error' : undefined}
                        className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl focus-visible:ring-manises-gold text-sm text-left"
                        value={newEmailInput}
                        onChange={(e) => { setNewEmailInput(e.target.value); if (changeStatus === 'error') resetChange(); }}
                      />
                    </div>
                    {changeStatus === 'error' && changeError && (
                      <p id="new-email-error" role="alert" className="text-[11px] text-red-300 font-semibold mt-1 text-left">{changeError}</p>
                    )}
                    {changeStatus === 'rate_limited' && (
                      <p role="alert" className="text-[11px] text-amber-300 font-semibold mt-1 text-left">{changeError}</p>
                    )}
                    {changeStatus === 'service_unavailable' && (
                      <p role="alert" className="text-[11px] text-red-300 font-semibold mt-1 text-left">{changeError}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelChangeEmail}
                      disabled={isChanging}
                      className="flex-1 h-11 border-white/15 bg-white/5 text-white hover:bg-white/10 rounded-xl"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isChanging}
                      className="flex-1 h-11 bg-manises-gold text-manises-blue font-black rounded-xl shadow-gold disabled:opacity-50"
                    >
                      {isChanging ? 'Guardando...' : 'Confirmar'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AuthScreenShell>
  );
}
