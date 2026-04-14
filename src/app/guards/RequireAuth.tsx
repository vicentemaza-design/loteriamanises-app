import { Navigate, Outlet } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function RequireAuth() {
  const { user, isDemo, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-manises-blue">
        <motion.div
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [0.95, 1.05, 0.95] 
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-6"
        >
          <img 
            src="/assets/branding/logo-white.png" 
            alt="Cargando Lotería Manises..." 
            className="h-16 w-auto object-contain"
          />
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 bg-manises-gold rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Permite acceso si hay usuario real ó modo demo activo
  if (!user && !isDemo) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
