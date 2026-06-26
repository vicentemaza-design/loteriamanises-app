import { useMemo } from 'react';
import { motion } from 'motion/react';
import { NavArrowLeft, NavArrowRight } from 'iconoir-react/regular';
import type { LotteryGame } from '@/shared/types/domain';
import type { MulticolumnDraftIntent } from '../contracts/multicolumn-play.contract';
import { useMulticolumn } from '../hooks/useMulticolumn';
import { buildMulticolumnDraftIntent } from '../application/build-multicolumn-draft-intent';
import { getGameTheme } from '@/shared/lib/game-theme';
import { NumbersGrid } from '@/features/play/components/NumbersGrid';
import { StarsGrid } from '@/features/play/components/StarsGrid';
import { PurchaseBottomBar } from '@/features/play/components/PurchaseBottomBar';
import { MulticolumnColumnSlider } from './MulticolumnColumnSlider';
import { MulticolumnActions } from './MulticolumnActions';

interface MulticolumnTicketFlowProps {
  game: LotteryGame;
  drawDates: string[];
  availableBalance: number;
  initialColumnsCount?: number;
  onReviewColumns?: (intent: MulticolumnDraftIntent) => void;
}

export function MulticolumnTicketFlow({
  game,
  drawDates,
  availableBalance,
  initialColumnsCount = 1,
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
    addColumn,
    removeColumn,
  } = useMulticolumn(game, initialColumnsCount, drawDates.length);

  const theme = useMemo(() => getGameTheme(game), [game]);
  const activeColumn = state.columns[state.activeColumnIndex];

  const totalNums = game.selectionRange?.numbers?.total ?? 49;
  const maxNums = game.selectionRange?.numbers?.max ?? game.selectionRange?.numbers?.min ?? 6;
  const totalStars = game.selectionRange?.stars?.total ?? 0;
  const maxStars = game.selectionRange?.stars?.max ?? game.selectionRange?.stars?.min ?? 0;

  const columnStatus = useMemo(() => {
    const status: Record<number, { isComplete: boolean; hasData: boolean }> = {};
    state.columns.forEach((col, i) => {
      status[i] = {
        isComplete: col.isComplete,
        hasData: col.numbers.length > 0 || col.stars.length > 0,
      };
    });
    return status;
  }, [state.columns]);

  const blockCount = state.columns.length;
  const completeCount = summary.completeColumns;
  const counterLabel = blockCount === 1
    ? '1 apuesta'
    : `${completeCount} de ${blockCount} completas`;

  const blockSubtitle = activeColumn.isComplete
    ? 'Apuesta completa'
    : activeColumn.numbers.length > 0 || activeColumn.stars.length > 0
      ? 'Faltan números'
      : 'Apuesta vacía';
  const goToPreviousColumn = () => setActiveColumn(Math.max(0, state.activeColumnIndex - 1));
  const goToNextColumn = () => setActiveColumn(Math.min(blockCount - 1, state.activeColumnIndex + 1));
  const handleReview = () => {
    if (!onReviewColumns) return;
    const intent = buildMulticolumnDraftIntent(state, drawDates);
    onReviewColumns(intent);
  };

  return (
    <div className="space-y-4 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Selector de apuestas */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="font-black text-sm text-manises-blue">Boleto {game.name}</h2>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Rellena una o varias apuestas manuales</p>
          </div>
          <span className="text-[10px] font-medium text-slate-400 shrink-0 ml-2">{counterLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousColumn}
            disabled={state.activeColumnIndex === 0}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all active:scale-95 disabled:text-slate-200"
            aria-label="Apuesta anterior"
            title="Apuesta anterior"
          >
            <NavArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <MulticolumnColumnSlider
              columnsCount={blockCount}
              activeIndex={state.activeColumnIndex}
              onSelect={setActiveColumn}
              activeColor={game.color}
              columnStatus={columnStatus}
              onAddColumn={addColumn}
            />
          </div>
          <button
            onClick={goToNextColumn}
            disabled={state.activeColumnIndex >= blockCount - 1}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all active:scale-95 disabled:text-slate-200"
            aria-label="Apuesta siguiente"
            title="Apuesta siguiente"
          >
            <NavArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Editor de la apuesta activa */}
      <motion.section
        key={state.activeColumnIndex}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-3"
      >
        <div className="rounded-2xl p-3" style={theme.surface}>
          {totalStars > 0 ? (
            // Números + estrellas en la misma vista sin scroll entre ambos bloques
            <div className="flex gap-2 items-start">
              <div className="flex-1 min-w-0">
                <NumbersGrid
                  compact
                  columns={5}
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
                  title="Números"
                />
              </div>
              <div className="w-px self-stretch bg-gray-100 shrink-0 mt-5" />
              <div className="w-[76px] shrink-0">
                <StarsGrid
                  compact
                  gridCols={2}
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
                />
              </div>
            </div>
          ) : (
            // Sin estrellas (Bonoloto, Primitiva…): grid full-width
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
              title={`Apuesta ${state.activeColumnIndex + 1} de ${blockCount}`}
              subtitle={blockSubtitle}
            />
          )}
        </div>
      </motion.section>

      {/* Acciones */}
      <section className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        <MulticolumnActions
          onClearColumn={clearActiveColumn}
          onClearAll={clearAllColumns}
          onRandomColumn={randomizeActiveColumn}
          onRandomAll={randomizeAllColumns}
          onRemoveColumn={() => removeColumn(state.activeColumnIndex)}
          canRemoveColumn={blockCount > 1}
          activeColor={game.color}
        />
      </section>

      <PurchaseBottomBar
        availableBalance={availableBalance}
        totalPrice={summary.totalPrice}
        canContinue={summary.isValid}
        ctaLabel={`Añadir ${summary.completeColumns || 1} ${summary.completeColumns === 1 ? 'apuesta' : 'apuestas'}`}
        onContinue={handleReview}
        activeColor={game.color}
        drawsCount={drawDates.length}
        validationText="Completa al menos una apuesta"
      />
    </div>
  );
}
