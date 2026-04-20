import { Home, LayoutGrid, Trophy, Ticket, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import { motion } from 'motion/react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';

const navItems = [
  { icon: Home,       label: 'Inicio',     path: '/' },
  { icon: LayoutGrid, label: 'Juegos',     path: '/games' },
  { icon: Trophy,     label: 'Resultados', path: '/results' },
  { icon: Ticket,     label: 'Mis jugadas', path: '/tickets' },
  { icon: User,       label: 'Perfil',     path: '/profile' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A4792]/88 backdrop-blur-xl border-t border-[#D5E3F2]/16 shadow-[0_-8px_24px_rgba(10,71,146,0.18)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="navigation"
      aria-label="Navegación principal"
    >
      {/* Glossy top highlight for premium feel */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D5E3F2]/30 to-transparent" />
      
      <div className="flex justify-around items-stretch h-14 max-w-7xl mx-auto px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);

          return (
            <PremiumTouchInteraction key={path} scale={0.94} className="flex-1">
              <NavLink
                to={path}
                end={path === '/'}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full gap-0.5 relative transition-all duration-300',
                  isActive ? 'text-manises-gold' : 'text-[#D5E3F2]/58 hover:text-[#D5E3F2]/78'
                )}
              >
                {/* Active Indicator: Refined gold pill top indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill-top"
                    className="absolute top-0 w-8 h-0.5 bg-manises-gold rounded-full shadow-[0_0_12px_rgba(245,197,24,0.4)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Subtle glow background for active item */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-glow"
                    className="absolute inset-x-2 inset-y-1.5 rounded-xl bg-manises-gold/5"
                    transition={{ type: 'linear', duration: 0.2 }}
                  />
                )}

                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-300',
                    isActive ? 'scale-110' : 'scale-100'
                  )}
                  style={{ strokeWidth: isActive ? '2.5px' : '2px' }}
                />
                
                <span className={cn(
                  'text-[9px] font-bold tracking-wider uppercase transition-colors',
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
