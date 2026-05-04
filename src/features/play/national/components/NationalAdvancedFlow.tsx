import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Spark, ControlSlider } from 'iconoir-react/regular';
import { cn, formatDate } from '@/shared/lib/utils';
import { NationalTicketVisual, type NationalDrawType } from '@/features/play/components/NationalTicketVisual';
import { NationalSearchBar } from './NationalSearchBar';
import { NationalNumberShowcase } from './NationalNumberShowcase';
import { NationalTicketQuantitySelector } from './NationalTicketQuantitySelector';
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
  selectedNationalNumber: string | null;
  selectedNationalQuantity: number;
  maxNationalQuantity: number;
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
    addSelectedToCart: (deliveryMode: DeliveryMode) => void;
    onPersistToSession?: () => void;
  };

  onSelectNationalNumber: (ticket: NationalShowcaseItem) => void;
  onChangeNationalQuantity: (quantity: number) => void;
  onRandomNationalNumber: () => void;
  onClear: () => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function NationalAdvancedFlow({
  game,
  selectedNationalDraw,
  selectedNationalNumber,
  selectedNationalQuantity,
  maxNationalQuantity,
  drawStatus,
  supportsTimeSelection,
  availableNationalDates,
  effectiveSelectedDrawDates,
  onSelectDate,
  nationalShowcase,
  nationalCart,
  onSelectNationalNumber,
  onChangeNationalQuantity,
  onRandomNationalNumber,
  onClear,
}: NationalAdvancedFlowProps) {
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('custody');
  const [selectionMode, setSelectionMode] = useState<'random' | 'manual'>('random');

  // Auto-assign a random number when entering random mode with no number selected
  useEffect(() => {
    if (selectionMode === 'random' && !selectedNationalNumber && nationalShowcase.items.length > 0) {
      onRandomNationalNumber();
    }
    // Only re-run when selection mode changes, not on every render
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
          number={selectedNationalNumber}
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

      {/* 4a. Modo Aleatorio */}
      {selectionMode === 'random' && (
        <section className="space-y-3">
          {selectedNationalNumber ? (
            <>
              <NationalTicketQuantitySelector
                selectedNumber={selectedNationalNumber}
                selectedQuantity={selectedNationalQuantity}
                maxQuantity={maxNationalQuantity}
                decimoPrice={selectedNationalDraw.decimoPrice}
                firstPrize={selectedNationalDraw.firstPrize}
                onQuantityChange={onChangeNationalQuantity}
                onAddToCart={() => nationalCart.addSelectedToCart(deliveryMode)}
              />
              <button
                onClick={onRandomNationalNumber}
                className="w-full py-1.5 text-center text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-manises-blue transition-colors"
              >
                Cambiar número
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-[1.6rem] border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center">
              <Spark className="w-5 h-5 text-manises-gold" />
              <p className="text-[11px] font-bold text-slate-400">
                Buscando décimos disponibles…
              </p>
              <button
                onClick={onRandomNationalNumber}
                className="rounded-2xl px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-md transition-all active:scale-[0.97]"
                style={{ backgroundColor: game.color }}
              >
                Asignar número
              </button>
            </div>
          )}
        </section>
      )}

      {/* 4b. Modo Manual */}
      {selectionMode === 'manual' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              Números disponibles
            </p>
            <button
              onClick={onClear}
              className="text-[9px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
            >
              Limpiar
            </button>
          </div>
          <NationalSearchBar
            searchState={nationalShowcase.searchState}
            onChange={nationalShowcase.setSearchState}
          />
          <NationalNumberShowcase
            items={nationalShowcase.items}
            selectedNumber={selectedNationalNumber}
            onSelect={onSelectNationalNumber}
          />
          {selectedNationalNumber && (
            <NationalTicketQuantitySelector
              selectedNumber={selectedNationalNumber}
              selectedQuantity={selectedNationalQuantity}
              maxQuantity={maxNationalQuantity}
              decimoPrice={selectedNationalDraw.decimoPrice}
              firstPrize={selectedNationalDraw.firstPrize}
              onQuantityChange={onChangeNationalQuantity}
              onAddToCart={() => nationalCart.addSelectedToCart(deliveryMode)}
            />
          )}
        </section>
      )}

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
