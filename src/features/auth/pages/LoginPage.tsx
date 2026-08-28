import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Mail, Lock, Eye, EyeClosed, ShieldCheck, Clock, PercentageCircle, Flask, WarningTriangle, CheckCircle } from 'iconoir-react/regular';
import { ScanFace } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthScreenShell } from '@/features/auth/components/AuthScreenShell';
import { FaceIdDemoModal } from '@/features/auth/components/FaceIdDemoModal';
import { RUNTIME_CONFIG } from '@/config/runtime';

// SVG inline de Google — sin dependencia externa
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Juego Seguro' },
  { icon: Clock,       label: 'Soporte 24h' },
  { icon: PercentageCircle, label: '0 Comisiones' },
];

const authContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const authItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function LoginPage() {
  const { signInWithGoogle, signInDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const legalNavState = { state: { from: `${location.pathname}${location.search}` } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFaceIdDemoOpen, setIsFaceIdDemoOpen] = useState(false);
  const { status: loginStatus, errorMessage: loginError, login, reset: resetLogin } = useLogin();

  const isEmailLoading = loginStatus === 'loading';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (loginStatus === 'error') resetLogin();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (loginStatus === 'error') resetLogin();
  };

  // In a demo-enabled deployment, PublicLayout no longer auto-redirects a
  // merely-restored session to /home (see PublicLayout.tsx) — so a
  // successful popup sign-in must navigate explicitly, same as the demo
  // entry points below. The popup-blocked fallback (full-page redirect to
  // Google and back) is handled separately by PublicLayout's
  // `redirectSignInJustCompleted` exception; there is no click left to
  // navigate from once that flow returns.
  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      const success = await signInWithGoogle();
      if (success) {
        navigate('/home', { replace: true });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Safety net for the popup-blocked -> signInWithRedirect fallback: that
  // path navigates the whole page away to Google, so if the browser
  // restores this page from bfcache after the user cancels/goes back, the
  // component is revived mid-await with isGoogleLoading still true — no
  // finally block ever ran because the page never actually reloaded.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setIsGoogleLoading(false);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // Explicit navigation on both demo entry points — PublicLayout no longer
  // auto-redirects on isDemo alone (a restored/stale demo flag must never
  // silently bypass Login, see PublicLayout.tsx), so entering demo now
  // navigates directly instead of relying on that reactive check.
  const handleDemoLogin = () => {
    signInDemo();
    navigate('/home', { replace: true });
  };

  // DEMO-ONLY: the modal is purely a timed visual simulation (see
  // FaceIdDemoModal.tsx) — the actual "sign in" here is the exact same
  // signInDemo() the classic "Entrar en modo demo" button already calls.
  // No separate auth path, no new session mechanism.
  const handleFaceIdVerified = () => {
    setIsFaceIdDemoOpen(false);
    signInDemo();
    navigate('/home', { replace: true });
  };

  return (
    <AuthScreenShell contentClassName="gap-6 pt-14">
      <motion.div
        className="flex min-h-max flex-col items-center justify-start gap-6"
      >

        {/* Composición Superior Unificada - Coherente con Registro */}
        <div className="w-full max-w-sm flex flex-col items-center gap-8 px-1">
          {/* Brand */}
          <motion.div
            className="flex flex-col items-center gap-4"
          >
            {/* Logo Real */}
            <motion.img
              src="/assets/branding/logo-white.png"
              alt="Lotería Manises"
              className="h-14 w-auto max-w-[200px] object-contain"
            />

            {/* Descriptor real */}
            <div className="text-center">
              <p className="text-manises-gold text-[10px] font-bold uppercase tracking-[0.3em] opacity-90">
                Administración nº 3 · Valencia
              </p>
            </div>
          </motion.div>
        </div>

        {/* Formulario */}
        <motion.div
          className="w-full max-w-sm shrink-0"
        >
          {/* Card */}
          <motion.div
            className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_18px_42px_rgba(0,0,0,0.28)]"
          >

            {/* Google — método principal */}
            <Button
              onClick={handleGoogle}
              disabled={isGoogleLoading}
              className="w-full h-12 bg-white text-gray-800 hover:bg-gray-50 font-semibold rounded-xl flex items-center justify-center gap-3 shadow-manises transition-all active:scale-[0.98]"
            >
              <GoogleIcon />
              <span>{isGoogleLoading ? 'Conectando...' : 'Continuar con Google'}</span>
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                o con email
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Email form — secundario */}
            <form onSubmit={handleLogin} className="space-y-3" noValidate>
              <div>
                <label htmlFor="login-email" className="sr-only">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" aria-hidden="true" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Email"
                    autoComplete="username"
                    disabled={isEmailLoading}
                    aria-invalid={loginStatus === 'error'}
                    aria-describedby={loginStatus === 'error' ? 'login-error-message' : undefined}
                    className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl focus-visible:ring-manises-gold text-sm"
                    value={email}
                    onChange={handleEmailChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="login-password" className="sr-only">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" aria-hidden="true" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    autoComplete="current-password"
                    disabled={isEmailLoading}
                    aria-invalid={loginStatus === 'error'}
                    aria-describedby={loginStatus === 'error' ? 'login-error-message' : undefined}
                    className="pl-10 pr-11 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl focus-visible:ring-manises-gold text-sm"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manises-gold/40"
                  >
                    {showPassword ? <EyeClosed className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/recover-password')}
                  className="text-xs font-semibold text-white/50 hover:text-manises-gold transition-colors"
                >
                  ¿Has olvidado tu contraseña?
                </button>
              </div>

              {loginStatus === 'error' && loginError && (
                <div role="alert" aria-live="polite" className="flex items-start gap-2 rounded-xl border border-red-400/40 bg-red-400/10 px-3 py-2.5">
                  <WarningTriangle className="w-4 h-4 mt-0.5 text-red-300 shrink-0" aria-hidden="true" />
                  <p id="login-error-message" className="text-[11px] font-semibold text-red-100">{loginError}</p>
                </div>
              )}

              {loginStatus === 'success' && (
                <div role="status" aria-live="polite" className="flex items-start gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3 py-2.5">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-300 shrink-0" aria-hidden="true" />
                  <p className="text-[11px] font-semibold text-emerald-100">Acceso correcto.</p>
                </div>
              )}

              <Button
                type="submit"
                variant="outline"
                disabled={isEmailLoading}
                className="w-full h-11 rounded-xl font-semibold border-white/10 bg-white/5 text-white hover:bg-white/10 text-sm transition-colors"
              >
                {isEmailLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            {/* Registro */}
            <p className="text-center text-xs text-white/40 mt-5 font-medium">
              ¿Primera vez?{' '}
              <button
                type="button"
                className="text-manises-gold font-semibold hover:underline"
                onClick={() => navigate('/register')}
              >
                Crea tu cuenta
              </button>
            </p>
          </motion.div>

          {/* DEMO MODE — acceso rápido sin Firebase. Solo visible cuando
              VITE_ENABLE_DEMO_ACCESS=true está configurado explícitamente
              (Vercel demo/QA) — ausente o en producción este bloque no se
              renderiza en absoluto, no solo se oculta. Deliberadamente NO
              usa apiProvider === 'mock': ese flag por defecto cae a 'mock'
              cuando VITE_API_PROVIDER no está definido (para no romper el
              dato-adapter de desarrollo local), lo cual expondría este
              acceso demo en cualquier build sin configurar. */}
          {RUNTIME_CONFIG.demoEnabled && (
            <div className="mt-4 border border-white/8 rounded-xl overflow-hidden divide-y divide-white/8">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors text-xs font-semibold"
              >
                <Flask className="w-4 h-4 text-white/30" />
                <span>Entrar en modo demo <span className="text-white/25">(sin cuenta)</span></span>
              </button>
              {/* Simulación visual DEMO — reutiliza exactamente signInDemo(),
                  ver FaceIdDemoModal.tsx. No es biometría real. */}
              <button
                type="button"
                onClick={() => setIsFaceIdDemoOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors text-xs font-semibold"
              >
                <ScanFace className="w-4 h-4 text-white/30" />
                <span>Entrar con Face ID <span className="text-white/25">(demo)</span></span>
              </button>
            </div>
          )}
        </motion.div>

        <FaceIdDemoModal isOpen={isFaceIdDemoOpen} onVerified={handleFaceIdVerified} />

        {/* Trust badges */}
        <motion.div
          className="mt-auto flex items-center justify-center gap-5 pt-2"
        >
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              className="flex flex-col items-center gap-1 text-white/40"
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span className="text-[9px] font-semibold uppercase tracking-widest text-center">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Pie legal minimalista */}
        <div className="flex flex-col items-center gap-3 px-4 opacity-30">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <button onClick={() => navigate('/legal/condiciones', legalNavState)} className="text-[9px] font-bold uppercase tracking-wider hover:text-white transition-colors">Términos</button>
            <span className="text-[8px]">•</span>
            <button onClick={() => navigate('/legal/privacidad', legalNavState)} className="text-[9px] font-bold uppercase tracking-wider hover:text-white transition-colors">Privacidad</button>
            <span className="text-[8px]">•</span>
            <button onClick={() => navigate('/legal/juego-responsable', legalNavState)} className="text-[9px] font-bold uppercase tracking-wider hover:text-white transition-colors">Juego responsable</button>
            <span className="text-[8px]">•</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">+18</span>
          </div>
          <p className="text-[9px] font-medium italic text-center leading-tight">
            Juega con responsabilidad. Prohibido a menores de 18 años.
          </p>
        </div>
      </motion.div>
    </AuthScreenShell>
  );
}
