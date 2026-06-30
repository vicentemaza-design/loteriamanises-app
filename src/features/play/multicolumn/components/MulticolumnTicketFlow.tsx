import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavArrowLeft, NavArrowRight, Plus, RefreshCircle } from 'iconoir-react/regular';
import { cn } from '@/shared/lib/utils';
import type { LotteryGame } from '@/shared/types/domain';
import type { MulticolumnDraftIntent } from '../contracts/multicolumn-play.contract';
import { useMulticolumn } from '../hooks/useMulticolumn';
import { buildMulticolumnDraftIntent } from '../application/build-multicolumn-draft-intent';
import { getGameTheme } from '@/shared/lib/game-theme';
import { NumbersGrid } from '@/features/play/components/NumbersGrid';
import { StarsGrid } from '@/features/play/components/StarsGrid';
import { PurchaseBottomBar } from '@/features/play/components/PurchaseBottomBar';
import type { GamePlayBottomMenuItem } from '@/features/play/components/GamePlayBottomMenu';
import { MulticolumnActions } from './MulticolumnActions';

interface MulticolumnTicketFlowProps {
  game: LotteryGame;
  drawDates: string[];
  availableBalance: number;
  initialColumnsCount?: number;
  isSubscription?: boolean;
  onSubscriptionChange?: (val: boolean) => void;
  onReviewColumns?: (intent: MulticolumnDraftIntent) => void;
  menuItems?: GamePlayBottomMenuItem[];
}

function formatConfirmDate(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase().slice(0, 3);
  return `${weekday} ${d.getDate()}`;
}

interface SubscriptionToggleProps {
  isSubscription: boolean;
  onChange?: (val: boolean) => void;
}

function SubscriptionToggle({ isSubscription, onChange }: SubscriptionToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!isSubscription)}
      className={cn(
        'w-full text-left rounded-[1.6rem] border px-4 py-4 shadow-sm transition-all',
        isSubscription
          ? 'border-manises-blue/20 bg-manises-blue/[0.05]'
          : 'border-slate-100 bg-white hover:border-slate-200'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-manises-blue">Jugar todas las semanas</p>
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-400">
            Tus apuestas se jugarán automáticamente en los sorteos seleccionados.
          </p>
        </div>
        <div className={cn(
          'relative flex h-6 w-10 shrink-0 rounded-full transition-colors',
          isSubscription ? 'bg-manises-blue' : 'bg-slate-200'
        )}>
          <motion.div
            animate={{ x: isSubscription ? 18 : 2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
          />
        </div>
      </div>
    </button>
  );
}

export function MulticolumnTicketFlow({
  game,
  drawDates,
  availableBalance,
  initialColumnsCount = 1,
  isSubscription = false,
  onSubscriptionChange,
  onReviewColumns,
  menuItems,
}: MulticolumnTicketFlowProps) {
  const {
    state,
    summary,
    setActiveColumn,
    updateActiveColumn,
    clearActiveColumn,
    randomizeActiveColumn,
    randomizeColumn,
    randomizeAllColumns,
    addColumn,
  } = useMulticolumn(game, initialColumnsCount, drawDates.length);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmExpanded, setConfirmExpanded] = useState(false);

  const theme = useMemo(() => getGameTheme(game), [game]);
  const activeColumn = state.columns[state.activeColumnIndex];

  const totalNums = game.selectionRange?.numbers?.total ?? 49;
  const minNums = game.selectionRange?.numbers?.min ?? 6;
  const maxNums = game.selectionRange?.numbers?.max ?? minNums;
  const totalStars = game.selectionRange?.stars?.total ?? 0;
  const maxStars = game.selectionRange?.stars?.max ?? game.selectionRange?.stars?.min ?? 0;
  // Reintegro (Primitiva) y Clave (Gordo) son selección única que empieza en 0, no en 1
  const startsAtZero = game.type === 'gordo' || game.type === 'primitiva';
  const secondarySelectionLabel = game.type === 'gordo' ? 'Clave' : game.type === 'primitiva' ? 'Reintegro' : 'Estrellas';
  const secondarySelectionPrefix = game.type === 'gordo' ? 'Clave' : game.type === 'primitiva' ? 'Reintegro' : 'Estrella';

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
  const isLastColumn = state.activeColumnIndex === blockCount - 1;
  const handleAddAndGoToColumn = () => {
    addColumn();
    setActiveColumn(blockCount);
  };

  const completeColumnEntries = useMemo(
    () => state.columns
      .map((column, originalIndex) => ({ column, originalIndex }))
      .filter(({ column }) => column.isComplete && column.isValid),
    [state.columns]
  );
  const CONFIRM_VISIBLE = 3;
  const visibleConfirmCols = confirmExpanded ? completeColumnEntries : completeColumnEntries.slice(0, CONFIRM_VISIBLE);
  const hiddenConfirmCount = completeColumnEntries.length - CONFIRM_VISIBLE;

  const handleGoToConfirm = () => {
    setShowConfirm(true);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const handleConfirm = () => {
    if (!onReviewColumns) return;
    const intent = buildMulticolumnDraftIntent(state, drawDates);
    onReviewColumns(intent);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
    {showConfirm ? (
      <motion.div
        key="confirm"
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -32 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="space-y-4 pb-40"
      >
        {/* Resumen de sorteos */}
        <div className="rounded-[1.6rem] border border-manises-blue/10 bg-white px-4 py-3.5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
            {drawDates.length === 1 ? '1 sorteo seleccionado' : `${drawDates.length} sorteos seleccionados`}
          </p>
          <p className="mt-1.5 text-[13px] font-black text-manises-blue leading-tight">
            {drawDates.map(formatConfirmDate).join(' · ')}
          </p>
          <p className="mt-1 text-[11px] font-medium text-slate-400">Revisa tus apuestas antes de confirmar</p>
        </div>

        {/* Lista de apuestas completadas */}
        <div className="rounded-[1.6rem] border border-slate-100 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-slate-50">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-manises-blue">Tus apuestas</p>
            <button
              type="button"
              onClick={randomizeAllColumns}
              className="flex items-center gap-1.5 rounded-xl px-2 py-1 text-[9px] font-black uppercase tracking-widest text-manises-blue transition-all hover:bg-manises-blue/[0.06] active:scale-95"
              aria-label="Regenerar todas las apuestas"
            >
              <RefreshCircle className="h-3.5 w-3.5" />
              Regenerar todas
            </button>
          </div>
          <div className="space-y-1.5 p-3">
            {visibleConfirmCols.map(({ column, originalIndex }, idx) => (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.14, delay: idx * 0.04 }}
                className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-2.5 py-2"
              >
                <span className="w-8 shrink-0 text-[9px] font-black uppercase text-slate-400">
                  AP {originalIndex + 1}
                </span>
                <div className="flex flex-1 flex-wrap gap-1 items-center">
                  {column.numbers.map(n => (
                    <span
                      key={n}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-white"
                      style={{ backgroundColor: game.color }}
                    >
                      {n}
                    </span>
                  ))}
                  {column.stars.length > 0 && (
                    <span className="mx-0.5 text-[8px] text-slate-300">·</span>
                  )}
                  {column.stars.map(s => (
                    <span
                      key={s}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-manises-gold text-[9px] font-black text-white"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => randomizeColumn(originalIndex)}
                  className="shrink-0 rounded-lg p-1.5 text-manises-blue/50 transition-all hover:bg-manises-blue/[0.06] hover:text-manises-blue active:scale-90"
                  aria-label={`Regenerar AP ${originalIndex + 1}`}
                  title="Regenerar apuesta"
                >
                  <RefreshCircle className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
          {completeColumnEntries.length > CONFIRM_VISIBLE && (
            <button
              onClick={() => setConfirmExpanded(e => !e)}
              className="flex w-full items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[10px] font-medium text-slate-400 hover:bg-slate-50 transition-colors"
            >
              <span>{confirmExpanded ? 'Ocultar' : `Ver ${hiddenConfirmCount} apuestas más`}</span>
              <span>{confirmExpanded ? '↑' : '↓'}</span>
            </button>
          )}
        </div>

        {/* Toggle suscripción */}
        <SubscriptionToggle isSubscription={isSubscription} onChange={onSubscriptionChange} />

        {/* Volver a editar */}
        <button
          onClick={() => setShowConfirm(false)}
          className="flex items-center gap-1.5 px-1 text-[11px] font-bold text-slate-400 hover:text-manises-blue transition-colors"
        >
          <NavArrowLeft className="w-3.5 h-3.5" />
          Editar apuestas
        </button>

        <PurchaseBottomBar
          availableBalance={availableBalance}
          totalPrice={summary.totalPrice}
          canContinue={summary.isValid}
          ctaLabel="JUGAR"
          onContinue={handleConfirm}
          activeColor={game.color}
          drawsCount={drawDates.length}
          validationText="Completa al menos una apuesta"
          menuItems={menuItems}
        />
      </motion.div>
    ) : (
    <div className="flex flex-col gap-2 pb-40">
      {/* Navegación: flechas + "Apuesta X de Y" — el botón derecho crea la siguiente al llegar a la última */}
      <div className="flex items-center gap-2">
        <button
          onClick={goToPreviousColumn}
          disabled={state.activeColumnIndex === 0}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all active:scale-95 disabled:text-slate-200"
          aria-label="Apuesta anterior"
        >
          <NavArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-manises-blue">
            Apuesta {state.activeColumnIndex + 1} de {blockCount}
          </p>
        </div>
        <button
          onClick={isLastColumn ? handleAddAndGoToColumn : goToNextColumn}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all active:scale-95"
          aria-label={isLastColumn ? 'Crear nueva apuesta' : 'Apuesta siguiente'}
        >
          {isLastColumn ? <Plus className="h-4 w-4" /> : <NavArrowRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Acciones compactas encima del grid — solo Limpiar y Aleatorio */}
      <MulticolumnActions
        onClearColumn={clearActiveColumn}
        onRandomColumn={randomizeActiveColumn}
        activeColor={game.color}
      />

      {/* Grid de números — sin envoltorio con padding extra */}
      <motion.div
        key={state.activeColumnIndex}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.15 }}
      >
        <div className="rounded-2xl p-2" style={theme.surface}>
          {totalStars > 0 ? (
            <div className="flex gap-2 items-stretch">
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
                  title={`Elige ${minNums} números`}
                />
              </div>
              <div className="w-px self-stretch bg-gray-100 shrink-0 mt-5" />
              <div className="w-[80px] shrink-0">
                <StarsGrid
                  compact
                  gridCols={2}
                  starValues={Array.from(
                    { length: totalStars },
                    (_, i) => startsAtZero ? i : i + 1
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
                  title={secondarySelectionLabel}
                  labelPrefix={secondarySelectionPrefix}
                />
              </div>
            </div>
          ) : (
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
            />
          )}
        </div>
      </motion.div>

      {/* Abono — visible justo debajo del boleto, sin necesidad de scroll */}
      <SubscriptionToggle isSubscription={isSubscription} onChange={onSubscriptionChange} />

      <PurchaseBottomBar
        availableBalance={availableBalance}
        totalPrice={summary.totalPrice}
        canContinue={summary.isValid}
        ctaLabel="Jugar"
        onContinue={handleGoToConfirm}
        activeColor={game.color}
        drawsCount={drawDates.length}
        validationText="Completa al menos una apuesta"
        menuItems={menuItems}
      />
    </div>
    )}
    </AnimatePresence>
  );
}
