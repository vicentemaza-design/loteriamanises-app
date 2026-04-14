import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Delete, Fingerprint } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/utils';
import loteriaManisesLogo from '@/assets/games/logo-01-blue.svg';

interface AppLockProps {
  onUnlock: () => void;
}

/**
 * Pantalla de Bloqueo de Privacidad (PIN).
 * Se activa si el usuario ha habilitado la seguridad en ajustes.
 * Resuelve la queja de MILOTO sobre la privacidad de datos sensibles.
 */
export function AppLock({ onUnlock }: AppLockProps) {
  const [pin, setPin] = React.useState<string>('');
  const [error, setError] = React.useState(false);
  
  // En este MVP el PIN es '1234' por defecto o el guardado en localStorage
  const storedPin = localStorage.getItem('app_pin') || '1234';

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        if (newPin === storedPin) {
          setTimeout(onUnlock, 150);
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6"
    >
      {/* Branding */}
      <div className="flex flex-col items-center gap-4 mb-12">
        <img src={loteriaManisesLogo} alt="Lotería Manises" className="h-10 opacity-80" />
        <div className="w-16 h-16 rounded-2xl bg-manises-blue/5 flex items-center justify-center">
          <Shield className="w-8 h-8 text-manises-blue" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-manises-blue uppercase tracking-tight">Privacidad Activa</h2>
          <p className="text-xs text-muted-foreground font-medium mt-1">Introduce tu PIN de seguridad</p>
        </div>
      </div>

      {/* PIN Dots */}
      <div className="flex gap-4 mb-12">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={error ? { x: [0, -4, 4, -4, 0], backgroundColor: ['#ef4444', '#ef4444'] } : {}}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-200",
              pin.length > i 
                ? "bg-manises-blue border-manises-blue scale-110" 
                : "bg-transparent border-gray-200"
            )}
          />
        ))}
      </div>

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num)}
            className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-xl font-black text-manises-blue hover:bg-gray-100 active:scale-90 transition-all"
          >
            {num}
          </button>
        ))}
        {/* Biométrico Mock */}
        <button className="w-16 h-16 rounded-full flex items-center justify-center text-manises-blue/30 active:scale-90 transition-all">
          <Fingerprint className="w-7 h-7" />
        </button>
        <button
          onClick={() => handleKeyPress('0')}
          className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-xl font-black text-manises-blue hover:bg-gray-100 active:scale-90 transition-all"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-full flex items-center justify-center text-manises-blue/60 hover:bg-gray-50 active:scale-90 transition-all"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      {/* Footer link */}
      <button className="mt-12 text-[10px] font-bold text-manises-blue/40 uppercase tracking-widest hover:text-manises-blue transition-colors">
        ¿Olvidaste tu PIN?
      </button>
    </motion.div>
  );
}
