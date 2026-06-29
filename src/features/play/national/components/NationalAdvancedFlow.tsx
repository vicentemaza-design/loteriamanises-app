import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Spark, ControlSlider } from 'iconoir-react/regular';
import { Truck, X } from 'lucide-react';
import { cn, formatDate } from '@/shared/lib/utils';
import { NationalSearchBar } from './NationalSearchBar';
import { NationalNumberShowcase } from './NationalNumberShowcase';
import { NationalCartSummary } from './NationalCartSummary';
import { NationalCheckoutReview } from './NationalCheckoutReview';
import { NationalDeliverySelector, type DeliveryMode } from './NationalDeliverySelector';
import { NationalDrawSelector } from './NationalDrawSelector';
import { PurchaseBottomBar } from '@/features/play/components/PurchaseBottomBar';

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
  const [showShippingModal, setShowShippingModal] = useState(false);
  const hasMounted = useRef(false);

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
    }
  }, [nationalCart.lines.length]);

  const statusColor = drawStatus.state === 'open'
    ? { dot: 'bg-emerald-400', text: 'text-emerald-600' }
    : drawStatus.state === 'closingSoon'
    ? { dot: 'bg-amber-400', text: 'text-amber-600' }
    : { dot: 'bg-slate-300', text: 'text-slate-400' };

  const statusLabel = drawStatus.state === 'open' ? 'Abierto'
    : drawStatus.state === 'closingSoon' ? 'Cierra pronto'
    : 'Cerrado';

  const goToCheckout = () => {
    if (nationalCart.lines.length === 0) return;
    setStep('checkout');
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  if (step === 'checkout') {
    return (
      <NationalCheckoutReview
        game={game}
        lines={nationalCart.lines}
        breakdown={nationalCart.breakdown}
        availableBalance={availableBalance}
        onBack={() => setStep('selection')}
        onViewTicket={() => {
          setStep('selection');
          window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
        }}
        onContinueToPayment={() => nationalCart.onPersistToSession?.()}
      />
    );
  }

  return (
    <div className="space-y-5 pb-20">
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
        onShippingUnavailableClick={() => setShowShippingModal(true)}
      />

      {/* Modal Envíos no disponibles */}
      <AnimatePresence>
        {showShippingModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
              onClick={() => setShowShippingModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-[100] mx-auto max-w-screen-sm rounded-t-[2rem] bg-white px-5 pb-10 pt-5 shadow-2xl"
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-200" />
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                  <Truck className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-manises-blue">Envíos no disponibles</h3>
                  <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
                    El envío por mensajería no está disponible porque el sorteo cierra en menos de 48 horas.
                    Puedes elegir <strong>custodia digital</strong> para este sorteo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowShippingModal(false)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-manises-blue px-4 py-3.5 font-black text-xs uppercase tracking-widest text-white transition-all active:scale-[0.98]"
              >
                <X className="h-4 w-4" />
                Entendido
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

      {/* 4. Cantidad (modo aleatorio) */}
      {selectionMode === 'random' && (() => {
        const primaryLine = nationalCart.lines[0] ?? null;
        const sameQty = primaryLine?.quantity ?? 0;
        const diffCount = nationalCart.lines.length > 0 ? nationalCart.lines.length - 1 : 0;
        return (
          <motion.section
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.2rem] border border-slate-100 bg-white p-4 shadow-sm space-y-3"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-manises-blue">
              ¿Cuántos décimos?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* Del mismo número */}
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 px-3 py-3">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 text-center leading-tight">
                  Del mismo número
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!primaryLine) return;
                      if (sameQty <= 1) {
                        nationalCart.removeLine(primaryLine.number, primaryLine.drawId);
                      } else {
                        nationalCart.updateQuantity(primaryLine.number, primaryLine.drawId, -1);
                      }
                    }}
                    disabled={sameQty === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-manises-blue text-sm font-black shadow-sm transition-all active:scale-95 disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-lg font-black text-manises-blue">{sameQty}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!primaryLine) {
                        onRandomNationalNumber(deliveryMode);
                      } else {
                        nationalCart.updateQuantity(primaryLine.number, primaryLine.drawId, 1);
                      }
                    }}
                    disabled={!!primaryLine && sameQty >= primaryLine.maxQuantity}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-manises-blue text-sm font-black shadow-sm transition-all active:scale-95 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* De distintos números */}
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 px-3 py-3">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 text-center leading-tight">
                  Distintos números
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (diffCount > 0) {
                        const lastLine = nationalCart.lines[nationalCart.lines.length - 1];
                        nationalCart.removeLine(lastLine.number, lastLine.drawId);
                      }
                    }}
                    disabled={diffCount === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-manises-blue text-sm font-black shadow-sm transition-all active:scale-95 disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-lg font-black text-manises-blue">{diffCount}</span>
                  <button
                    type="button"
                    onClick={() => onRandomNationalNumber(deliveryMode)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-manises-blue text-sm font-black shadow-sm transition-all active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        );
      })()}

      {/* 5. Selección de décimos */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
            {selectionMode === 'random' ? 'Cambiar número' : 'Números disponibles'}
          </p>
          <button
            onClick={onClear}
            className="text-[9px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
          >
            Limpiar
          </button>
        </div>

        {selectionMode === 'manual' && (
          <NationalSearchBar
            searchState={nationalShowcase.searchState}
            onChange={nationalShowcase.setSearchState}
          />
        )}

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
        availableBalance={availableBalance}
        activeColor={game.color}
      />

      <PurchaseBottomBar
        availableBalance={availableBalance}
        totalPrice={nationalCart.breakdown.total}
        canContinue={nationalCart.lines.length > 0}
        ctaLabel={nationalCart.lines.length > 0 ? 'Revisar' : 'Elegir décimo'}
        onContinue={goToCheckout}
        activeColor={game.color}
        drawsCount={effectiveSelectedDrawDates.length || 1}
        validationText="Elige al menos un décimo"
      />
    </div>
  );
}
