import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AuthScreenShell } from '@/features/auth/components/AuthScreenShell';

function AuthLoadingScreen({ isSilent = false }: { isSilent?: boolean }) {
  return (
    <AuthScreenShell contentClassName="gap-6 pt-14">
      {/* Brand - Mimicking LoginPage structure for perfect alignment */}
      <div className="w-full max-w-sm flex flex-col items-center gap-8 px-1">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/branding/logo-white.png"
            alt="Lotería Manises"
            className="h-14 w-auto max-w-[200px] object-contain"
          />
          <div className="text-center">
            <p className="text-manises-gold text-[10px] font-bold uppercase tracking-[0.3em] opacity-90">
              Administración nº 3 · Valencia
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder Card - Persistent container to avoid any layout jumps */}
      <div className="w-full max-w-sm shrink-0">
        <div className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_18px_42px_rgba(0,0,0,0.28)] flex flex-col items-center gap-6 min-h-[140px] justify-center">
          {!isSilent && (
            <>
              <div className="text-center">
                <p className="text-[11px] font-medium text-white/40 tracking-wide">
                  Estableciendo conexión segura...
                </p>
              </div>
              <div className="flex gap-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.1, 0.35, 0.1] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                    className="h-1.5 w-1.5 rounded-full bg-white/30"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AuthScreenShell>
  );
}

export function RequireAuth() {
  const { user, isDemo, loading } = useAuth();

  // Si no hay usuario y ya terminó de cargar, redirigimos a login (ahora en la raíz /)
  if (!loading && !user && !isDemo) {
    return <Navigate to="/" replace />;
  }

  // Solo mostramos LoadingScreen si estamos en una ruta privada y esperando sesión
  if (loading) {
    return <AuthLoadingScreen />;
  }

  return <Outlet />;
}

  return <Outlet />;
}
