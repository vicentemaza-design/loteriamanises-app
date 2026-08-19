import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { ArrowLeft, Mail, WarningTriangle } from 'iconoir-react/regular';
import { useNavigate } from 'react-router-dom';
import { AuthScreenShell } from '@/features/auth/components/AuthScreenShell';
import { usePasswordRecovery } from '@/features/auth/hooks/usePasswordRecovery';

export function RecoverPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const { status, errorMessage, requestReset, reset } = usePasswordRecovery();

  const isLoading = status === 'loading';

  // Navigate to the confirmation screen once the request succeeds — kept in
  // an effect (rather than inline in the submit handler) so the transition
  // happens the same way regardless of how `status` became 'success'.
  useEffect(() => {
    if (status === 'success') {
      navigate('/recover-password/sent', { state: { email }, replace: true });
    }
  }, [status, email, navigate]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (status === 'error') reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestReset(email);
  };

  return (
    <AuthScreenShell contentClassName="gap-6 pt-14">
      <motion.div className="flex min-h-max flex-col items-center justify-start gap-6 w-full">

        <div className="w-full max-w-sm flex flex-col items-center gap-6 px-1">
          {/* Botón Volver — mismo patrón que Registro */}
          <motion.button
            onClick={() => navigate('/login')}
            className="self-start flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Volver</span>
          </motion.button>

          <div className="text-center space-y-1.5">
            <h1 className="text-white text-2xl font-black tracking-tight">Recupera tu contraseña</h1>
            <p className="text-white/50 text-xs font-medium max-w-xs mx-auto leading-relaxed">
              Introduce el email de tu cuenta y te enviaremos instrucciones para restablecer tu contraseña.
            </p>
          </div>
        </div>

        <motion.div className="w-full max-w-sm shrink-0">
          <motion.div className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_18px_42px_rgba(0,0,0,0.28)]">
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div>
                <label htmlFor="recover-email" className="sr-only">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" aria-hidden="true" />
                  <Input
                    id="recover-email"
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    disabled={isLoading}
                    className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl focus-visible:ring-manises-gold text-sm"
                    value={email}
                    onChange={handleEmailChange}
                  />
                </div>
              </div>

              {status === 'error' && errorMessage && (
                <div role="alert" aria-live="polite" className="flex items-start gap-2 rounded-xl border border-red-400/40 bg-red-400/10 px-3 py-2.5">
                  <WarningTriangle className="w-4 h-4 mt-0.5 text-red-300 shrink-0" aria-hidden="true" />
                  <p className="text-[11px] font-semibold text-red-100">{errorMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl font-semibold bg-manises-gold text-manises-blue shadow-gold hover:opacity-90 transition-all text-sm"
              >
                {isLoading ? 'Enviando...' : 'Enviar email'}
              </Button>
            </form>

            <p className="text-center text-xs text-white/40 mt-5 font-medium">
              ¿Ya te acuerdas?{' '}
              <button
                type="button"
                className="text-manises-gold font-semibold hover:underline"
                onClick={() => navigate('/login')}
              >
                Volver a iniciar sesión
              </button>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AuthScreenShell>
  );
}
