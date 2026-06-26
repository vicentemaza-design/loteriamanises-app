import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Spark, ControlSlider, WarningTriangle } from 'iconoir-react/regular';
import { cn, formatDate } from '@/shared/lib/utils';
import { NationalTicketVisual, type NationalDrawType } from '@/features/play/components/NationalTicketVisual';
import { PurchaseBottomBar } from '@/features/play/components/PurchaseBottomBar';
import { NationalSearchBar } from './NationalSearchBar';
import { NationalNumberShowcase } from './NationalNumberShowcase';
import { NationalCartSummary } from './NationalCartSummary';
import { NationalCheckoutReview } from './NationalCheckoutReview';
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
    updateDeliveryMode: (deliveryMode: NationalCartLine['deliveryMode']) => void;
    clearCart: () => void;
    onPersistToSession?: () => void;
  };

  availableBalance: number;
  onSelectNationalNumber: (ticket: NationalShowcaseItem, deliveryMode: DeliveryMode) => void;
  onRandomNationalNumber: (deliveryMode: DeliveryMode) => void;
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
  availableBalance,
  onSelectNationalNumber,
  onRandomNationalNumber,
  onClear,
}: NationalAdvancedFlowProps) {
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('custody');
  const [selectionMode, setSelectionMode] = useState<'random' | 'manual'>('manual');
  const [step, setStep] = useState<'selection' | 'checkout'>('selection');
  const [previewNumberOverride, setPreviewNumberOverride] = useState<string | null>(null);
  const hasMounted = useRef(false);

  const previewLine = nationalCart.lines[0] ?? null;
  const previewNumber = previewNumberOverride ?? previewLine?.number ?? null;

  const handleDecrement = (number: string, drawId: NationalCartLine['drawId']) => {
    const line = nationalCart.lines.find(l => l.number === number && l.drawId === drawId);
    if (!line) return;
    if (line.quantity <= 1) {
      nationalCart.removeLine(number, drawId);
    } else {
      nationalCart.updateQuantity(number, drawId, -1);
    }
  };

  const hoursUntilClose = (new Date(drawStatus.salesCloseAt).getTime() - Date.now()) / 36e5;
  const isShippingAvailable = drawStatus.state === 'open' && hoursUntilClose >= 48;

  // Auto-assign only when user explicitly switches to random mode (skip mount)
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (selectionMode === 'random' && nationalCart.lines.length === 0 && nationalShowcase.items.length > 0) {
      onRandomNationalNumber(deliveryMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionMode]);

  useEffect(() => {
    if (deliveryMode === 'shipping' && !isShippingAvailable) {
      setDeliveryMode('custody');
      nationalCart.updateDeliveryMode('custody');
    }
  }, [deliveryMode, isShippingAvailable, nationalCart]);

  useEffect(() => {
    if (nationalCart.lines.length === 0) {
      setStep('selection');
      setPreviewNumberOverride(null);
    }
  }, [nationalCart.lines.length]);

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

  if (step === 'checkout') {
    return (
      <NationalCheckoutReview
        game={game}
        lines={nationalCart.lines}
        breakdown={nationalCart.breakdown}
        availableBalance={availableBalance}
        onBack={() => setStep('selection')}
        onViewTicket={(line) => {
          setPreviewNumberOverride(line.number);
          setStep('selection');
          window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
        }}
        onContinueToPayment={() => nationalCart.onPersistToSession?.()}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Sorteo */}
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

      {/* 2. Tipo de entrega */}
      <NationalDeliverySelector
        selectedMode={deliveryMode}
        shippingAvailable={isShippingAvailable}
        onChange={(nextMode) => {
          setDeliveryMode(nextMode);
          nationalCart.updateDeliveryMode(nextMode);
        }}
      />

      {!isShippingAvailable && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
          <WarningTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-[10px] font-bold leading-relaxed text-amber-800">
            Mensajería no disponible por proximidad al sorteo. Puedes usar custodia digital para este sorteo.
          </p>
        </div>
      )}

      {/* 3. Forma de obtener números */}
      <div
        className="rounded-[1.2rem] border-2 bg-white px-3.5 py-2.5 shadow-sm transition-colors"
        style={{ borderColor: `${game.color}30` }}
      >
        <p className="mb-2 px-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-manises-blue">
          ¿Cómo quieres elegir tu número?
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectionMode('manual')}
            className={cn(
              'flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 transition-all active:scale-[0.97]',
              selectionMode === 'manual'
                ? 'text-white shadow-lg'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
            )}
            style={selectionMode === 'manual' ? { backgroundColor: game.color, borderColor: game.color } : undefined}
          >
            <ControlSlider className="w-3.5 h-3.5 shrink-0" />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Elegir número</p>
              <p className={cn('text-[8px] font-semibold mt-0.5 leading-none', selectionMode === 'manual' ? 'text-white/70' : 'text-slate-400')}>
                Buscar o filtrar
              </p>
            </div>
          </button>
          <button
            onClick={() => {
              setSelectionMode('random');
              if (nationalCart.lines.length === 0) {
                onRandomNationalNumber(deliveryMode);
              }
            }}
            className={cn(
              'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all active:scale-[0.97]',
              selectionMode === 'random'
                ? 'border-manises-gold bg-amber-50 text-manises-blue shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
            )}
          >
            <Spark className="w-3.5 h-3.5 shrink-0 text-manises-gold" />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Décimo de la Suerte</p>
              <p className="mt-0.5 text-[8px] font-semibold leading-none text-slate-400">
                Aleatorio
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Décimo visual — protagonista */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="stagger-item"
      >
        <NationalTicketVisual
          number={previewNumber}
          drawLabel={selectedNationalDraw.label}
          drawDate={selectedNationalDraw.nextDraw}
          price={selectedNationalDraw.decimoPrice}
          gameId={game.id}
          drawType={drawType}
        />
      </motion.div>

      {/* 5. Selección de décimos */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
            Números disponibles
          </p>
          <div className="flex items-center gap-3">
            {selectionMode === 'random' && nationalCart.lines.length > 0 && (
              <button
                onClick={() => onRandomNationalNumber(deliveryMode)}
                className="text-[9px] font-black uppercase tracking-wider text-manises-blue/60 hover:text-manises-blue transition-colors"
              >
                Otro décimo
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
          onToggle={(item) => onSelectNationalNumber(item, deliveryMode)}
          onIncrement={(number, drawId) => nationalCart.updateQuantity(number, drawId, 1)}
          onDecrement={handleDecrement}
        />
      </section>

      {/* 6. Cesta */}
      <NationalCartSummary
        lines={nationalCart.lines}
        breakdown={nationalCart.breakdown}
        onRemove={nationalCart.removeLine}
        onUpdateQuantity={nationalCart.updateQuantity}
        onClear={nationalCart.clearCart}
        onContinue={nationalCart.onPersistToSession ? () => {
          setStep('checkout');
          window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
        } : undefined}
        availableBalance={availableBalance}
        activeColor={game.color}
      />
    </div>
  );
}
