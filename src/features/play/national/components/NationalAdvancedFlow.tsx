import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Spark, ControlSlider } from 'iconoir-react/regular';
import { cn, formatDate } from '@/shared/lib/utils';
import { NationalTicketVisual, type NationalDrawType } from '@/features/play/components/NationalTicketVisual';
import { NationalSearchBar } from './NationalSearchBar';
import { NationalNumberShowcase } from './NationalNumberShowcase';
import { NationalCartSummary } from './NationalCartSummary';
import { NationalDeliverySelector, type DeliveryMode } from './NationalDeliverySelector';
import { NationalDrawSelector } from './NationalDrawSelector';

import type {
  NationalShowcaseItem,
  NationalCartLine,
  NationalOrderBreakdown,
  NationalSearchState
} from '../contracts/national-play.contract';
import type { LotteryGame } from '@/shared/types/domain';
import type { ResolvedDrawStatus } from '../../draw-status/contracts/draw-status.contract';

interface NationalDrawMeta {
  id: string;
  label: string;
  nextDraw: string;
  decimoPrice: number;
  firstPrize: number;
}

interface NationalAdvancedFlowProps {
  game: LotteryGame;
  selectedNationalDraw: NationalDrawMeta;
  drawsCount: number;
  drawStatus: ResolvedDrawStatus;
  supportsTimeSelection: boolean;
  availableNationalDates: string[];
  effectiveSelectedDrawDates: string[];
  onSelectDate: (dateIso: string) => void;

  nationalShowcase: {
    items: NationalShowcaseItem[];
    count: number;
    searchState: NationalSearchState;
    setSearchState: (state: NationalSearchState) => void;
  };

  nationalCart: {
    lines: NationalCartLine[];
    breakdown: NationalOrderBreakdown;
    removeLine: (number: string, drawId: NationalCartLine['drawId']) => void;
    updateQuantity: (number: string, drawId: NationalCartLine['drawId'], delta: number) => void;
    clearCart: () => void;
    onPersistToSession?: () => void;
  };

  onSelectNationalNumber: (ticket: NationalShowcaseItem) => void;
  onRandomNationalNumber: () => void;
  onClear: () => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function NationalAdvancedFlow({
  game,
  selectedNationalDraw,
  drawStatus,
  supportsTimeSelection,
  availableNationalDates,
  effectiveSelectedDrawDates,
  onSelectDate,
  nationalShowcase,
  nationalCart,
  onSelectNationalNumber,
  onRandomNationalNumber,
  onClear,
}: NationalAdvancedFlowProps) {
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('custody');
  const [selectionMode, setSelectionMode] = useState<'random' | 'manual'>('random');

  const previewLine = nationalCart.lines[0] ?? null;
  const previewNumber = previewLine?.number ?? null;
  const previewSerie = previewLine?.serie;
  const previewFraccion = previewLine?.fraccion;

  const handleDecrement = (number: string, drawId: NationalCartLine['drawId']) => {
    const line = nationalCart.lines.find(l => l.number === number && l.drawId === drawId);
    if (!line) return;
    if (line.quantity <= 1) {
      nationalCart.removeLine(number, drawId);
    } else {
      nationalCart.updateQuantity(number, drawId, -1);
    }
  };

  // Auto-assign when switching to random mode and nothing is selected yet
  useEffect(() => {
    if (selectionMode === 'random' && nationalCart.lines.length === 0 && nationalShowcase.items.length > 0) {
      onRandomNationalNumber();
    }
    // Only fires on mode change, not on every cart update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionMode]);

  const drawType: NationalDrawType = game.id === 'loteria-navidad' ? 'navidad' :
                                     game.id === 'loteria-nino' ? 'nino' : 'ordinary';

  const statusColor = drawStatus.state === 'open'
    ? { dot: 'bg-emerald-400', text: 'text-emerald-600' }
    : drawStatus.state === 'closingSoon'
    ? { dot: 'bg-amber-400', text: 'text-amber-600' }
    : { dot: 'bg-slate-300', text: 'text-slate-400' };

  const statusLabel = drawStatus.state === 'open' ? 'Abierto'
    : drawStatus.state === 'closingSoon' ? 'Cierra pronto'
    : 'Cerrado';

  return (
    <div className="space-y-5">
      {/* 1. Inline date context */}
      <section className="stagger-item">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2">
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', statusColor.dot)} />
          <span className="text-[11px] font-black text-manises-blue">
            {formatDate(selectedNationalDraw.nextDraw)}
          </span>
          <span className="text-slate-300">·</span>
          <span className={cn('text-[10px] font-semibold', statusColor.text)}>{statusLabel}</span>
          <span className="text-slate-300">·</span>
          <span className="text-[10px] font-semibold text-slate-400">
            {drawStatus.isDemoCutoff ? 'Límite demo' : 'Límite'} {formatTime(drawStatus.salesCloseAt)}
          </span>
        </div>
        {supportsTimeSelection && availableNationalDates.length > 0 && (
          <div className="mt-2">
            <NationalDrawSelector
              availableNationalDates={availableNationalDates}
              effectiveSelectedDrawDates={effectiveSelectedDrawDates}
              onSelectDate={onSelectDate}
            />
          </div>
        )}
      </section>

      {/* 2. Décimo visual — protagonista */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="stagger-item"
      >
        <NationalTicketVisual
          number={previewNumber}
          serie={previewSerie}
          fraccion={previewFraccion}
          drawLabel={selectedNationalDraw.label}
          drawDate={selectedNationalDraw.nextDraw}
          price={selectedNationalDraw.decimoPrice}
          gameId={game.id}
          drawType={drawType}
        />
      </motion.div>

      {/* 3. ¿Cómo quieres elegir tu número? */}
      <div
        className="rounded-[1.2rem] border-2 bg-white px-3.5 py-2.5 shadow-sm transition-colors"
        style={{ borderColor: `${game.color}30` }}
      >
        <p className="mb-2 px-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-manises-blue">
          ¿Cómo quieres elegir tu número?
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectionMode('random')}
            className={cn(
              'flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 transition-all active:scale-[0.97]',
              selectionMode === 'random'
                ? 'text-white shadow-lg'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
            )}
            style={selectionMode === 'random' ? { backgroundColor: game.color, borderColor: game.color } : undefined}
          >
            <Spark className={cn('w-3.5 h-3.5 shrink-0', selectionMode === 'random' ? 'text-white/90' : 'text-manises-gold')} />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Aleatorio</p>
              <p className={cn('text-[8px] font-semibold mt-0.5 leading-none', selectionMode === 'random' ? 'text-white/70' : 'text-slate-400')}>
                Número demo
              </p>
            </div>
          </button>
          <button
            onClick={() => setSelectionMode('manual')}
            className={cn(
              'flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 transition-all active:scale-[0.97]',
              selectionMode === 'manual'
                ? 'bg-white shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
            )}
            style={selectionMode === 'manual' ? { borderColor: game.color, color: game.color } : undefined}
          >
            <ControlSlider className="w-3.5 h-3.5 shrink-0" />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Elegir</p>
              <p className={cn('text-[8px] font-semibold mt-0.5 leading-none', selectionMode === 'manual' ? 'opacity-60' : 'text-slate-400')}>
                De la lista
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Escaparate unificado — visible en ambos modos */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
            Números disponibles
          </p>
          <div className="flex items-center gap-3">
            {selectionMode === 'random' && nationalCart.lines.length > 0 && (
              <button
                onClick={onRandomNationalNumber}
                className="text-[9px] font-black uppercase tracking-wider text-manises-blue/60 hover:text-manises-blue transition-colors"
              >
                Cambiar número
              </button>
            )}
            <button
              onClick={onClear}
              className="text-[9px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>

        <NationalSearchBar
          searchState={nationalShowcase.searchState}
          onChange={nationalShowcase.setSearchState}
        />

        <NationalNumberShowcase
          items={nationalShowcase.items}
          cartLines={nationalCart.lines}
          onToggle={onSelectNationalNumber}
          onIncrement={(number, drawId) => nationalCart.updateQuantity(number, drawId, 1)}
          onDecrement={handleDecrement}
        />
      </section>

      {/* 5. Selector de entrega */}
      <NationalDeliverySelector
        selectedMode={deliveryMode}
        onChange={setDeliveryMode}
      />

      {/* 6. Resumen de décimos seleccionados */}
      <NationalCartSummary
        lines={nationalCart.lines}
        breakdown={nationalCart.breakdown}
        onRemove={nationalCart.removeLine}
        onUpdateQuantity={nationalCart.updateQuantity}
        onClear={nationalCart.clearCart}
        onPersistToSession={nationalCart.onPersistToSession}
      />
    </div>
  );
}
