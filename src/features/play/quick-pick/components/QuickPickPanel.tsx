import { motion, AnimatePresence } from 'motion/react';
import { RefreshCircle, NavArrowDown, NavArrowUp, Spark } from 'iconoir-react/regular';
import { Button } from '@/shared/ui/Button';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { useState } from 'react';
import type { QuickPickCombination } from '../contracts/quick-pick.contract';

interface QuickPickPanelProps {
  count: number;
  setCount: (count: number) => void;
  combinations: QuickPickCombination[];
  isRegenerating: boolean;
  regenerate: () => void;
  totalPrice: number;
  availableBalance: number;
  drawsCount: number;
  onAdd: () => void;
  isAdding?: boolean;
}

const QUICK_PICK_OPTIONS = [1, 3, 5, 10, 25, 50];

export function QuickPickPanel({
  count,
  setCount,
  combinations,
  isRegenerating,
  regenerate,
  totalPrice,
  availableBalance,
  drawsCount,
  onAdd,
  isAdding,
}: QuickPickPanelProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* 1. Selector de cantidad */}
      <section className="rounded-[1.6rem] border border-manises-blue/10 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3 px-0.5">
          <div>
            <h3 className="text-sm font-black text-manises-blue uppercase tracking-widest">Jugada rápida demo</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Elige cuántas apuestas quieres generar</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 rounded-lg text-manises-blue hover:bg-slate-50",
              isRegenerating && "animate-spin"
            )}
            onClick={regenerate}
            disabled={isRegenerating}
          >
            <RefreshCircle className="w-4 h-4 mr-1.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Regenerar</span>
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {QUICK_PICK_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setCount(option)}
              className={cn(
                "rounded-xl border py-2 text-[11px] font-black transition-all active:scale-[0.95]",
                count === option
                  ? "bg-manises-blue border-manises-blue text-white shadow-md shadow-manises-blue/20"
                  : "bg-white border-slate-200 text-slate-500 hover:border-manises-blue/30"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Preview de combinaciones */}
      <section className="overflow-hidden rounded-[1.6rem] border border-manises-blue/10 bg-slate-50/50">
        <button
          onClick={() => setIsPreviewOpen(!isPreviewOpen)}
          className="flex w-full items-center justify-between p-3.5 transition-colors hover:bg-slate-100/50"
        >
          <div className="flex items-center gap-2.5">
            <Spark className="w-4 h-4 text-manises-gold" />
            <span className="text-[11px] font-black text-manises-blue uppercase tracking-widest">
              Ver combinaciones generadas
            </span>
          </div>
          {isPreviewOpen ? <NavArrowUp className="w-4 h-4" /> : <NavArrowDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {isPreviewOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-3.5 pb-3.5"
            >
              <div className="space-y-1.5 pt-1.5">
                {combinations.map((combo, idx) => (
                  <div key={combo.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-2 shadow-sm">
                    <span className="text-[10px] font-black text-slate-300 w-4">#{idx + 1}</span>
                    <div className="flex-1 flex flex-wrap gap-1 items-center justify-end">
                      {combo.numbers.map((n) => (
                        <span key={n} className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-[10px] font-black text-manises-blue">
                          {n}
                        </span>
                      ))}
                      {combo.stars?.map((s) => (
                        <span key={s} className="w-5 h-5 flex items-center justify-center rounded-full bg-manises-gold text-white text-[10px] font-black">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 3. Footer con Resumen y CTA */}
      <section className="rounded-[1.8rem] border border-manises-blue/10 bg-white p-4 shadow-lg">
        <div className="mb-4 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {count} {count === 1 ? 'jugada' : 'jugadas'} × {drawsCount} {drawsCount === 1 ? 'sorteo' : 'sorteos'}
            </p>
            <p className="text-[12px] font-black text-manises-blue">{formatCurrency(totalPrice)}</p>
          </div>
          
          <div className="flex items-center justify-between border-t border-slate-50 px-1 pt-2">
            <p className="text-[11px] font-black text-manises-blue uppercase tracking-widest">Total demo</p>
            <p className="text-lg font-black text-manises-blue">{formatCurrency(totalPrice)}</p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <div className={cn(
              "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider",
              availableBalance >= totalPrice ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              Saldo demo: {formatCurrency(availableBalance)}
            </div>
          </div>
        </div>

        <Button
          className="w-full rounded-2xl bg-manises-blue py-3 text-white shadow-lg shadow-manises-blue/20 transition-all active:scale-[0.98] disabled:opacity-50"
          onClick={onAdd}
          disabled={isAdding || availableBalance < totalPrice}
        >
          {isAdding ? 'Generando...' : `Añadir ${count} apuestas rápidas demo`}
        </Button>
        
        <p className="mt-2.5 text-center text-[8px] font-medium text-slate-400">
          Demo · combinaciones generadas de forma aleatoria · sin operación de compra
        </p>
      </section>
    </div>
  );
}
