import { Wallet, PlusCircle } from 'iconoir-react/regular';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { motion, animate } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '@/shared/lib/utils';
import { useNavigate } from 'react-router-dom';
import { PlaySessionIndicator } from '@/features/session/components/PlaySessionIndicator';

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
    <header className="fixed top-0 left-0 right-0 z-[50] w-full bg-[#0a4792]/80 backdrop-blur-3xl border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      <div className="relative mx-auto flex h-[var(--header-height)] max-w-7xl items-center justify-between px-4 pt-[env(safe-area-inset-top,0px)] sm:px-6">
        {/* Logo Section - Institutional and readable */}
        <button
          type="button"
          className="flex min-w-0 items-center gap-3"
          onClick={() => navigate('/')}
          aria-label="Ir al inicio"
        >
          <img
            src="/assets/branding/logo-white.png" 
            alt="Lotería Manises"
            className="h-7 w-auto object-contain shrink-0"
          />
          <div className="hidden min-w-0 flex-col border-l border-white/15 py-1 pl-3 xs:flex">
            <span className="text-[9px] font-black text-manises-gold tracking-widest uppercase leading-tight">
              Administración nº 3
            </span>
            <span className="text-[7px] font-bold text-white/40 tracking-tight uppercase">
              Oficial Loterías
            </span>
          </div>
        </button>

        {/* Balance Section - Integrated look */}
        {profile && (
          <div className="flex max-w-[62%] items-center justify-end gap-1.5 sm:max-w-none sm:gap-2">
            <PlaySessionIndicator variant="header" />
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/profile')}
              className="group flex h-11 min-w-0 max-w-[8.6rem] items-center gap-2 rounded-[1.1rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.05)_100%)] px-2 shadow-[0_10px_20px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] xs:max-w-none xs:gap-2.5 xs:px-2.5"
              aria-label={`Mi saldo: ${formatCurrency(profile.balance)}. Pulsar para recargar.`}
            >
              <div className="flex h-7.5 w-7.5 items-center justify-center rounded-[0.8rem] border border-white/12 bg-manises-gold/12">
                <Wallet className="h-3.5 w-3.5 text-manises-gold" />
              </div>
              <div className="flex min-w-0 flex-col items-start leading-none">
                <span className="text-[6px] font-black uppercase tracking-[0.16em] text-white/50">Mi saldo</span>
                <span className="max-w-[4.25rem] truncate text-[12px] font-black tabular-nums text-white xs:max-w-[5.4rem] xs:text-[14px]">
                  <AnimatedBalance value={profile.balance} />
                </span>
              </div>
              <div className="ml-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[0.8rem] bg-manises-gold text-manises-blue shadow-[0_6px_12px_rgba(247,181,0,0.22)]">
                <PlusCircle className="h-3.5 w-3.5 stroke-[3px]" />
              </div>
            </motion.button>
          </div>
        )}
      </div>
    </header>
  );
}
