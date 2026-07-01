import { useEffect } from 'react';
import { Home, ViewGrid, Trophy, JournalPage, User, NavArrowRight } from 'iconoir-react/regular';
import { NavLink, useLocation } from 'react-router-dom';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { usePlaySession } from '@/features/session/hooks/usePlaySession';

const navItems = [
  { icon: Home,        label: 'Inicio',      path: '/home' },
  { icon: Trophy,      label: 'Resultados',  path: '/results' },
  { icon: ViewGrid,    label: 'Juegos',      path: '/games' },
  { icon: JournalPage, label: 'Mis jugadas', path: '/tickets' },
  { icon: User,        label: 'Perfil',      path: '/profile' },
];

const CART_SECTION_REM = 3; // approx height of the compact cart buttons row
const NAV_BASE_REM = 5;

export function BottomNav() {
  const location = useLocation();
  const { gameDrafts, lotteryDrafts, openGameReview, openLotteryReview } = usePlaySession();

  const gamesTotal = gameDrafts.reduce((s, d) => s + d.totalPrice, 0);
  const lotteryTotal = lotteryDrafts.reduce((s, d) => s + d.totalPrice, 0);
  const hasGames = gameDrafts.length > 0;
  const hasLottery = lotteryDrafts.length > 0;
  const hasCart = hasGames || hasLottery;

  // Ajusta --nav-height para que pb-nav-safe tenga siempre el espacio correcto
  useEffect(() => {
    const totalRem = hasCart ? NAV_BASE_REM + CART_SECTION_REM : NAV_BASE_REM;
    document.documentElement.style.setProperty(
      '--nav-height',
      `calc(${totalRem}rem + env(safe-area-inset-bottom, 0px))`
    );
  }, [hasCart]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-60 bg-[#0a4792]/80 backdrop-blur-3xl border-t border-white/5 shadow-[0_-8px_32px_rgba(0,0,0,0.25)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Sección de cestas — aparece encima de los iconos de nav */}
      <AnimatePresence>
        {hasCart && (
          <motion.div
            key="cart-section"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="overflow-hidden border-b border-white/8"
          >
            <div className={`grid gap-2 px-2 pt-2 pb-1.5 ${hasGames && hasLottery ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {hasGames && (
                <button
                  type="button"
                  onClick={openGameReview}
                  className="flex items-center justify-between gap-2 rounded-xl bg-[#d5e3f2] px-3.5 py-2 transition-all active:scale-[0.98]"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest text-manises-blue/60">Juegos</span>
                  <span className="flex-1 text-center text-[14px] font-black leading-none text-manises-blue">{formatCurrency(gamesTotal)}</span>
                  <div className="flex shrink-0 items-center gap-0.5 text-manises-blue/70">
                    <span className="text-[9px] font-black uppercase tracking-widest">Pagar</span>
                    <NavArrowRight className="h-3 w-3" />
                  </div>
                </button>
              )}
              {hasLottery && (
                <button
                  type="button"
                  onClick={openLotteryReview}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-white transition-all active:scale-[0.98]"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Lotería</span>
                  <span className="flex-1 text-center text-[14px] font-black leading-none">{formatCurrency(lotteryTotal)}</span>
                  <div className="flex shrink-0 items-center gap-0.5 text-white/80">
                    <span className="text-[9px] font-black uppercase tracking-widest">Pagar</span>
                    <NavArrowRight className="h-3 w-3" />
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Iconos de navegación */}
      <div className="flex justify-around items-stretch h-14 max-w-7xl mx-auto px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = path === '/home'
            ? location.pathname === '/home' || location.pathname === '/'
            : location.pathname.startsWith(path);

          return (
            <PremiumTouchInteraction key={path} scale={0.98} className="flex-1">
              <NavLink
                to={path}
                end
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full gap-0.5 relative transition-all duration-500',
                  isActive ? 'text-manises-gold' : 'text-white/60 hover:text-white/80'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator-top"
                    className="absolute top-0 w-6 h-[1.5px] bg-manises-gold rounded-full shadow-[0_0_8px_rgba(245,197,24,0.4)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-glow"
                    className="absolute inset-x-3 inset-y-2 rounded-xl bg-manises-gold/[0.08]"
                    transition={{ duration: 0.3 }}
                  />
                )}
                <Icon
                  className={cn('w-[22px] h-[22px] transition-all duration-300', isActive ? 'scale-105' : 'scale-100 opacity-90')}
                  style={{ strokeWidth: isActive ? '2.1px' : '1.75px' }}
                />
                <span className={cn('text-[9px] font-bold tracking-[0.05em] uppercase transition-colors antialiased', isActive ? 'text-manises-gold' : '')}>
                  {label}
                </span>
              </NavLink>
            </PremiumTouchInteraction>
          );
        })}
      </div>
    </nav>
  );
}
