import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import {
  User,
  Wallet,
  CreditCard,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Heart,
  RefreshCcw,
  Landmark,
  Building2,
  Lock,
  Unlock,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatCurrency } from '@/shared/lib/utils';
import { toast } from 'sonner';
import visaLogo from '@/assets/games/visa.svg';
import mastercardLogo from '@/assets/games/mastercard.svg';
import maestroLogo from '@/assets/games/maestro.svg';

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
      premium: true,
      items: [
        { icon: Heart,          label: 'Jugadas favoritas',     detail: 'Guardadas', color: 'text-rose-500', bg: 'bg-gradient-to-br from-rose-500/18 via-red-400/10 to-white/70 border border-rose-300/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]', accent: 'from-rose-500/16 via-red-400/8 to-transparent', onClick: () => navigate('/profile/favorites') },
        { icon: RefreshCcw,     label: 'Mis abonos',            detail: 'Activos',   color: 'text-sky-600',  bg: 'bg-gradient-to-br from-sky-500/18 via-cyan-400/10 to-white/70 border border-sky-300/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]', accent: 'from-sky-500/16 via-cyan-400/8 to-transparent', onClick: () => navigate('/profile/subscriptions') },
        { icon: ArrowLeftRight, label: 'Movimientos',           detail: 'Historial', color: 'text-cyan-600', bg: 'bg-gradient-to-br from-cyan-500/18 via-teal-400/10 to-white/70 border border-cyan-300/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]', accent: 'from-cyan-500/16 via-teal-400/8 to-transparent', onClick: () => navigate('/profile/movements') },
        { icon: Landmark,       label: 'Cobrar premios',        detail: 'Express',   color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-500/18 via-green-400/10 to-white/70 border border-emerald-300/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]', accent: 'from-emerald-500/16 via-green-400/8 to-transparent', onClick: () => navigate('/profile/withdrawals') },
        { icon: Building2,      label: 'Empresas y colectivos', detail: 'Pro',       color: 'text-violet-600', bg: 'bg-gradient-to-br from-violet-500/18 via-indigo-400/10 to-white/70 border border-violet-300/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]', accent: 'from-violet-500/16 via-indigo-400/8 to-transparent', onClick: () => navigate('/profile/companies') },
      ],
    },
    {
      title: 'Seguridad y Privacidad',
      items: [
        { 
          icon: isLockEnabled ? Lock : Unlock, 
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
        { icon: Shield,      label: 'Seguridad biométrica',detail: null, color: 'text-purple-600',  bg: 'bg-purple-50', onClick: () => toast.info('Biometría disponible en App Nativa.') },
      ],
    },
    {
      title: 'Ajustes',
      items: [
        { icon: Settings,    label: 'Preferencias',      detail: null, color: 'text-gray-600',    bg: 'bg-gray-100', onClick: () => navigate('/profile/settings') },
        { icon: HelpCircle,  label: 'Ayuda y soporte',   detail: null, color: 'text-orange-500',  bg: 'bg-orange-50', onClick: () => navigate('/profile/help') },
      ],
    },
  ];

  return (
    <div className="flex min-h-full flex-col gap-5 bg-background p-4">

      {/* ---- Hero de usuario ---- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
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
        <div key={section.title}>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${section.premium ? 'text-manises-blue' : 'text-muted-foreground'}`}>
              {section.title}
            </p>
            {section.premium && (
              <span className="rounded-full border border-manises-gold/30 bg-manises-gold/12 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.24em] text-manises-blue">
                Curated
              </span>
            )}
          </div>
          <div className={`${section.premium
            ? 'relative overflow-hidden rounded-[1.35rem] border border-manises-gold/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] shadow-[0_18px_40px_rgba(10,25,47,0.12)]'
            : 'bg-card rounded-xl border border-border overflow-hidden shadow-manises surface-neo-soft'
          }`}>
            {section.premium && (
              <>
                <div className="section-wash absolute inset-0 pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-manises-gold/70 to-transparent pointer-events-none" />
                <div className="absolute -top-10 right-4 h-24 w-24 rounded-full bg-manises-gold/12 blur-2xl pointer-events-none" />
              </>
            )}
            <div className={`${section.premium ? 'relative divide-y divide-white/70 p-1.5' : 'divide-y divide-border'}`}>
            {section.items.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`group relative w-full text-left transition-all ${section.premium
                  ? 'flex items-center gap-4 rounded-[1.1rem] px-4 py-3.5 hover:bg-white/85 active:bg-white/95'
                  : 'flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 active:bg-muted'
                }`}
              >
                {section.premium && item.accent && (
                  <div className={`absolute inset-0 rounded-[1.1rem] bg-gradient-to-r ${item.accent} opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100`} />
                )}
                <div className={`relative shrink-0 rounded-xl p-2 ${item.bg} ${item.color} transition-transform duration-300 group-hover:scale-[1.08]`}>
                  <item.icon className={section.premium ? 'h-5 w-5' : 'h-4.5 w-4.5'} aria-hidden="true" />
                </div>
                <div className="relative flex min-w-0 flex-1 items-center gap-3">
                  <span className={`truncate ${section.premium ? 'text-[0.95rem] font-bold tracking-[-0.01em] text-manises-blue' : 'text-sm font-semibold text-manises-blue'}`}>
                    {item.label}
                  </span>
                  {item.detail && (
                    <div className="mr-1 ml-auto">
                      {typeof item.detail === 'function' ? item.detail(profile?.balance ?? 0) : (
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${section.premium ? 'border border-manises-blue/10 bg-white/80 text-manises-blue/75 shadow-[0_6px_16px_rgba(10,25,47,0.08)]' : 'text-manises-blue/65'}`}>
                          {item.detail}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {item.logos}
                {(!item.detail || section.premium) && (
                  <div className={`${section.premium ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-manises-blue/10 bg-white/70 shadow-[0_8px_18px_rgba(10,25,47,0.08)]' : ''}`}>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${section.premium ? 'text-manises-blue/60 group-hover:text-manises-blue' : 'text-muted-foreground group-hover:text-manises-blue'}`} />
                  </div>
                )}
              </button>
            ))}
            </div>
          </div>
        </div>
      ))}

      {/* ---- Cerrar sesión ---- */}
      <Button
        variant="ghost"
        className="w-full h-12 text-red-500 font-semibold hover:bg-red-50 hover:text-red-600 rounded-xl border border-red-100 transition-all"
        onClick={logout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Cerrar sesión
      </Button>

      {/* Footer legal */}
      <div className="text-center space-y-1 pb-1">
        <p className="text-[10px] text-muted-foreground font-semibold">Lotería Manises · Admon. nº 3</p>
        <p className="text-[9px] text-muted-foreground/60 font-medium">
          Receptor Oficial de Apuestas 81980 · Valencia
        </p>
        <p className="text-[9px] text-muted-foreground/40">
          Juega con responsabilidad. +18. DGOJ. v2.0.26
        </p>
      </div>
    </div>
  );
}
