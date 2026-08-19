import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { AuthScreenShell } from '@/features/auth/components/AuthScreenShell';
import { useVerifyEmailToken } from '@/features/auth/hooks/useVerifyEmailToken';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * Standalone route (see AppRouter.tsx) representing the link a user receives
 * by email — deliberately NOT nested under PublicLayout (which redirects any
 * authenticated/demo user away) nor under RequireAuth (must also work for a
 * logged-out user clicking the link).
 *
 * The token in the URL is treated as fully opaque: never decoded, never
 * logged, never used to infer identity. See useVerifyEmailToken /
 * auth.mock.ts (demo-success / demo-expired / demo-invalid) for how the
 * mock recognizes it — everything else defaults to 'invalid'.
 *
 * A successful outcome here does NOT create or touch any session — it only
 * represents the outcome visually. "Ir a mi cuenta" routes to whatever the
 * current session already is (demo/home if already signed in, login otherwise).
 */
export function VerifyEmailLinkPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { user, isDemo } = useAuth();
  const { status, verify } = useVerifyEmailToken();

  useEffect(() => {
    verify(token ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleGoToAccount = () => {
    navigate(user || isDemo ? '/home' : '/login');
  };

  const content = (() => {
    switch (status) {
      case 'verifying':
        return {
          icon: <Loader2 className="w-7 h-7 text-white/70 animate-spin" aria-hidden="true" />,
          iconWrap: 'bg-white/10 border-white/20',
          title: 'Verificando tu email...',
          description: 'Un momento, estamos comprobando tu enlace de verificación.',
          actions: null,
        };
      case 'verified':
        return {
          icon: <CheckCircle2 className="w-7 h-7 text-emerald-300" aria-hidden="true" />,
          iconWrap: 'bg-emerald-400/10 border-emerald-400/40',
          title: '¡Cuenta verificada!',
          description: 'Tu email ha quedado verificado correctamente.',
          actions: (
            <Button
              type="button"
              onClick={handleGoToAccount}
              className="w-full h-11 rounded-xl font-semibold bg-manises-gold text-manises-blue shadow-gold hover:opacity-90 transition-all text-sm"
            >
              Ir a mi cuenta
            </Button>
          ),
        };
      case 'expired':
        return {
          icon: <Clock className="w-7 h-7 text-amber-300" aria-hidden="true" />,
          iconWrap: 'bg-amber-400/10 border-amber-400/40',
          title: 'El enlace ha caducado',
          description: 'Este enlace de verificación ya no es válido. Solicita uno nuevo desde tu cuenta.',
          actions: (
            <Button
              type="button"
              onClick={() => navigate('/login')}
              variant="outline"
              className="w-full h-11 rounded-xl font-semibold border-white/15 bg-white/5 text-white hover:bg-white/10 text-sm"
            >
              Volver a iniciar sesión
            </Button>
          ),
        };
      case 'invalid':
        return {
          icon: <XCircle className="w-7 h-7 text-red-300" aria-hidden="true" />,
          iconWrap: 'bg-red-400/10 border-red-400/40',
          title: 'Enlace no válido',
          description: 'Este enlace de verificación no es correcto o ya se ha utilizado.',
          actions: (
            <Button
              type="button"
              onClick={() => navigate('/login')}
              variant="outline"
              className="w-full h-11 rounded-xl font-semibold border-white/15 bg-white/5 text-white hover:bg-white/10 text-sm"
            >
              Volver a iniciar sesión
            </Button>
          ),
        };
      case 'error':
      default:
        return {
          icon: <AlertTriangle className="w-7 h-7 text-red-300" aria-hidden="true" />,
          iconWrap: 'bg-red-400/10 border-red-400/40',
          title: 'No hemos podido verificar tu email',
          description: 'Ha ocurrido un problema al procesar el enlace. Inténtalo de nuevo.',
          actions: (
            <div className="w-full flex flex-col gap-2">
              <Button
                type="button"
                onClick={() => verify(token ?? '')}
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
                Volver a iniciar sesión
              </Button>
            </div>
          ),
        };
    }
  })();

  return (
    <AuthScreenShell contentClassName="gap-6 pt-14 justify-center">
      <motion.div className="flex min-h-max flex-col items-center justify-center gap-6 w-full">
        <motion.div className="w-full max-w-sm shrink-0">
          <motion.div
            role={status === 'verifying' ? 'status' : 'alert'}
            aria-live="polite"
            className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-2xl p-7 shadow-[0_18px_42px_rgba(0,0,0,0.28)] flex flex-col items-center text-center gap-4"
          >
            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${content.iconWrap}`}>
              {content.icon}
            </div>
            <div className="space-y-2">
              <h1 className="text-white text-xl font-black tracking-tight">{content.title}</h1>
              <p className="text-white/60 text-xs font-medium leading-relaxed max-w-xs">{content.description}</p>
            </div>
            {content.actions && <div className="w-full mt-2">{content.actions}</div>}
          </motion.div>
        </motion.div>
      </motion.div>
    </AuthScreenShell>
  );
}
