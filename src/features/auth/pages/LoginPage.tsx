import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Mail, Lock, Shield, Clock, BadgePercent, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import authBackground from '@/assets/images/group-people-celebrating-financial-success-with-joyful-faces-dreamy-background-clear-h.jpg';

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
  { icon: Shield,      label: 'Juego Seguro' },
  { icon: Clock,       label: 'Soporte 24h' },
  { icon: BadgePercent,label: '0 Comisiones' },
];

export function LoginPage() {
  const { signInWithGoogle, signInDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('El acceso con email estará disponible próximamente. Usa Google para entrar.');
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-manises-blue relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.img
          src={authBackground}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          animate={{
            scale: [1.03, 1.08, 1.04, 1.03],
            x: [0, -12, 10, 0],
            y: [0, 8, -6, 0],
          }}
          transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 18% 16%, rgba(245,197,24,0.32) 0%, rgba(245,197,24,0) 36%), radial-gradient(circle at 84% 20%, rgba(59,130,246,0.32) 0%, rgba(59,130,246,0) 34%), linear-gradient(180deg, rgba(10,25,47,0.56) 0%, rgba(12,24,48,0.62) 44%, rgba(9,20,38,0.74) 100%)',
          }}
        />

        <motion.div
          animate={{
            x: [0, 36, -18, 0],
            y: [0, -22, 16, 0],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-16 w-80 h-80 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(245,197,24,0.34) 0%, rgba(245,197,24,0.18) 28%, rgba(245,197,24,0.04) 62%, transparent 72%)',
          }}
        />

        <motion.div
          animate={{
            x: [0, -42, 18, 0],
            y: [0, 24, -14, 0],
            scale: [1, 0.94, 1.06, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[26%] -left-24 w-96 h-96 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(255,243,196,0.2) 0%, rgba(245,197,24,0.13) 26%, rgba(17,34,64,0.05) 60%, transparent 74%)',
          }}
        />

        <motion.div
          animate={{
            x: [0, 30, -12, 0],
            y: [0, 18, -20, 0],
            rotate: [0, 8, -6, 0],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 right-[8%] w-[28rem] h-[28rem] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(56,189,248,0.24) 0%, rgba(17,34,64,0.22) 36%, rgba(10,25,47,0.02) 68%, transparent 78%)',
          }}
        />

        <motion.div
          animate={{
            opacity: [0.22, 0.38, 0.26, 0.22],
            scale: [1, 1.06, 0.98, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 22%, rgba(255,255,255,0) 44%)',
          }}
        />

        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 44, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 w-[36rem] h-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-2xl"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(245,197,24,0) 0deg, rgba(245,197,24,0.24) 66deg, rgba(56,189,248,0.12) 126deg, rgba(10,25,47,0) 210deg, rgba(16,185,129,0.1) 298deg, rgba(245,197,24,0) 360deg)',
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0,_transparent_32%)] opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(245,197,24,0.06)_0%,transparent_36%,rgba(255,255,255,0.05)_52%,transparent_100%)]" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-10 gap-8">

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center gap-3"
        >
          {/* Logo Real */}
          <motion.img
            src="/assets/branding/logo-white.png"
            alt="Lotería Manises"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            className="h-14 w-auto max-w-[200px] object-contain"
          />

          {/* Descriptor real */}
          <div className="text-center">
            <p className="text-manises-gold text-[10px] font-bold uppercase tracking-[0.3em] opacity-90">
              Administración nº 3 · Valencia
            </p>
          </div>
        </motion.div>

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.15 }}
          className="w-full max-w-sm"
        >
          {/* Card */}
          <div className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">

            {/* Google — método principal */}
            <Button
              onClick={handleGoogle}
              disabled={isLoading}
              className="w-full h-12 bg-white text-gray-800 hover:bg-gray-50 font-semibold rounded-xl flex items-center justify-center gap-3 shadow-manises transition-all active:scale-[0.98]"
            >
              <GoogleIcon />
              <span>{isLoading ? 'Conectando...' : 'Continuar con Google'}</span>
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
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <Input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl focus-visible:ring-manises-gold text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <Input
                  type="password"
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl focus-visible:ring-manises-gold text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="w-full h-11 rounded-xl font-semibold border-white/10 bg-white/5 text-white hover:bg-white/10 text-sm transition-colors"
              >
                Entrar con email
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
          </div>

          {/* DEMO MODE — acceso rápido sin Firebase */}
          <div className="mt-4 border border-white/8 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={signInDemo}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors text-xs font-semibold"
            >
              <FlaskConical className="w-4 h-4 text-white/30" />
              <span>Entrar en modo demo <span className="text-white/25">(sin cuenta)</span></span>
            </button>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center justify-center gap-5"
        >
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 text-white/40">
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span className="text-[9px] font-semibold uppercase tracking-widest text-center">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Pie legal */}
        <p className="text-[10px] text-white/20 text-center font-medium leading-relaxed max-w-xs">
          Al acceder aceptas los{' '}
          <span className="underline cursor-pointer">Términos y Condiciones</span>.
          Juega con responsabilidad. +18. DGOJ.
        </p>
      </div>
    </div>
  );
}
