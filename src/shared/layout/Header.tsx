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
    <header className="sticky top-0 z-40 w-full bg-manises-blue shadow-lg border-b border-white/10">
      <div className="flex items-center justify-between h-16 px-5 max-w-7xl mx-auto">
        {/* Logo + Brand */}
        <div className="flex items-center gap-4 min-w-0" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <motion.img
            src="/assets/branding/logo-white.png"
            alt="Lotería Manises"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-6 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col border-l border-white/20 pl-4 py-1.5 min-w-0">
            <span className="text-[9px] font-black text-manises-gold tracking-widest uppercase truncate leading-tight">
              Administración nº 3
            </span>
            <span className="text-[8px] font-bold text-white/40 tracking-tight truncate">
              Receptor 81980
            </span>
          </div>
        </div>

        {/* Saldo Pill - interaction to top-up */}
        <div className="flex items-center">
          {profile && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/profile')}
              className="bg-white/10 border border-white/20 rounded-full pl-3 pr-2 py-1.5 flex items-center gap-2 shadow-sm transition-all hover:bg-white/15 active:bg-white/20"
              aria-label={`Mi saldo: ${formatCurrency(profile.balance)}. Pulsar para recargar.`}
            >
              <Wallet className="w-4 h-4 text-manises-gold shrink-0" />
              <span className="text-sm font-black text-white tabular-nums">
                <AnimatedBalance value={profile.balance} />
              </span>
              <div className="w-5 h-5 rounded-full bg-manises-gold flex items-center justify-center text-manises-blue">
                <PlusCircle className="w-3.5 h-3.5 stroke-[3px]" />
              </div>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
