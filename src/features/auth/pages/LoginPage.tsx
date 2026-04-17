import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Mail, Lock, Shield, Clock, BadgePercent, FlaskConical, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AuthScreenShell } from '@/features/auth/components/AuthScreenShell';

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
    <AuthScreenShell contentClassName="gap-6 pt-12">
      <motion.div
        variants={authContainer}
        initial="hidden"
        animate="visible"
        className="flex min-h-max flex-col items-center justify-start gap-6"
      >

        {/* Composición Superior Unificada - Coherente con Registro */}
        <div className="w-full max-w-sm flex flex-col items-center gap-8 px-1">
          {/* Brand */}
          <motion.div
            variants={authItem}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center gap-4"
          >
            {/* Logo Real */}
            <motion.img
              src="/assets/branding/logo-white.png"
              alt="Lotería Manises"
              initial={{ scale: 0.72, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.18 }}
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
          variants={authItem}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-sm shrink-0"
        >
          {/* Card */}
          <motion.div
            animate={{
              y: [0, -4, 0],
              boxShadow: [
                '0 18px 42px rgba(0,0,0,0.28)',
                '0 26px 56px rgba(0,0,0,0.38)',
                '0 18px 42px rgba(0,0,0,0.28)',
              ],
            }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-2xl p-6"
          >

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
          </motion.div>

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
          variants={authItem}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mt-auto flex items-center justify-center gap-5 pt-2"
        >
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, delay: Math.random() * 0.4, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-1 text-white/40"
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span className="text-[9px] font-semibold uppercase tracking-widest text-center">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Pie legal */}
        <p className="text-[10px] text-white/20 text-center font-medium leading-relaxed max-w-xs">
          Al acceder aceptas los{' '}
          <span className="underline cursor-pointer">Términos y Condiciones</span>.
          Juega con responsabilidad. +18. DGOJ.
        </p>
      </motion.div>
    </AuthScreenShell>
  );
}
