import { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCircle, NavArrowDown, NavArrowUp } from 'iconoir-react/regular';
import { cn } from '@/shared/lib/utils';
import { PurchaseBottomBar } from '@/features/play/components/PurchaseBottomBar';
import type { QuickPickCombination } from '../contracts/quick-pick.contract';

interface QuickPickPanelProps {
  count: number;
  setCount: (count: number) => void;
  combinations: QuickPickCombination[];
  isRegenerating: boolean;
  regenerate: () => void;
  regenerateAt: (index: number) => void;
  totalPrice: number;
  availableBalance: number;
  drawsCount: number;
  activeColor: string;
  onAdd: () => void;
  isAdding?: boolean;
}

const VISIBLE_THRESHOLD = 5;

export function QuickPickPanel({
  count,
  setCount,
  combinations,
  isRegenerating,
  regenerate,
  regenerateAt,
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
    <div className="space-y-3 pb-28">
      {/* Config compacta: stepper */}
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

      <PurchaseBottomBar
        availableBalance={availableBalance}
        totalPrice={totalPrice}
        canContinue={!isAdding && combinations.length > 0}
        ctaLabel={isAdding ? 'Generando...' : count === 1 ? 'Añadir 1 apuesta' : `Añadir ${count} apuestas`}
        onContinue={onAdd}
        activeColor={activeColor}
        drawsCount={drawsCount}
        validationText="Genera al menos una combinación"
      />
    </div>
  );
}
