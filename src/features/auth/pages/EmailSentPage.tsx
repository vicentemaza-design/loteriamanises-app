import { motion } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import { MailOpen } from 'iconoir-react/regular';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthScreenShell } from '@/features/auth/components/AuthScreenShell';

interface RecoverPasswordLocationState {
  email?: string;
}

/**
 * Confirmation screen shown after requesting a password reset.
 *
 * IMPORTANT — the copy is deliberately identical whether or not the email
 * belongs to a real account (anti-enumeration). It only ever echoes back the
 * email the user themselves typed on the previous screen — it never confirms
 * or denies that an account exists for it.
 */
export function EmailSentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as RecoverPasswordLocationState | null)?.email;

  return (
    <AuthScreenShell contentClassName="gap-6 pt-14 justify-center">
      <motion.div className="flex min-h-max flex-col items-center justify-center gap-6 w-full">

        <motion.div className="w-full max-w-sm shrink-0">
          <motion.div className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-2xl p-7 shadow-[0_18px_42px_rgba(0,0,0,0.28)] flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/40 flex items-center justify-center">
              <MailOpen className="w-7 h-7 text-emerald-300" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h1 className="text-white text-xl font-black tracking-tight">Email enviado</h1>
              <p className="text-white/60 text-xs font-medium leading-relaxed max-w-xs">
                Si existe una cuenta asociada a{email ? <> <span className="text-white font-semibold">{email}</span></> : ' este email'}, recibirás las instrucciones para restablecer tu contraseña.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full h-11 rounded-xl font-semibold bg-manises-gold text-manises-blue shadow-gold hover:opacity-90 transition-all text-sm mt-2"
            >
              Volver a iniciar sesión
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AuthScreenShell>
  );
}
