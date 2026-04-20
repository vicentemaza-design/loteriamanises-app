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
    <div className="flex p-1 bg-slate-100 rounded-2xl w-full">
      {availableModes.map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`relative flex-1 py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
            currentMode === mode ? 'text-manises-blue' : 'text-slate-400'
          }`}
        >
          {currentMode === mode && (
            <motion.div
              layoutId="activeMode"
              className="absolute inset-0 bg-white rounded-xl shadow-sm"
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
