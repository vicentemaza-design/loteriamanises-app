import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import {
  User,
  Wallet,
  CreditCard,
  Settings,
  ShieldCheck,
  HelpCircle,
  LogOut,
  NavArrowRight,
  Heart,
  RefreshCircle,
  Bank,
  Building,
  Lock,
  LockSlash,
  Repeat,
  DatabaseScript,
} from 'iconoir-react/regular';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatCurrency } from '@/shared/lib/utils';
import { toast } from 'sonner';
import visaLogo from '@/assets/games/visa.svg';
import mastercardLogo from '@/assets/games/mastercard.svg';
import maestroLogo from '@/assets/games/maestro.svg';
import { listItemFadeUp, listStagger, pageStagger, sectionFadeUp } from '@/shared/lib/motion';

function PaymentMethodsIcon() {
  const paymentLogos = [
    { src: visaLogo, alt: 'Visa' },
    { src: mastercardLogo, alt: 'Mastercard' },
    { src: maestroLogo, alt: 'Maestro' },
  ];

  return (
    <div className="flex items-center -space-x-1">
      {paymentLogos.map((logo) => (
        <div
          key={logo.alt}
          className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden"
        >
          <img src={logo.src} alt={logo.alt} className="w-4.5 h-4.5 object-contain" />
        </div>
      ))}
    </div>
  );
}

export function ProfilePage() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [isLockEnabled, setIsLockEnabled] = useState(() => {
    return localStorage.getItem('app_lock_enabled') === 'true';
  });

  const toggleLock = () => {
    const newVal = !isLockEnabled;
    setIsLockEnabled(newVal);
    localStorage.setItem('app_lock_enabled', String(newVal));
    
    if (newVal) {
      toast.success('Protección por PIN activada (PIN: 1234)');
    } else {
      toast.info('Protección por PIN desactivada');
    }
  };

  const MENU_SECTIONS = [
    {
      title: 'Mi cuenta',
      items: [
        { icon: User,        label: 'Datos personales',  detail: null,                                   color: 'text-gray-600',    bg: 'bg-gray-100', onClick: () => navigate('/profile/account') },
        { icon: Wallet,      label: 'Mi saldo',          detail: (bal: number) => formatCurrency(bal),  color: 'text-emerald-600', bg: 'bg-emerald-50', onClick: () => navigate('/profile/wallet') },
        { icon: CreditCard,  label: 'Métodos de pago',   detail: null,                                   color: 'text-blue-600',    bg: 'bg-blue-50', logos: <PaymentMethodsIcon />, onClick: () => navigate('/profile/payments') },
      ],
    },
    {
      title: 'Premium Demo',
      items: [
        { icon: Heart,          label: 'Jugadas favoritas',    detail: null, color: 'text-rose-600', bg: 'bg-rose-50', onClick: () => navigate('/profile/favorites') },
        { icon: RefreshCircle,  label: 'Mis abonos',           detail: null, color: 'text-amber-600', bg: 'bg-amber-50', onClick: () => navigate('/profile/subscriptions') },
        { icon: Repeat,         label: 'Movimientos',          detail: null, color: 'text-cyan-700', bg: 'bg-cyan-50', onClick: () => navigate('/profile/movements') },
        { icon: Bank,           label: 'Cobrar premios',       detail: null, color: 'text-emerald-700', bg: 'bg-emerald-50', onClick: () => navigate('/profile/withdrawals') },
        { icon: Building,       label: 'Empresas y colectivos',detail: null, color: 'text-indigo-700', bg: 'bg-indigo-50', onClick: () => navigate('/profile/companies') },
      ],
    },
    {
      title: 'Seguridad y Privacidad',
      items: [
        { 
          icon: isLockEnabled ? Lock : LockSlash, 
          label: 'Bloqueo por PIN', 
          detail: () => (
            <div className={`w-10 h-5 rounded-full transition-colors relative ${isLockEnabled ? 'bg-manises-blue' : 'bg-gray-200'}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isLockEnabled ? 'left-6' : 'left-1'}`} />
            </div>
          ), 
          color: isLockEnabled ? 'text-purple-600' : 'text-gray-400', 
          bg: isLockEnabled ? 'bg-purple-50' : 'bg-gray-50',
          onClick: toggleLock
        },
        { icon: ShieldCheck, label: 'Seguridad biométrica',detail: null, color: 'text-purple-600',  bg: 'bg-purple-50', onClick: () => toast.info('Biometría disponible en App Nativa.') },
      ],
    },
    {
      title: 'Auditoría de Producción',
      items: [
        { icon: DatabaseScript, label: 'Matriz Técnica (Fase 1)', detail: null, color: 'text-indigo-600', bg: 'bg-indigo-50', onClick: () => navigate('/profile/matrix') },
      ],
    },
    {
      title: 'Ajustes',
      items: [
        { icon: Settings,    label: 'Preferencias',      detail: null, color: 'text-gray-600',    bg: 'bg-gray-100', onClick: () => navigate('/profile/settings') },
        { icon: HelpCircle,  label: 'Ayuda, premios y legal', detail: null, color: 'text-orange-500',  bg: 'bg-orange-50', onClick: () => navigate('/profile/help') },
      ],
    },
  ];

  return (
    <motion.div
      className="flex min-h-full flex-col gap-5 bg-background p-4"
      initial="hidden"
      animate="visible"
      variants={pageStagger}
    >

      {/* ---- Hero de usuario ---- */}
      <motion.div
        variants={sectionFadeUp}
        className="bg-manises-blue rounded-2xl p-5 text-white relative overflow-hidden"
      >
        {/* Decoración */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-manises-gold/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/3 rounded-full blur-xl pointer-events-none" />

        <div className="relative flex items-center gap-4 cursor-pointer" onClick={() => navigate('/profile/account')}>
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-8 h-8 text-white/60" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="font-bold text-lg leading-tight truncate">
                {profile?.displayName ?? 'Mi cuenta'}
              </h1>
              <span className="bg-manises-gold text-manises-blue text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">
                VIP
              </span>
            </div>
            <p className="text-white/50 text-sm font-medium truncate">{profile?.email}</p>
          </div>
        </div>

        {/* Saldo destacado */}
        <div className="relative mt-4 bg-white/8 border border-white/10 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">Saldo disponible</p>
            <p className="text-xl font-black text-manises-gold tabular-nums mt-0.5">
              {formatCurrency(profile?.balance ?? 0)}
            </p>
          </div>
          <Button
            className="bg-manises-gold text-manises-blue font-bold text-xs rounded-xl h-9 px-4 hover:bg-white shadow-gold transition-all"
            onClick={() => navigate('/profile/wallet')}
          >
            Recargar
          </Button>
        </div>
      </motion.div>

      {/* ---- Menú por secciones ---- */}
      {MENU_SECTIONS.map(section => (
        <motion.section key={section.title} variants={sectionFadeUp}>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            {section.title}
          </p>
          <motion.div
            className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border shadow-manises surface-neo-soft"
            variants={listStagger}
          >
            {section.items.map((item) => (
              <motion.button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-muted/50 active:bg-muted transition-colors group"
                variants={listItemFadeUp}
              >
                <div className={`p-2 rounded-xl ${item.bg} ${item.color} shrink-0 transition-transform group-hover:scale-105`}>
                  <item.icon className="w-4.5 h-4.5" aria-hidden="true" />
                </div>
                <span className="flex-1 text-sm font-semibold text-manises-blue truncate">
                  {item.label}
                </span>
                {item.detail && (
                  <div className="mr-2">
                    {typeof item.detail === 'function' ? item.detail(profile?.balance ?? 0) : item.detail}
                  </div>
                )}
                {item.logos}
                {!item.detail && <NavArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-manises-blue transition-colors shrink-0" />}
              </motion.button>
            ))}
          </motion.div>
        </motion.section>
      ))}

      {/* ---- Cerrar sesión ---- */}
      <motion.div variants={sectionFadeUp}>
      <Button
        variant="ghost"
        className="w-full h-12 text-red-500 font-semibold hover:bg-red-50 hover:text-red-600 rounded-xl border border-red-100 transition-all"
        onClick={logout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar sesión
      </Button>
      </motion.div>

      {/* Footer legal */}
      <motion.div className="text-center space-y-1 pb-1" variants={sectionFadeUp}>
        <p className="text-[10px] text-muted-foreground font-semibold">Lotería Manises · Admon. nº 3</p>
        <p className="text-[9px] text-muted-foreground/60 font-medium">
          Receptor Oficial de Apuestas 81980 · Valencia
        </p>
        <p className="text-[9px] text-muted-foreground/40">
          Juega con responsabilidad. +18. DGOJ. v2.0.26
        </p>
      </motion.div>
    </motion.div>
  );
}
