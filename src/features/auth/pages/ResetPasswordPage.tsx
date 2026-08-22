import { useRef, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { AuthScreenShell } from '@/features/auth/components/AuthScreenShell';
import { PasswordRequirementsList } from '@/features/auth/components/PasswordRequirementsList';
import { isPasswordValid } from '@/features/auth/lib/passwordRules';
import { passwordsMatch } from '@/features/auth/lib/registerValidation';
import { useResetPasswordToken } from '@/features/auth/hooks/useResetPasswordToken';

type FieldErrors = Partial<Record<'password' | 'confirmPassword', string>>;

/**
 * Standalone route (see AppRouter.tsx) representing the password-reset link
 * a user receives by email — same reasoning as VerifyEmailLinkPage.tsx:
 * deliberately NOT nested under PublicLayout (would redirect an
 * authenticated/demo user away before they could use it) nor under
 * RequireAuth (must also work for a logged-out user, which is the normal
 * case for this link).
 *
 * The token in the URL is opaque: never decoded, never logged, never used
 * to infer identity. The token is only consumed together with the new
 * password in a single client.auth.resetPassword() call — there is no
 * separate "check token" step. A successful reset does NOT log the user
 * in automatically; it only means the password changed, and the user goes
 * through the normal login afterwards.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { status, submit, backToForm } = useResetPasswordToken();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const isSubmitting = status === 'submitting';

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!password) next.password = 'Introduce una contraseña.';
    else if (!isPasswordValid(password)) next.password = 'La contraseña no cumple los requisitos.';

    if (!confirmPassword) next.confirmPassword = 'Repite la contraseña.';
    else if (!passwordsMatch(password, confirmPassword)) next.confirmPassword = 'Las contraseñas no coinciden.';

    setErrors(next);
    if (next.password) passwordInputRef.current?.focus();
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;
    await submit(token ?? '', password);
  };

  const formView = (
    <motion.div className="w-full max-w-sm shrink-0">
      <motion.div className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_18px_42px_rgba(0,0,0,0.28)]">
        <div className="text-center mb-5">
          <h1 className="text-white text-xl font-black tracking-tight">Crea una nueva contraseña</h1>
          <p className="text-white/50 text-xs font-medium max-w-xs mx-auto leading-relaxed mt-1.5">
            Elige una contraseña nueva para tu cuenta de Lotería Manises.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <div>
            <label htmlFor="reset-password" className="sr-only">Nueva contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" aria-hidden="true" />
              <Input
                ref={passwordInputRef}
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nueva contraseña"
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'reset-password-error' : undefined}
                className="pl-10 pr-11 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl focus-visible:ring-manises-gold text-sm"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manises-gold/40"
              >
                {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
            <PasswordRequirementsList password={password} />
            {errors.password && <p id="reset-password-error" role="alert" className="text-[11px] text-red-300 font-semibold mt-1 pl-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="reset-confirm-password" className="sr-only">Confirmar contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" aria-hidden="true" />
              <Input
                id="reset-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmar contraseña"
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? 'reset-confirm-password-error' : undefined}
                className="pl-10 pr-11 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl focus-visible:ring-manises-gold text-sm"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manises-gold/40"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
            {errors.confirmPassword && <p id="reset-confirm-password-error" role="alert" className="text-[11px] text-red-300 font-semibold mt-1 pl-1">{errors.confirmPassword}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl font-semibold bg-manises-gold text-manises-blue shadow-gold hover:opacity-90 transition-all text-sm"
          >
            {isSubmitting ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );

  const resultContent = (() => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-7 h-7 text-emerald-300" aria-hidden="true" />,
          iconWrap: 'bg-emerald-400/10 border-emerald-400/40',
          title: 'Contraseña actualizada',
          description: 'Ya puedes iniciar sesión con tu nueva contraseña.',
          actions: (
            <Button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full h-11 rounded-xl font-semibold bg-manises-gold text-manises-blue shadow-gold hover:opacity-90 transition-all text-sm"
            >
              Volver al inicio de sesión
            </Button>
          ),
        };
      case 'expired':
        return {
          icon: <Clock className="w-7 h-7 text-amber-300" aria-hidden="true" />,
          iconWrap: 'bg-amber-400/10 border-amber-400/40',
          title: 'Este enlace ha caducado',
          description: 'Por seguridad, los enlaces de restablecimiento dejan de funcionar pasado un tiempo. Solicita uno nuevo.',
          actions: (
            <Button
              type="button"
              onClick={() => navigate('/recover-password')}
              variant="outline"
              className="w-full h-11 rounded-xl font-semibold border-white/15 bg-white/5 text-white hover:bg-white/10 text-sm"
            >
              Solicitar un nuevo enlace
            </Button>
          ),
        };
      case 'invalid':
        return {
          icon: <XCircle className="w-7 h-7 text-red-300" aria-hidden="true" />,
          iconWrap: 'bg-red-400/10 border-red-400/40',
          title: 'Este enlace no es válido',
          description: 'El enlace no es correcto o ya se ha utilizado.',
          actions: (
            <Button
              type="button"
              onClick={() => navigate('/recover-password')}
              variant="outline"
              className="w-full h-11 rounded-xl font-semibold border-white/15 bg-white/5 text-white hover:bg-white/10 text-sm"
            >
              Solicitar un nuevo enlace
            </Button>
          ),
        };
      case 'error':
      default:
        return {
          icon: <AlertTriangle className="w-7 h-7 text-red-300" aria-hidden="true" />,
          iconWrap: 'bg-red-400/10 border-red-400/40',
          title: 'No hemos podido cambiar tu contraseña',
          description: 'Ha ocurrido un problema al procesar la solicitud. Inténtalo de nuevo.',
          actions: (
            <div className="w-full flex flex-col gap-2">
              <Button
                type="button"
                onClick={backToForm}
                className="w-full h-11 rounded-xl font-semibold bg-manises-gold text-manises-blue shadow-gold hover:opacity-90 transition-all text-sm"
              >
                Reintentar
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full h-11 rounded-xl font-semibold border-white/15 bg-white/5 text-white hover:bg-white/10 text-sm"
              >
                Volver al inicio de sesión
              </Button>
            </div>
          ),
        };
    }
  })();

  const showForm = status === 'idle' || status === 'submitting';

  return (
    <AuthScreenShell contentClassName="gap-6 pt-14 justify-center">
      <motion.div className="flex min-h-max flex-col items-center justify-center gap-6 w-full">
        {showForm ? (
          formView
        ) : (
          <motion.div className="w-full max-w-sm shrink-0">
            <motion.div
              role="alert"
              aria-live="polite"
              className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-2xl p-7 shadow-[0_18px_42px_rgba(0,0,0,0.28)] flex flex-col items-center text-center gap-4"
            >
              <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${resultContent.iconWrap}`}>
                {resultContent.icon}
              </div>
              <div className="space-y-2">
                <h1 className="text-white text-xl font-black tracking-tight">{resultContent.title}</h1>
                <p className="text-white/60 text-xs font-medium leading-relaxed max-w-xs">{resultContent.description}</p>
              </div>
              <div className="w-full mt-2">{resultContent.actions}</div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AuthScreenShell>
  );
}
