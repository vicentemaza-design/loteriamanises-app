import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import {
  Mail,
  Lock,
  User,
  Shield,
  Clock,
  BadgePercent,
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileCheck2,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AuthScreenShell } from '@/features/auth/components/AuthScreenShell';

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
    transition: { staggerChildren: 0.11, delayChildren: 0.08 },
  },
};

const authItem = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

type RegisterStep = 'access' | 'compliance' | 'verification';

export function RegisterPage() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<RegisterStep>('access');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdult, setIsAdult] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [declareRealData, setDeclareRealData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Completa nombre, email y contraseña para continuar.');
      return;
    }
    setStep('compliance');
  };

  const handleGoogle = async () => {
    if (!isAdult || !acceptTerms) {
      toast.error('Debes confirmar +18 y aceptar los términos para crear cuenta.');
      return;
    }
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsLoading(false);
    }
  };

  const complianceReady = isAdult && acceptTerms && declareRealData;

  const completeManualFlow = () => {
    if (!complianceReady) {
      toast.error('Debes completar todas las confirmaciones legales.');
      return;
    }
    setStep('verification');
    toast.success('Cuenta creada. Completa la verificación para retirar premios.');
  };

  return (
    <AuthScreenShell contentClassName="gap-5 pt-12">
      <motion.div
        variants={authContainer}
        initial="hidden"
        animate="visible"
        className="flex min-h-max flex-col items-center justify-start gap-5"
      >
        
        {/* Composición Superior Unificada - Alineada con el ancho de la Card */}
        <div className="w-full max-w-sm flex flex-col items-center gap-8 px-1">
          {/* Botón Volver - Integrado en el flujo */}
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            onClick={() => navigate('/login')}
            className="self-start flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Volver</span>
          </motion.button>

          {/* Brand */}
          <motion.div
            variants={authItem}
            transition={{ duration: 0.58, ease: 'easeOut' }}
            className="flex flex-col items-center gap-3"
          >
            <motion.img
              src="/assets/branding/logo-white.png"
              alt="Lotería Manises"
              initial={{ opacity: 0, scale: 0.75, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 170, damping: 15, delay: 0.18 }}
              className="h-12 w-auto"
            />
            <p className="text-manises-gold text-[9px] font-black uppercase tracking-[0.4em]">Administración nº 3</p>
          </motion.div>
        </div>

        {/* Header Text */}
        <motion.div variants={authItem} transition={{ duration: 0.52, ease: 'easeOut' }} className="text-center space-y-1">
          <h1 className="text-white text-2xl font-black tracking-tight">Crea tu cuenta</h1>
          <p className="text-white/40 text-xs font-medium">
            Registro seguro para jugadores mayores de 18 años
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          variants={authItem}
          transition={{ duration: 0.72, ease: 'easeOut' }}
          className="w-full max-w-sm shrink-0"
        >
          <motion.div
            animate={{
              y: [0, -4, 0],
              boxShadow: [
                '0 18px 44px rgba(0,0,0,0.28)',
                '0 26px 60px rgba(0,0,0,0.38)',
                '0 18px 44px rgba(0,0,0,0.28)',
              ],
            }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-7"
          >
            <div className="flex items-center justify-between mb-5 px-1">
              {[
                { key: 'access', label: 'Acceso' },
                { key: 'compliance', label: 'Cumplimiento' },
                { key: 'verification', label: 'Verificación' },
              ].map((item, index) => {
                const itemStep = item.key as RegisterStep;
                const isDone =
                  (itemStep === 'access' && step !== 'access') ||
                  (itemStep === 'compliance' && step === 'verification');
                const isActive = step === itemStep;
                return (
                  <div key={item.key} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-manises-gold" />
                    ) : (
                      <Circle className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/30'}`} />
                    )}
                    <span className={isActive ? 'text-white' : 'text-white/40'}>
                      {index + 1}. {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {step === 'access' && (
              <>
                <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <p className="text-[11px] font-semibold text-white/75">
                    El alta te llevará menos de 1 minuto. La verificación de identidad será necesaria para retiradas.
                  </p>
                </div>

                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Registro manual</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      placeholder="Nombre completo"
                      className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-manises-gold"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type="email"
                      placeholder="Email"
                      className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-manises-gold"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type="password"
                      placeholder="Crea una contraseña"
                      className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-manises-gold"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-manises-gold text-manises-blue font-black rounded-xl shadow-gold hover:opacity-90 transition-all"
                  >
                    Continuar
                  </Button>
                </form>
              </>
            )}

            {step === 'compliance' && (
              <div className="space-y-3.5">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                  <p className="text-[11px] font-semibold text-white/75">
                    Para activar tu cuenta de juego necesitamos estas confirmaciones legales.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAdult((prev) => !prev)}
                  className={`w-full text-left rounded-xl border px-3 py-3 flex items-start gap-3 transition-colors ${isAdult ? 'border-manises-gold/60 bg-manises-gold/10' : 'border-white/10 bg-white/5'}`}
                >
                  <Shield className="w-4 h-4 mt-0.5 text-manises-gold shrink-0" />
                  <div>
                    <p className="text-[12px] font-bold text-white">Declaro que soy mayor de 18 años</p>
                    <p className="text-[10px] text-white/55 mt-1">Requisito obligatorio para acceso al juego.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAcceptTerms((prev) => !prev)}
                  className={`w-full text-left rounded-xl border px-3 py-3 flex items-start gap-3 transition-colors ${acceptTerms ? 'border-manises-gold/60 bg-manises-gold/10' : 'border-white/10 bg-white/5'}`}
                >
                  <Scale className="w-4 h-4 mt-0.5 text-manises-gold shrink-0" />
                  <div>
                    <p className="text-[12px] font-bold text-white">Acepto Términos y Política de Privacidad</p>
                    <p className="text-[10px] text-white/55 mt-1">Condiciones de uso y tratamiento de datos.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeclareRealData((prev) => !prev)}
                  className={`w-full text-left rounded-xl border px-3 py-3 flex items-start gap-3 transition-colors ${declareRealData ? 'border-manises-gold/60 bg-manises-gold/10' : 'border-white/10 bg-white/5'}`}
                >
                  <FileCheck2 className="w-4 h-4 mt-0.5 text-manises-gold shrink-0" />
                  <div>
                    <p className="text-[12px] font-bold text-white">Confirmo que mis datos son reales</p>
                    <p className="text-[10px] text-white/55 mt-1">Necesario para verificación y retirada de premios.</p>
                  </div>
                </button>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('access')}
                    className="flex-1 h-11 border-white/15 bg-white/5 text-white hover:bg-white/10 rounded-xl"
                  >
                    Volver
                  </Button>
                  <Button
                    type="button"
                    disabled={!complianceReady}
                    onClick={completeManualFlow}
                    className="flex-1 h-11 bg-manises-gold text-manises-blue font-black rounded-xl shadow-gold disabled:opacity-40"
                  >
                    Activar cuenta
                  </Button>
                </div>

                <Button
                  onClick={handleGoogle}
                  disabled={isLoading || !complianceReady}
                  className="w-full h-12 bg-white text-manises-blue hover:bg-white/90 font-black rounded-xl flex items-center justify-center gap-3 shadow-lg transition-transform active:scale-[0.98]"
                >
                  <GoogleIcon />
                  <span>{isLoading ? 'Conectando...' : 'Continuar con Google'}</span>
                </Button>
              </div>
            )}

            {step === 'verification' && (
              <div className="space-y-3.5">
                <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3 py-3 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-300 shrink-0" />
                  <div>
                    <p className="text-[12px] font-bold text-white">Cuenta creada correctamente</p>
                    <p className="text-[10px] text-white/65 mt-1">
                      Ya puedes entrar y consultar sorteos. Para retirar premios necesitarás verificación de identidad.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white/75">Estado de verificación</span>
                    <span className="text-[10px] font-black uppercase text-amber-300">Pendiente</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-300 shrink-0" />
                    <p className="text-[10px] text-white/65">
                      Sube DNI/NIE y confirma titularidad para habilitar retiradas y límites completos.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="flex-1 h-11 border-white/15 bg-white/5 text-white hover:bg-white/10 rounded-xl"
                  >
                    Ir a login
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex-1 h-11 bg-manises-gold text-manises-blue font-black rounded-xl shadow-gold"
                  >
                    Entrar
                  </Button>
                </div>
              </div>
            )}

            <p className="text-center text-[11px] text-white/40 mt-6 font-medium">
              Si ya tienes cuenta,{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-manises-gold font-black hover:underline"
              >
                Identifícate
              </button>
            </p>
          </motion.div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div variants={authItem} transition={{ duration: 0.55, ease: 'easeOut' }} className="mt-auto flex justify-center gap-6 pt-2">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, delay: 0.15, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-1.5 opacity-30"
            >
              <Icon className="w-4 h-4 text-white" />
              <span className="text-[8px] font-black text-white uppercase tracking-widest">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Legal */}
        <p className="text-[9px] text-white/20 text-center font-medium max-w-[240px] leading-relaxed">
          Uso exclusivo para mayores de <span className="text-white/40">18 años</span>. Se requiere verificación de identidad para retirar premios y cumplir normativa de juego responsable.
        </p>
      </motion.div>
    </AuthScreenShell>
  );
}
