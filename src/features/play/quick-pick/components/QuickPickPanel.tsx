import { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCircle, NavArrowDown, NavArrowUp } from 'iconoir-react/regular';
import { Button } from '@/shared/ui/Button';
import { cn, formatCurrency } from '@/shared/lib/utils';
import type { QuickPickCombination, GenerationPreset } from '../contracts/quick-pick.contract';

interface QuickPickPanelProps {
  count: number;
  setCount: (count: number) => void;
  combinations: QuickPickCombination[];
  isRegenerating: boolean;
  regenerate: () => void;
  regenerateAt: (index: number) => void;
  generationPreset: GenerationPreset;
  setGenerationPreset: (preset: GenerationPreset) => void;
  totalPrice: number;
  availableBalance: number;
  drawsCount: number;
  activeColor: string;
  onAdd: () => void;
  isAdding?: boolean;
}

const PRESETS: Array<{ id: GenerationPreset; label: string }> = [
  { id: 'random', label: 'Aleatoria' },
  { id: 'odd',    label: 'Solo impares' },
  { id: 'even',   label: 'Solo pares' },
];

const VISIBLE_THRESHOLD = 5;

export function QuickPickPanel({
  count,
  setCount,
  combinations,
  isRegenerating,
  regenerate,
  regenerateAt,
  generationPreset,
  setGenerationPreset,
  totalPrice,
  availableBalance,
  drawsCount,
  activeColor,
  onAdd,
  isAdding,
}: QuickPickPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleCombos = isExpanded ? combinations : combinations.slice(0, VISIBLE_THRESHOLD);
  const hiddenCount = combinations.length - VISIBLE_THRESHOLD;

  return (
    <div className="space-y-3">
      {/* Config compacta: stepper + presets */}
      <section className="rounded-[1.6rem] border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-manises-blue">Jugada aleatoria</h3>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Generamos tus apuestas automáticamente</p>
          </div>
          <button
            onClick={regenerate}
            disabled={isRegenerating}
            className={cn(
              'flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-slate-300 active:scale-95',
              isRegenerating && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Regenerar todas las apuestas"
          >
            <RefreshCircle className={cn('w-3.5 h-3.5', isRegenerating && 'animate-spin')} />
            Regenerar todas
          </button>
        </div>

        {/* Stepper de cantidad */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Número de apuestas</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCount(Math.max(1, count - 1))}
              disabled={count <= 1}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg border text-base font-bold transition-all active:scale-95',
                count <= 1 ? 'border-slate-100 text-slate-200' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              )}
              aria-label="Reducir número de apuestas"
            >
              −
            </button>
            <span className="w-6 text-center text-base font-black tabular-nums" style={{ color: activeColor }}>
              {count}
            </span>
            <button
              onClick={() => setCount(Math.min(50, count + 1))}
              disabled={count >= 50}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg border text-base font-bold transition-all active:scale-95',
                count >= 50 ? 'border-slate-100 text-slate-200' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              )}
              aria-label="Aumentar número de apuestas"
            >
              +
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="flex gap-1.5">
          {PRESETS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setGenerationPreset(id)}
              className={cn(
                'flex-1 rounded-lg border px-2 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all',
                generationPreset === id
                  ? 'border-transparent text-white shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
              )}
              style={generationPreset === id ? { backgroundColor: activeColor, borderColor: activeColor } : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Combinaciones generadas */}
      <section className="rounded-[1.6rem] border border-slate-100 bg-white overflow-hidden shadow-sm">
        <div className="space-y-1.5 p-3">
          {visibleCombos.map((combo, idx) => (
            <motion.div
              key={combo.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: idx * 0.03 }}
              className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-2.5 py-2"
            >
              <span className="w-8 shrink-0 text-[9px] font-black uppercase text-slate-400">
                Ap.{idx + 1}
              </span>
              <div className="flex flex-1 flex-wrap gap-1 items-center">
                {combo.numbers.map((n) => (
                  <span
                    key={n}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-white"
                    style={{ backgroundColor: activeColor }}
                  >
                    {n}
                  </span>
                ))}
                {combo.stars && combo.stars.length > 0 && (
                  <span className="mx-0.5 text-[8px] text-slate-300">·</span>
                )}
                {combo.stars?.map((s) => (
                  <span
                    key={s}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-manises-gold text-[9px] font-black text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <button
                onClick={() => regenerateAt(idx)}
                className="shrink-0 rounded-lg p-1.5 text-slate-300 transition-all hover:bg-slate-100 hover:text-slate-500 active:scale-90"
                aria-label={`Regenerar Ap. ${idx + 1}`}
                title="Regenerar apuesta"
              >
                <RefreshCircle className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>

        {combinations.length > VISIBLE_THRESHOLD && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-between border-t border-slate-100 px-4 py-2.5 transition-colors hover:bg-slate-50"
          >
            <span className="text-[10px] font-medium text-slate-400">
              {isExpanded ? 'Ocultar' : `Ver ${hiddenCount} combinaciones más`}
            </span>
            {isExpanded
              ? <NavArrowUp className="w-3.5 h-3.5 text-slate-400" />
              : <NavArrowDown className="w-3.5 h-3.5 text-slate-400" />
            }
          </button>
        )}
      </section>

      {/* Resumen y CTA */}
      <section className="rounded-[1.8rem] border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-medium text-slate-400">
              {count} {count === 1 ? 'apuesta' : 'apuestas'} × {drawsCount} {drawsCount === 1 ? 'sorteo' : 'sorteos'}
            </p>
            <p className="text-[12px] font-black text-manises-blue">{formatCurrency(totalPrice)}</p>
          </div>
          <div className="flex items-center justify-between border-t border-slate-50 px-1 pt-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-manises-blue">Total demo</p>
            <p className="text-lg font-black text-manises-blue">{formatCurrency(totalPrice)}</p>
          </div>
          <div className="flex items-center justify-center pt-1">
            <span className={cn(
              'rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider',
              availableBalance >= totalPrice ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            )}>
              Saldo demo: {formatCurrency(availableBalance)}
            </span>
          </div>
        </div>

        <Button
          className="w-full rounded-2xl py-3 text-white shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: activeColor }}
          onClick={onAdd}
          disabled={isAdding || availableBalance < totalPrice}
        >
          {isAdding ? 'Generando...' : count === 1 ? 'Añadir 1 apuesta' : `Añadir ${count} apuestas`}
        </Button>

        <p className="mt-2 text-center text-[8px] font-medium text-slate-400">
          Demo · combinaciones generadas de forma aleatoria · sin operación de compra
        </p>
      </section>
    </div>
  );
}
