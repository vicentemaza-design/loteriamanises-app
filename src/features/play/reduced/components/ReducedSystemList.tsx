import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, InfoCircle, NavArrowLeft, NavArrowRight } from 'iconoir-react/regular';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { getReducedGuaranteeTable } from '../../lib/reduced-guarantees';
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

// El desarrollo de una reducción —qué apuestas concretas se juegan— lo
// produce el sistema de reducción del backend. Aquí había un
// generateDemoCombinations() que NO lo ejecutaba: recorría combinaciones
// por fuerza bruta y se quedaba con las primeras N, así que las columnas
// que enseñaba esta pantalla no eran las que se jugarían. Se ha retirado
// por el mismo motivo que las tablas de garantías inventadas (ver
// lib/reduced-guarantees.ts): mientras no haya desarrollo real, la
// pantalla lo dice en vez de rellenarlo.

export function ReducedSystemList({
  systems,
  game,
  drawsCount,
  selectedNumbers,
  selectedStars,
  onPlayWithSystem,
}: ReducedSystemListProps) {
  const [guaranteeSystem, setGuaranteeSystem] = useState<ReducedSystemUI | null>(null);

  // La tabla de garantías tiene una columna por porcentaje, así que
  // en móvil no cabe entera: se desplaza en horizontal. El aviso de
  // "desliza" solo se enseña si realmente hay algo que deslizar.
  const guaranteeTableRef = useRef<HTMLDivElement | null>(null);
  const [isGuaranteeTableScrollable, setIsGuaranteeTableScrollable] = useState(false);
  const [developmentSystem, setDevelopmentSystem] = useState<ReducedSystemUI | null>(null);

  const guaranteeTable = guaranteeSystem
    ? getReducedGuaranteeTable(game.id, guaranteeSystem.id, selectedNumbers.length)
    : null;

  useEffect(() => {
    const node = guaranteeTableRef.current;
    if (!node) {
      setIsGuaranteeTableScrollable(false);
      return;
    }
    const update = () => setIsGuaranteeTableScrollable(node.scrollWidth > node.clientWidth + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [guaranteeSystem, guaranteeTable]);

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
                  onClick={() => setDevelopmentSystem(system)}
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
                    {guaranteeTable?.highlight ?? guaranteeSystem.guaranteeCondition}
                  </p>
                </div>

                {/* Tabla de garantías — una columna por porcentaje. La
                    primera columna queda fija al desplazar en horizontal
                    para no perder de vista a qué categoría corresponde
                    cada celda. */}
                {guaranteeTable ? (
                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                      Porcentajes y garantías de premios
                    </p>

                    <div
                      ref={guaranteeTableRef}
                      className="scrollbar-hide overflow-x-auto rounded-xl border border-slate-100"
                    >
                      <table className="w-full min-w-max border-collapse">
                        <thead>
                          <tr>
                            <th className="sticky left-0 z-10 border-r border-slate-100 bg-slate-50 px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                              Categoría
                            </th>
                            {guaranteeTable.percentages.map((percentage) => (
                              <th
                                key={percentage}
                                className="whitespace-nowrap bg-manises-gold/[0.14] px-3 py-2 text-center text-[10px] font-black text-manises-blue"
                              >
                                {percentage}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {guaranteeTable.rows.map((row) => (
                            <tr key={row.category} className="border-t border-slate-50">
                              <th
                                scope="row"
                                className="sticky left-0 z-10 border-r border-slate-100 bg-white px-3 py-2.5 text-left"
                              >
                                <span className="block whitespace-nowrap text-[10px] font-black text-manises-blue">
                                  {row.category}
                                </span>
                                {row.prizeLabel && (
                                  <span className="block whitespace-nowrap text-[9px] font-medium text-slate-400">
                                    ({row.prizeLabel})
                                  </span>
                                )}
                              </th>
                              {row.cells.map((cell, i) => (
                                <td key={i} className="whitespace-nowrap px-3 py-2.5 text-center">
                                  {cell ? (
                                    <>
                                      <span className="block text-[9px] font-medium text-slate-400">
                                        Mín.{' '}
                                        <span className={cn(
                                          'text-[11px] font-black',
                                          cell.min > 0 ? 'text-emerald-600' : 'text-slate-400'
                                        )}>
                                          {cell.min}
                                        </span>
                                      </span>
                                      <span className="block text-[9px] font-medium text-slate-400">
                                        Máx.{' '}
                                        <span className="text-[11px] font-black text-manises-blue">
                                          {cell.max}
                                        </span>
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-[11px] font-bold text-slate-300" aria-label="Sin garantía">
                                      —
                                    </span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {isGuaranteeTableScrollable && (
                      <p className="mt-1.5 text-center text-[9px] font-medium text-slate-400">
                        Desliza para ver todas las garantías
                      </p>
                    )}

                    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-manises-blue/10 bg-manises-blue/[0.04] p-3">
                      <InfoCircle className="mt-0.5 h-4 w-4 shrink-0 text-manises-blue/50" />
                      <ul className="space-y-1.5">
                        {guaranteeTable.notes.map((note) => (
                          <li key={note} className="text-[10px] font-medium leading-relaxed text-slate-500">
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  /* Sin tabla cargada para esta combinación concreta de
                     juego · reducción · nº de números. Se enseña la
                     condición de garantía en texto y se dice que el
                     detalle no está todavía: nunca cifras inventadas
                     (ver reduced-guarantees.ts). */
                  <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <InfoCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-[11px] font-black text-manises-blue">
                        Detalle de garantías no disponible
                      </p>
                      <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-500">
                        Todavía no tenemos el desglose por categorías para {guaranteeSystem.label.toLowerCase()} con {selectedNumbers.length} números.
                        Se aplica la garantía indicada arriba.
                      </p>
                    </div>
                  </div>
                )}

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
                  {developmentSystem.betsCount} apuestas
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

            {/* Sin desarrollo real que enseñar: se dice, y se deja a la
                vista lo que sí se sabe con certeza —cuántas apuestas
                juega la reducción, con qué números y a qué precio—. */}
            <div className="flex-1 overflow-y-auto px-4 py-2.5">
              <div className="rounded-[1.3rem] border border-slate-100 bg-white px-4 py-4">
                <p className="text-[12px] font-black text-manises-blue">
                  Desarrollo no disponible
                </p>
                <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-slate-500">
                  Las apuestas concretas de esta reducción las genera el sistema de
                  reducción. Hasta que esté conectado no podemos mostrarlas, y preferimos
                  no enseñar columnas que no serían las que se juegan.
                </p>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                      Apuestas
                    </span>
                    <span className="text-[12px] font-black text-manises-blue">
                      {developmentSystem.betsCount}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                      Números jugados
                    </span>
                    <span className="text-[12px] font-black text-manises-blue">
                      {selectedNumbers.length}
                      {selectedStars.length > 0 && ` · ${selectedStars.length} estrellas`}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                      Importe
                    </span>
                    <span className="text-[12px] font-black text-manises-blue">
                      {formatCurrency(developmentSystem.totalPrice * (drawsCount || 1))}
                      {drawsCount > 1 && (
                        <span className="ml-1 text-[10px] font-medium text-slate-400">
                          {drawsCount} sorteos
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {selectedNumbers.length > 0 && (
                <div className="mt-3 rounded-[1.3rem] border border-slate-100 bg-white px-4 py-3.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Tu selección
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {selectedNumbers.map((n) => (
                      <span
                        key={n}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black text-white"
                        style={{ backgroundColor: game.color }}
                      >
                        {n}
                      </span>
                    ))}
                    {selectedStars.map((star) => (
                      <span
                        key={`s${star}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-manises-gold text-[11px] font-black text-white"
                      >
                        {star}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
