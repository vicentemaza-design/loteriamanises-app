import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, InfoCircle, NavArrowLeft, NavArrowRight } from 'iconoir-react/regular';
import { cn, formatCurrency } from '@/shared/lib/utils';
import type { ReducedSystemUI } from '../contracts/reduced-play.contract';
import type { LotteryGame } from '@/shared/types/domain';

interface ReducedSystemListProps {
  systems: ReducedSystemUI[];
  game: LotteryGame;
  drawsCount: number;
  selectedNumbers: number[];
  selectedStars: number[];
  onPlayWithSystem: (systemId: string) => void;
}

const DEMO_GUARANTEE_ROWS: Record<string, Array<{ label: string; min: number; max: number }>> = {
  reducida_4: [
    { label: 'Premio 1 (5+2 aciertos)', min: 1, max: 1 },
    { label: 'Premio 2 (5+1 aciertos)', min: 0, max: 2 },
    { label: 'Premio 3 (4+2 aciertos)', min: 0, max: 3 },
    { label: 'Premio 4 (4+1 aciertos)', min: 0, max: 8 },
    { label: 'Premio 5 (3+2 aciertos)', min: 0, max: 12 },
  ],
  reducida_3: [
    { label: 'Premio 1 (5+2 aciertos)', min: 0, max: 1 },
    { label: 'Premio 2 (5+1 aciertos)', min: 0, max: 1 },
    { label: 'Premio 3 (4+2 aciertos)', min: 1, max: 2 },
    { label: 'Premio 4 (4+1 aciertos)', min: 0, max: 4 },
    { label: 'Premio 5 (3+2 aciertos)', min: 0, max: 6 },
  ],
  reducida_2: [
    { label: 'Premio 1 (5+2 aciertos)', min: 0, max: 1 },
    { label: 'Premio 2 (5+1 aciertos)', min: 0, max: 1 },
    { label: 'Premio 3 (4+2 aciertos)', min: 0, max: 1 },
    { label: 'Premio 4 (4+1 aciertos)', min: 1, max: 2 },
    { label: 'Premio 5 (3+2 aciertos)', min: 0, max: 3 },
  ],
  reducida_1: [
    { label: 'Premio 1 (5+2 aciertos)', min: 0, max: 1 },
    { label: 'Premio 2 (5+1 aciertos)', min: 0, max: 1 },
    { label: 'Premio 3 (4+2 aciertos)', min: 0, max: 1 },
    { label: 'Premio 4 (4+1 aciertos)', min: 0, max: 1 },
    { label: 'Premio 5 (3+2 aciertos)', min: 1, max: 1 },
  ],
};

const DEFAULT_ROWS = [
  { label: 'Premio principal', min: 0, max: 1 },
  { label: 'Premio 2ª categoría', min: 0, max: 3 },
  { label: 'Premio 3ª categoría', min: 1, max: 5 },
  { label: 'Premio 4ª categoría', min: 0, max: 10 },
];

function generateDemoCombinations(numbers: number[], stars: number[], count: number) {
  const result: Array<{ numbers: number[]; stars: number[] }> = [];
  const n = numbers.length;
  const needNums = 5;
  const needStars = stars.length >= 2 ? 2 : stars.length;

  let idx = 0;
  for (let i = 0; i < n - needNums + 1 && result.length < count; i++) {
    for (let j = i + 1; j < n - needNums + 2 && result.length < count; j++) {
      for (let k = j + 1; k < n - needNums + 3 && result.length < count; k++) {
        for (let l = k + 1; l < n - needNums + 4 && result.length < count; l++) {
          for (let m = l + 1; m < n && result.length < count; m++) {
            const combo = {
              numbers: [numbers[i], numbers[j], numbers[k], numbers[l], numbers[m]],
              stars: stars.slice(0, needStars),
            };
            if ((idx % Math.ceil(n * n / count)) === 0 || result.length < Math.min(count, 25)) {
              result.push(combo);
            }
            idx++;
          }
        }
      }
    }
  }
  return result.slice(0, count);
}

export function ReducedSystemList({
  systems,
  game,
  drawsCount,
  selectedNumbers,
  selectedStars,
  onPlayWithSystem,
}: ReducedSystemListProps) {
  const [guaranteeSystem, setGuaranteeSystem] = useState<ReducedSystemUI | null>(null);
  const [developmentSystem, setDevelopmentSystem] = useState<ReducedSystemUI | null>(null);
  const [devPage, setDevPage] = useState(0);

  const DEV_PAGE_SIZE = 25;

  if (systems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <InfoCircle className="h-8 w-8 text-slate-300" />
        <p className="mt-2 text-[12px] font-black uppercase tracking-widest text-slate-400">
          Sin reducciones compatibles
        </p>
        <p className="mt-1 text-[11px] font-medium text-slate-400">
          Elige entre 10 y 30 números para ver las reducciones disponibles.
        </p>
      </div>
    );
  }

  const recommendedId = systems.find((s) => s.id.includes('reducida_4'))?.id ?? systems[0]?.id;

  const demoCombos = developmentSystem
    ? generateDemoCombinations(selectedNumbers, selectedStars, developmentSystem.betsCount)
    : [];
  const totalDevPages = developmentSystem ? Math.ceil(developmentSystem.betsCount / DEV_PAGE_SIZE) : 0;
  const pageStart = devPage * DEV_PAGE_SIZE;
  const pageEnd = Math.min(pageStart + DEV_PAGE_SIZE, demoCombos.length);
  const pageCombos = demoCombos.slice(pageStart, pageEnd);

  return (
    <>
      <div className="space-y-2">
        <div className="px-0.5">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-manises-blue">
            Reducciones disponibles
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-slate-400">
            Elige el tipo de reducción que prefieres. Puedes ver garantías y desarrollo antes de jugar.
          </p>
        </div>

        {systems.map((system) => {
          const isRecommended = system.id === recommendedId;
          const totalForDraws = system.totalPrice * (drawsCount || 1);

          return (
            <div
              key={system.id}
              className="overflow-hidden rounded-[1.3rem] border border-slate-100 bg-white shadow-sm"
            >
              {isRecommended && (
                <div className="border-b border-manises-gold/20 bg-manises-gold/[0.08] px-4 py-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-manises-blue">
                    ★ Recomendado
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-black leading-tight text-manises-blue">
                    {system.label}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                    {system.betsCount} {system.betsCount === 1 ? 'apuesta' : 'apuestas'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[13px] font-black text-manises-blue">
                    {formatCurrency(totalForDraws)}
                  </p>
                  {drawsCount > 1 && (
                    <p className="text-[9px] font-medium text-slate-400">{drawsCount} sorteos</p>
                  )}
                </div>
                <button
                  onClick={() => onPlayWithSystem(system.id)}
                  className="shrink-0 rounded-xl px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all active:scale-95"
                  style={{ backgroundColor: game.color }}
                >
                  Jugar
                </button>
              </div>

              <div className="flex border-t border-slate-50">
                <button
                  onClick={() => setGuaranteeSystem(system)}
                  className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold text-slate-400 transition-colors hover:bg-slate-50 hover:text-manises-blue border-r border-slate-50"
                >
                  <ShieldCheck className="h-3 w-3" />
                  Ver garantías
                </button>
                <button
                  onClick={() => { setDevelopmentSystem(system); setDevPage(0); }}
                  className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold text-slate-400 transition-colors hover:bg-slate-50 hover:text-manises-blue"
                >
                  <NavArrowRight className="h-3 w-3" />
                  Ver desarrollo
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pantalla garantías */}
      <AnimatePresence>
        {guaranteeSystem && (
          <motion.div
            key="guarantee-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end bg-black/50"
            onClick={() => setGuaranteeSystem(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="max-h-[88vh] w-full overflow-y-auto rounded-t-[2rem] bg-white"
              onClick={(e) => e.stopPropagation()}
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
            >
              {/* Handle */}
              <div className="flex justify-center pb-1 pt-3">
                <div className="h-1 w-10 rounded-full bg-slate-200" />
              </div>

              <div className="flex items-center justify-between px-5 py-3">
                <h2 className="text-[14px] font-black text-manises-blue">
                  Garantías – {guaranteeSystem.label}
                </h2>
                <button
                  onClick={() => setGuaranteeSystem(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[14px] font-bold text-slate-500 hover:bg-slate-200"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 px-5 pb-6">
                {/* Resumen */}
                <div className="flex items-center gap-3 rounded-[1.3rem] border border-manises-blue/10 bg-manises-blue/[0.04] px-4 py-3">
                  <div className="flex gap-2 text-[11px] font-semibold text-manises-blue/80">
                    <span>{selectedNumbers.length} núm.</span>
                    {selectedStars.length > 0 && <span>·</span>}
                    {selectedStars.length > 0 && <span>{selectedStars.length} estrellas</span>}
                    <span>·</span>
                    <span className="font-black">{guaranteeSystem.betsCount} apuestas</span>
                    <span>·</span>
                    <span className="font-black text-manises-blue">{formatCurrency(guaranteeSystem.totalPrice)}</span>
                  </div>
                </div>

                {/* Condición garantía */}
                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-[11px] font-medium leading-relaxed text-emerald-800">
                    {guaranteeSystem.guaranteeCondition}
                  </p>
                </div>

                {/* Tabla de garantías */}
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Garantías de premios
                  </p>
                  <div className="overflow-hidden rounded-xl border border-slate-100">
                    <div className="grid grid-cols-3 bg-slate-50 px-3 py-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Categoría</span>
                      <span className="text-center text-[9px] font-black uppercase tracking-wider text-slate-400">Mín. garantizado</span>
                      <span className="text-center text-[9px] font-black uppercase tracking-wider text-slate-400">Máx. posible</span>
                    </div>
                    {(DEMO_GUARANTEE_ROWS[guaranteeSystem.id] ?? DEFAULT_ROWS).map((row, i) => (
                      <div key={i} className="grid grid-cols-3 border-t border-slate-50 px-3 py-2.5">
                        <span className="text-[10px] font-medium text-slate-600">{row.label}</span>
                        <span className={cn(
                          'text-center text-[11px] font-black',
                          row.min > 0 ? 'text-emerald-600' : 'text-slate-400'
                        )}>{row.min}</span>
                        <span className="text-center text-[10px] font-medium text-slate-500">{row.max}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 px-1 text-[9px] font-medium italic text-slate-400">
                    * Datos demo para ilustrar la cobertura de la reducción seleccionada.
                  </p>
                </div>

                <button
                  onClick={() => { onPlayWithSystem(guaranteeSystem.id); setGuaranteeSystem(null); }}
                  className="w-full rounded-xl py-3.5 text-[11px] font-black uppercase tracking-widest text-white shadow-sm transition-all active:scale-[0.98]"
                  style={{ backgroundColor: game.color }}
                >
                  Jugar – {formatCurrency(guaranteeSystem.totalPrice * (drawsCount || 1))}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pantalla desarrollo */}
      <AnimatePresence>
        {developmentSystem && (
          <motion.div
            key="development-screen"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex flex-col bg-[#f8fafc]"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
              <button
                onClick={() => setDevelopmentSystem(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all active:scale-95"
                aria-label="Volver"
              >
                <NavArrowLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="text-[13px] font-black leading-tight text-manises-blue">
                  Desarrollo – {developmentSystem.label}
                </h2>
                <p className="text-[10px] font-medium text-slate-400">
                  {developmentSystem.betsCount} apuestas generadas
                </p>
              </div>
              <button
                onClick={() => { onPlayWithSystem(developmentSystem.id); setDevelopmentSystem(null); }}
                className="shrink-0 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all active:scale-95"
                style={{ backgroundColor: game.color }}
              >
                Jugar
              </button>
            </div>

            {/* Info */}
            <div className="px-4 py-2.5">
              <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-manises-blue">
                  {developmentSystem.betsCount} apuestas generadas
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                  Estas son todas las columnas generadas por la reducción. Cada fila representa una apuesta distinta.
                </p>
              </div>
            </div>

            {/* Lista de combinaciones */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {demoCombos.length > 0 ? (
                <div className="space-y-1.5">
                  {pageCombos.map((combo, idx) => {
                    const globalIdx = pageStart + idx;
                    return (
                      <div
                        key={globalIdx}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm"
                      >
                        <span className="w-16 shrink-0 text-[9px] font-black uppercase tracking-wider text-slate-400">
                          Columna {globalIdx + 1}
                        </span>
                        <div className="flex flex-1 flex-wrap items-center gap-1">
                          {combo.numbers.map((n) => (
                            <span
                              key={n}
                              className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-white"
                              style={{ backgroundColor: game.color }}
                            >
                              {n}
                            </span>
                          ))}
                          {combo.stars.length > 0 && (
                            <>
                              <span className="mx-0.5 text-[8px] text-slate-300">·</span>
                              {combo.stars.map((s) => (
                                <span
                                  key={s}
                                  className="flex h-5 w-5 items-center justify-center rounded-full bg-manises-gold text-[9px] font-black text-white"
                                >
                                  {s}
                                </span>
                              ))}
                            </>
                          )}
                        </div>
                        <NavArrowRight className="h-3 w-3 shrink-0 text-slate-300" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
                  <InfoCircle className="h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-[12px] font-black uppercase tracking-widest text-slate-400">
                    Selecciona números primero
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    Elige tus números en el boleto para ver el desarrollo de esta reducción.
                  </p>
                </div>
              )}
            </div>

            {/* Paginación */}
            {totalDevPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3">
                <button
                  onClick={() => setDevPage((p) => Math.max(0, p - 1))}
                  disabled={devPage === 0}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-bold transition-all active:scale-95',
                    devPage === 0 ? 'border-slate-100 text-slate-300' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  <NavArrowLeft className="h-3 w-3" /> Anterior
                </button>
                <span className="text-[10px] font-medium text-slate-400">
                  {pageStart + 1}–{pageEnd} de {developmentSystem.betsCount}
                </span>
                <button
                  onClick={() => setDevPage((p) => Math.min(totalDevPages - 1, p + 1))}
                  disabled={devPage >= totalDevPages - 1}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-bold transition-all active:scale-95',
                    devPage >= totalDevPages - 1 ? 'border-slate-100 text-slate-300' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  Siguiente <NavArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
