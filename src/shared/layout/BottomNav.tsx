import { Home, ViewGrid, Trophy, JournalPage, User } from 'iconoir-react/regular';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import { motion } from 'motion/react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';

const navItems = [
  { icon: Home,        label: 'Inicio',      path: '/home' },
  { icon: JournalPage, label: 'Mis jugadas', path: '/tickets' },
  { icon: ViewGrid,    label: 'Juegos',      path: '/games' },
  { icon: Trophy,      label: 'Resultados',  path: '/results' },
  { icon: User,        label: 'Perfil',      path: '/profile' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a4792]/80 backdrop-blur-3xl border-t border-white/5 shadow-[0_-8px_32px_rgba(0,0,0,0.25)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="navigation"
      aria-label="Navegación principal"
    >
      {/* Precision top highlight - single pixel for depth in dark mode */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
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
                {/* Active Indicator: Ultra-thin refined line */}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator-top"
                    className="absolute top-0 w-6 h-[1.5px] bg-manises-gold rounded-full shadow-[0_0_8px_rgba(245,197,24,0.4)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Subtle active glow - adjusted for dark background */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-glow"
                    className="absolute inset-x-3 inset-y-2 rounded-xl bg-manises-gold/[0.08]"
                    transition={{ duration: 0.3 }}
                  />
                )}

                <Icon
                  className={cn(
                    'w-[22px] h-[22px] transition-all duration-300',
                    isActive ? 'scale-105' : 'scale-100 opacity-90'
                  )}
                  style={{ strokeWidth: isActive ? '2.1px' : '1.75px' }}
                />
                
                <span className={cn(
                  'text-[9px] font-bold tracking-[0.05em] uppercase transition-colors antialiased',
                  isActive ? 'text-manises-gold' : ''
                )}>
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
