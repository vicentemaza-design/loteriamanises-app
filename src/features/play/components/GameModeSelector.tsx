import { motion } from 'motion/react';
import { GameType } from '@/shared/types/domain';

interface Props {
  gameType: GameType;
  availableModes: Array<'simple' | 'multiple' | 'reduced'>;
  currentMode: 'simple' | 'multiple' | 'reduced';
  onModeChange: (mode: 'simple' | 'multiple' | 'reduced') => void;
}

export function GameModeSelector({ availableModes, currentMode, onModeChange }: Props) {
  if (availableModes.length <= 1) return null;

  return (
    <div className="flex w-full rounded-[1.15rem] border border-slate-200/80 bg-slate-100/85 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-sm">
      {availableModes.map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`relative flex-1 rounded-[0.95rem] py-3 text-xs font-black uppercase tracking-[0.14em] transition-all ${
            currentMode === mode ? 'text-manises-blue' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {currentMode === mode && (
            <motion.div
              layoutId="activeMode"
              className="absolute inset-0 rounded-[0.95rem] border border-white bg-white/95 shadow-[0_10px_24px_rgba(15,23,42,0.10)]"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">
            {mode === 'simple' && 'Simple'}
            {mode === 'multiple' && 'Múltiple'}
            {mode === 'reduced' && 'Reducida'}
          </span>
        </button>
      ))}
    </div>
  );
}
