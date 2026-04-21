import { Wallet, PlusCircle } from 'iconoir-react/regular';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { motion, animate } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '@/shared/lib/utils';
import { useNavigate } from 'react-router-dom';

function AnimatedBalance({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;
    if (prev === value) return;

    const controls = animate(prev, value, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value]);

  return <>{formatCurrency(display)}</>;
}

export function Header() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-[50] w-full bg-white/45 backdrop-blur-3xl border-b border-white/20 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
      {/* Content wrapper with pt-safe + generous breathing room */}
      <div className="relative flex h-[var(--header-height)] items-center justify-between px-6 pt-[env(safe-area-inset-top,0px)] mx-auto max-w-7xl">
        {/* Logo Section - Institutional and readable */}
        <button
          type="button"
          className="flex items-center gap-3.5 min-w-0"
          onClick={() => navigate('/')}
          aria-label="Ir al inicio"
        >
          <img
            src="/assets/branding/logo-color.png" 
            alt="Lotería Manises"
            className="h-7 w-auto object-contain shrink-0"
          />
          <div className="hidden xs:flex flex-col border-l border-manises-blue/15 pl-4 py-1 min-w-0">
            <span className="text-[9px] font-black text-manises-blue tracking-widest uppercase leading-tight">
              Administración nº 3
            </span>
            <span className="text-[7px] font-bold text-manises-blue/40 tracking-tight uppercase">
              Oficial Loterías
            </span>
          </div>
        </button>

        {/* Balance Section - Integrated look */}
        {profile && (
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/profile')}
              className="bg-manises-blue/5 hover:bg-manises-blue/10 border border-manises-blue/10 rounded-2xl px-3 py-1.5 flex items-center gap-2.5 transition-all shadow-sm"
              aria-label={`Mi saldo: ${formatCurrency(profile.balance)}. Pulsar para recargar.`}
            >
              <div className="bg-manises-blue/10 p-1 rounded-lg">
                <Wallet className="w-4 h-4 text-manises-blue" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[7px] font-black text-manises-blue/50 uppercase tracking-tighter">Mi Saldo</span>
                <span className="text-[15px] font-black text-manises-blue tabular-nums">
                  <AnimatedBalance value={profile.balance} />
                </span>
              </div>
              <div className="ml-0.5 w-6 h-6 rounded-xl bg-manises-blue flex items-center justify-center text-white shadow-md">
                <PlusCircle className="w-4 h-4 stroke-[3px]" />
              </div>
            </motion.button>
          </div>
        )}
      </div>
    </header>
  );
}
