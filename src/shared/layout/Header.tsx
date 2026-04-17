import { Wallet, PlusCircle } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full overflow-hidden bg-manises-blue border-b border-[#D5E3F2]/10 shadow-md">
      {/* Background layer with subtle brand depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-manises-blue via-[#093d7c] to-manises-blue-mid opacity-95" />
      
      {/* Content wrapper with pt-safe + extra breathing room */}
      <div className="relative flex h-[4.25rem] max-w-7xl items-center justify-between px-4 pt-safe pt-1 mx-auto">
        {/* Logo Section - Compact but readable */}
        <button
          type="button"
          className="flex items-center gap-3 min-w-0"
          onClick={() => navigate('/')}
          aria-label="Ir al inicio"
        >
          <img
            src="/assets/branding/logo-white.png"
            alt="Lotería Manises"
            className="h-5.5 w-auto object-contain shrink-0"
          />
          <div className="hidden xs:flex flex-col border-l border-white/15 pl-3 py-0.5 min-w-0">
            <span className="text-[8px] font-black text-manises-gold tracking-widest uppercase leading-tight">
              Administración nº 3
            </span>
            <span className="text-[7px] font-bold text-[#D5E3F2]/40 tracking-tight uppercase">
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
              className="bg-[#D5E3F2]/5 hover:bg-[#D5E3F2]/10 border border-[#D5E3F2]/15 rounded-xl px-2.5 py-1.5 flex items-center gap-2 transition-all backdrop-blur-sm"
              aria-label={`Mi saldo: ${formatCurrency(profile.balance)}. Pulsar para recargar.`}
            >
              <Wallet className="w-3.5 h-3.5 text-manises-gold" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[7px] font-bold text-[#D5E3F2]/50 uppercase tracking-tighter">Mi Saldo</span>
                <span className="text-sm font-black text-white tabular-nums">
                  <AnimatedBalance value={profile.balance} />
                </span>
              </div>
              <div className="ml-1 w-5 h-5 rounded-lg bg-manises-gold flex items-center justify-center text-manises-blue shadow-sm">
                <PlusCircle className="w-3.5 h-3.5 stroke-[3px]" />
              </div>
            </motion.button>
          </div>
        )}
      </div>
    </header>
  );
}
