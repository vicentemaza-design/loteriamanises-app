// Final iOS PWA Layout Stabilization - v1.0.1
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/shared/lib/utils';
import authBackground from '@/assets/images/group-people-celebrating-financial-success-with-joyful-faces-dreamy-background-clear-h.jpg';

interface AuthScreenShellProps {
  children: ReactNode;
  contentClassName?: string;
  backgroundImageSrc?: string;
}

export function AuthScreenShell({
  children,
  contentClassName,
  backgroundImageSrc = authBackground,
}: AuthScreenShellProps) {
  return (
    <div className="relative min-h-[100svh] min-h-dvh w-full overflow-hidden bg-[#060d1a]">
      <div className="absolute inset-0 pointer-events-none">
        <motion.img
          src={backgroundImageSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          animate={{
            scale: [1.03, 1.08, 1.04, 1.03],
            x: [0, -12, 10, 0],
            y: [0, 8, -6, 0],
          }}
          transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 18% 16%, rgba(245,197,24,0.32) 0%, rgba(245,197,24,0) 36%), radial-gradient(circle at 84% 20%, rgba(59,130,246,0.28) 0%, rgba(59,130,246,0) 34%), linear-gradient(180deg, rgba(10,25,47,0.56) 0%, rgba(12,24,48,0.62) 44%, rgba(9,20,38,0.74) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_78%,rgba(16,185,129,0.14)_0%,rgba(16,185,129,0)_34%),radial-gradient(circle_at_76%_82%,rgba(245,197,24,0.10)_0%,rgba(245,197,24,0)_42%)]" />

        <motion.div
          animate={{ x: [0, 36, -18, 0], y: [0, -22, 16, 0], scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-16 -top-20 h-80 w-80 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(245,197,24,0.34) 0%, rgba(245,197,24,0.18) 28%, rgba(245,197,24,0.04) 62%, transparent 72%)',
          }}
        />
        <motion.div
          animate={{ x: [0, -42, 18, 0], y: [0, 24, -14, 0], scale: [1, 0.94, 1.06, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-24 top-[26%] h-96 w-96 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(255,243,196,0.2) 0%, rgba(245,197,24,0.13) 26%, rgba(17,34,64,0.05) 60%, transparent 74%)',
          }}
        />
        <motion.div
          animate={{ x: [0, 30, -12, 0], y: [0, 18, -20, 0], rotate: [0, 8, -6, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 right-[8%] h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(56,189,248,0.24) 0%, rgba(17,34,64,0.22) 36%, rgba(10,25,47,0.02) 68%, transparent 78%)',
          }}
        />
        <motion.div
          animate={{ opacity: [0.22, 0.38, 0.26, 0.22], scale: [1, 1.06, 0.98, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 22%, rgba(255,255,255,0) 44%)',
          }}
        />
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 44, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-2xl"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(245,197,24,0) 0deg, rgba(245,197,24,0.24) 66deg, rgba(56,189,248,0.12) 126deg, rgba(10,25,47,0) 210deg, rgba(16,185,129,0.1) 298deg, rgba(245,197,24,0) 360deg)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0,_transparent_32%)] opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(245,197,24,0.06)_0%,transparent_36%,rgba(255,255,255,0.05)_52%,transparent_100%)]" />
      </div>

      <div className="relative z-10 min-h-[100svh] min-h-dvh w-full overflow-y-auto overflow-x-hidden">
        <div
          className={cn(
            'flex min-h-[100svh] min-h-dvh flex-col items-center justify-start px-6 pb-[calc(env(safe-area-inset-bottom,0px)+3rem)]',
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
