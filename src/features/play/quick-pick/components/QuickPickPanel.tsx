import { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCircle, NavArrowDown, NavArrowUp } from 'iconoir-react/regular';
import { cn } from '@/shared/lib/utils';
import { PurchaseBottomBar } from '@/features/play/components/PurchaseBottomBar';
import type { GamePlayBottomMenuItem } from '@/features/play/components/GamePlayBottomMenu';
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
  isSubscription?: boolean;
  onSubscriptionChange?: (val: boolean) => void;
  menuItems?: GamePlayBottomMenuItem[];
}

const VISIBLE_THRESHOLD = 3;
const QUICK_PICK_PRESETS = [1, 2, 3, 5, 10, 15];

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
  isSubscription = false,
  onSubscriptionChange,
  menuItems,
}: QuickPickPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleCombos = isExpanded ? combinations : combinations.slice(0, VISIBLE_THRESHOLD);
  const hiddenCount = combinations.length - VISIBLE_THRESHOLD;

  return (
    <div className="space-y-3 pb-40">
      <section className="rounded-[1.6rem] border border-slate-100 bg-white p-4 shadow-sm">
        <p className="mb-3 px-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-manises-blue">Número de apuestas</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PICK_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCount(preset)}
                className={cn(
                  'flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-[11px] font-black transition-all active:scale-95',
                  count === preset
                    ? 'border-transparent text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                )}
                style={count === preset ? { backgroundColor: activeColor } : undefined}
              >
                {preset}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center overflow-hidden rounded-xl border border-manises-blue/40 bg-white shadow-sm">
            <button
              onClick={() => setCount(Math.max(1, count - 1))}
              disabled={count <= 1}
              className={cn(
                'flex h-9 w-9 items-center justify-center text-lg font-bold transition-all active:scale-95',
                count <= 1 ? 'text-slate-200' : 'text-manises-blue hover:bg-manises-blue/[0.06]'
              )}
              aria-label="Reducir número de apuestas"
            >
              −
            </button>
            <span className="w-9 text-center text-lg font-black tabular-nums" style={{ color: activeColor }}>
              {count}
            </span>
            <button
              onClick={() => setCount(Math.min(15, count + 1))}
              disabled={count >= 15}
              className={cn(
                'flex h-9 w-9 items-center justify-center text-lg font-bold transition-all active:scale-95',
                count >= 15 ? 'text-slate-200' : 'text-manises-blue hover:bg-manises-blue/[0.06]'
              )}
              aria-label="Aumentar número de apuestas"
            >
              +
            </button>
          </div>
        </div>
        <p className="mt-3 text-[10px] font-medium text-slate-400">
          Se generarán {count} {count === 1 ? 'apuesta aleatoria' : 'apuestas aleatorias'}
        </p>
      </section>

      <section className="rounded-[1.6rem] border border-slate-100 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-manises-blue">Tus apuestas aleatorias</p>
          <button
            onClick={regenerate}
            disabled={isRegenerating}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-manises-blue transition-all hover:bg-manises-blue/[0.06] active:scale-95',
              isRegenerating && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Regenerar todas las apuestas"
          >
            <RefreshCircle className={cn('w-3.5 h-3.5', isRegenerating && 'animate-spin')} />
            Regenerar todas
          </button>
        </div>
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
                AP {idx + 1}
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

      {/* Toggle "Jugar todas las semanas" */}
      {onSubscriptionChange && (
        <button
          type="button"
          onClick={() => onSubscriptionChange(!isSubscription)}
          className={cn(
            'w-full text-left rounded-[1.2rem] border px-4 py-3 shadow-sm transition-all',
            isSubscription
              ? 'border-manises-blue/20 bg-manises-blue/[0.05]'
              : 'border-slate-100 bg-white hover:border-slate-200'
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-manises-blue">
              Jugar todas las semanas
            </p>
            <div className={cn(
              'relative flex h-5 w-9 shrink-0 rounded-full transition-colors',
              isSubscription ? 'bg-manises-blue' : 'bg-slate-200'
            )}>
              <motion.div
                animate={{ x: isSubscription ? 16 : 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
              />
            </div>
          </div>
          <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-400">
            Tus apuestas se jugarán automáticamente en los sorteos seleccionados.
          </p>
        </button>
      )}

      <PurchaseBottomBar
        availableBalance={availableBalance}
        totalPrice={totalPrice}
        canContinue={!isAdding && combinations.length > 0}
        ctaLabel={isAdding ? 'Generando...' : 'JUGAR'}
        onContinue={onAdd}
        activeColor={activeColor}
        drawsCount={drawsCount}
        validationText="Genera al menos una combinación"
        menuItems={menuItems}
      />
    </div>
  );
}
