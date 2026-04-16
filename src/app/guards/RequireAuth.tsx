import { Navigate, Outlet } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function RequireAuth() {
  const { user, isDemo, loading } = useAuth();

  if (loading) {
    return (
        <motion.div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 35%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 24%)',
          }}
          animate={{ opacity: [0.35, 0.58, 0.35] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative flex w-full max-w-sm flex-col items-center gap-6 rounded-[2rem] border border-white/12 bg-white/6 px-8 py-10 shadow-[0_24px_80px_rgba(4,12,24,0.45)] backdrop-blur-2xl"
        >
          <motion.div
            className="absolute inset-x-8 top-0 h-px bg-white/20"
            animate={{ opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            animate={{ y: [0, -6, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-manises-gold/20 blur-2xl" />
            <img
              src="/assets/branding/logo-white.png"
              alt="Cargando Lotería Manises..."
              className="relative h-16 w-auto object-contain"
            />
          </motion.div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-manises-gold/90">
              Loteria Manises
            </p>
            <p className="mt-2 text-sm font-semibold text-white/76">
              Preparando tu acceso seguro
            </p>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.25, 1, 0.25], y: [0, -6, 0], scale: [0.9, 1.15, 0.9] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.14, ease: 'easeInOut' }}
                className="h-2 w-2 rounded-full bg-manises-gold shadow-[0_0_12px_rgba(245,197,24,0.55)]"
              />
            ))}
          </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Permite acceso si hay usuario real ó modo demo activo
  if (!user && !isDemo) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
