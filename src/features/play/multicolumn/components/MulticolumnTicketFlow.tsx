import { useMemo } from 'react';
import { motion } from 'motion/react';
import type { LotteryGame } from '@/shared/types/domain';
import type { MulticolumnDraftIntent } from '../contracts/multicolumn-play.contract';
import { useMulticolumn } from '../hooks/useMulticolumn';
import { buildMulticolumnDraftIntent } from '../application/build-multicolumn-draft-intent';
import { getGameTheme } from '@/shared/lib/game-theme';
import { NumbersGrid } from '@/features/play/components/NumbersGrid';
import { StarsGrid } from '@/features/play/components/StarsGrid';
import { MulticolumnColumnSlider } from './MulticolumnColumnSlider';
import { MulticolumnActions } from './MulticolumnActions';
import { MulticolumnSummary } from './MulticolumnSummary';

interface MulticolumnTicketFlowProps {
  game: LotteryGame;
  drawDates: string[];
  initialColumnsCount?: number;
  onReviewColumns?: (intent: MulticolumnDraftIntent) => void;
}

/**
 * Orquestador visual del flujo multi-columna.
 * Integra la navegación, edición y resumen de apuestas múltiples.
 */
export function MulticolumnTicketFlow({
  game,
  drawDates,
  initialColumnsCount = 8,
  onReviewColumns,
}: MulticolumnTicketFlowProps) {
  const {
    state,
    summary,
    setActiveColumn,
    updateActiveColumn,
    clearActiveColumn,
    clearAllColumns,
    randomizeActiveColumn,
    randomizeAllColumns,
  } = useMulticolumn(game, initialColumnsCount, drawDates.length);

  const theme = useMemo(() => getGameTheme(game), [game]);
  const activeColumn = state.columns[state.activeColumnIndex];

  // Configuración de rangos (Euromillones, Primitiva, etc.)
  const totalNums = game.selectionRange?.numbers?.total ?? 49;
  const maxNums = game.selectionRange?.numbers?.max ?? game.selectionRange?.numbers?.min ?? 6;
  const totalStars = game.selectionRange?.stars?.total ?? 0;
  const maxStars = game.selectionRange?.stars?.max ?? game.selectionRange?.stars?.min ?? 0;

  // Generamos el mapeo de completitud para el slider
  const columnStatus = useMemo(() => {
    const status: Record<number, { isComplete: boolean }> = {};
    state.columns.forEach((col, i) => {
      status[i] = { isComplete: col.isComplete };
    });
    return status;
  }, [state.columns]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Slider de Navegación */}
      <section className="space-y-4">
        <div className="flex flex-col gap-1 px-1">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-sm text-manises-blue">Boleto multibloque</h2>
            <span className="text-[10px] font-black text-manises-blue/60 uppercase tracking-wider">
              {summary.completeColumns}/{state.columns.length} bloques
            </span>
          </div>
          <p className="text-[10px] font-medium text-slate-500">
            Rellena cada bloque con tus números, como en un boleto físico
          </p>
        </div>
        <MulticolumnColumnSlider
          columnsCount={state.columns.length}
          activeIndex={state.activeColumnIndex}
          onSelect={setActiveColumn}
          activeColor={game.color}
          columnStatus={columnStatus}
        />
      </section>

      {/* Editor de la Columna Activa */}
      <motion.section 
        key={state.activeColumnIndex}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col items-center gap-4 rounded-[1.6rem] border border-white/70 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] surface-neo-soft" style={theme.surface}>
          <NumbersGrid
            totalNums={totalNums}
            selectedNumbers={activeColumn.numbers}
            maxNumbersLimit={maxNums}
            onToggle={(n) => {
              const isSelected = activeColumn.numbers.includes(n);
              const nextNumbers = isSelected
                ? activeColumn.numbers.filter(num => num !== n)
                : [...activeColumn.numbers, n].sort((a, b) => a - b);
              updateActiveColumn(nextNumbers, activeColumn.stars);
            }}
            theme={theme}
            title={`Bloque ${state.activeColumnIndex + 1} de ${state.columns.length}`}
            subtitle={activeColumn.isComplete ? "Bloque completo" : activeColumn.numbers.length > 0 || activeColumn.stars.length > 0 ? "Faltan números" : "Bloque vacío"}
          />

          {maxStars > 0 && (
            <StarsGrid
              starValues={Array.from(
                { length: totalStars }, 
                (_, i) => game.type === 'gordo' ? i : i + 1
              )}
              selectedStars={activeColumn.stars}
              maxStarsLimit={maxStars}
              onToggle={(n) => {
                const isSelected = activeColumn.stars.includes(n);
                const nextStars = isSelected
                  ? activeColumn.stars.filter(s => s !== n)
                  : [...activeColumn.stars, n].sort((a, b) => a - b);
                updateActiveColumn(activeColumn.numbers, nextStars);
              }}
              theme={theme}
              title={game.type === 'gordo' ? 'Clave' : 'Estrellas'}
              labelPrefix={game.type === 'gordo' ? 'Clave' : 'Estrella'}
              subtitle={activeColumn.isComplete ? "Bloque completo" : activeColumn.numbers.length > 0 || activeColumn.stars.length > 0 ? "Faltan números" : "Bloque vacío"}
            />
          )}
        </div>
      </motion.section>

      {/* Acciones de Edición */}
      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <MulticolumnActions
          onClearColumn={clearActiveColumn}
          onClearAll={clearAllColumns}
          onRandomColumn={randomizeActiveColumn}
          onRandomAll={randomizeAllColumns}
          activeColor={game.color}
        />
      </section>

      {/* Resumen y Persistencia (Futura) */}
      <section className="rounded-3xl border border-manises-blue/10 bg-white p-5 shadow-sm">
        <MulticolumnSummary
          summary={summary}
          activeColor={game.color}
          onReview={() => {
            if (onReviewColumns) {
              const intent = buildMulticolumnDraftIntent(state, drawDates);
              onReviewColumns(intent);
            }
          }}
        />
      </section>
    </div>
  );
}
