import { Home, LayoutGrid, Trophy, Ticket, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import { motion } from 'motion/react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';

const navItems = [
  { icon: Home,       label: 'Inicio',     path: '/' },
  { icon: LayoutGrid, label: 'Juegos',     path: '/games' },
  { icon: Trophy,     label: 'Resultados', path: '/results' },
  { icon: Ticket,     label: 'Mis Jugadas',path: '/tickets' },
  { icon: User,       label: 'Perfil',     path: '/profile' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 px-4 pb-3"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div
        className="pointer-events-auto relative mx-auto max-w-sm overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,34,64,0.96)_0%,rgba(10,25,47,0.98)_55%,rgba(7,18,33,1)_100%)] shadow-[0_18px_40px_rgba(10,25,47,0.45)] backdrop-blur-xl"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_24%,rgba(255,255,255,0)_58%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/16" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-[linear-gradient(180deg,rgba(245,197,24,0)_0%,rgba(245,197,24,0.06)_100%)]" />
        <div className="flex justify-around items-stretch h-[4.25rem] px-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          // "/" activo solo cuando es exactamente "/"
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);

          return (
            <PremiumTouchInteraction key={path} scale={0.92} className="flex-1">
              <NavLink
                to={path}
                end={path === '/'}
                aria-label={label}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full gap-0.5 relative transition-all duration-200',
                  isActive ? 'text-manises-gold' : 'text-white/50'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-shell"
                    className="absolute inset-x-1.5 top-1.5 bottom-1.5 rounded-[1.1rem] bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_18px_rgba(0,0,0,0.16)]"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}

                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute top-1.5 w-8 h-1 bg-manises-gold rounded-pill"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}

                <div
                  className={cn(
                    'relative z-10 p-1.5 rounded-xl transition-all duration-200',
                    isActive ? 'text-manises-gold' : ''
                  )}
                >
                  <Icon
                    className={cn('w-5 h-5', isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]')}
                    aria-hidden="true"
                  />
                </div>
                <span
                  className={cn(
                    'relative z-10 text-[10px] font-semibold tracking-tight truncate transition-colors duration-200',
                    isActive ? 'text-manises-gold' : 'text-white/58'
                  )}
                >
                  {label}
                </span>
              </NavLink>
            </PremiumTouchInteraction>
          );
        })}
        </div>
      </div>
    </nav>
  );
}
