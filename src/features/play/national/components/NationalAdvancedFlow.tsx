import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Spark, NavArrowUp, NavArrowDown } from 'iconoir-react/regular';
import { Truck, X, ShoppingCart } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/shared/lib/utils';
import { NationalSearchBar } from './NationalSearchBar';
import { NationalNumberShowcase } from './NationalNumberShowcase';
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
  /** Modo de entrega pre-seleccionado desde el pre-flujo */
  initialDeliveryMode?: DeliveryMode;
  /** Ocultar la sección de fecha/sorteo (ya elegida en pantalla anterior) */
  hideSorteoSection?: boolean;
  /** Ocultar el selector de tipo de entrega (ya elegido en pantalla anterior) */
  hideDeliverySelector?: boolean;
  onSelectNationalNumber: (ticket: NationalShowcaseItem, deliveryMode: DeliveryMode) => void;
  onRandomNationalNumber: (deliveryMode: DeliveryMode) => void;
  onClear: () => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function splitCurrency(amount: number) {
  const [euros = '0', cents = '00'] = amount
    .toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .split(',');
  return { euros, cents };
}

export function NationalAdvancedFlow({
  game: _game,
  selectedNationalDraw,
  drawStatus,
  supportsTimeSelection,
  availableNationalDates,
  effectiveSelectedDrawDates,
  onSelectDate,
  nationalShowcase,
  nationalCart,
  availableBalance,
  initialDeliveryMode = 'custody',
  hideSorteoSection = false,
  hideDeliverySelector = false,
  onSelectNationalNumber,
  onRandomNationalNumber,
  onClear,
}: NationalAdvancedFlowProps) {
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(initialDeliveryMode);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [cartExpanded, setCartExpanded] = useState(false);

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

  useEffect(() => {
    if (deliveryMode === 'shipping' && !isShippingAvailable) {
      setDeliveryMode('custody');
      nationalCart.updateDeliveryMode('custody');
    }
  }, [deliveryMode, isShippingAvailable, nationalCart]);

  useEffect(() => {
    if (nationalCart.lines.length === 0) {
      setCartExpanded(false);
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

  const hasLines = nationalCart.lines.length > 0;
  const isOverBalance = availableBalance < nationalCart.breakdown.total;
  const balanceParts = splitCurrency(availableBalance);
  const totalParts = splitCurrency(nationalCart.breakdown.total);

  return (
    <div className="space-y-5 pb-[180px]">
      {/* 1. Sorteo */}
      {!hideSorteoSection && (
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
      )}

      {/* 2. Tipo de entrega */}
      {!hideDeliverySelector && (
        <NationalDeliverySelector
          selectedMode={deliveryMode}
          shippingAvailable={isShippingAvailable}
          onChange={(nextMode) => {
            setDeliveryMode(nextMode);
            nationalCart.updateDeliveryMode(nextMode);
          }}
          onShippingUnavailableClick={() => setShowShippingModal(true)}
        />
      )}

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

      {/* 3. Décimo de la Suerte */}
      <div className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-amber-200/60 bg-amber-50/50 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Spark className="h-4 w-4 shrink-0 text-manises-gold" />
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none text-manises-blue">
              Décimo de la Suerte
            </p>
            <p className="mt-0.5 text-[9px] font-medium leading-none text-slate-400">
              Elegido por Lotería Manises
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRandomNationalNumber(deliveryMode)}
          className="flex shrink-0 items-center gap-1 rounded-xl bg-manises-gold px-3 py-1.5 text-[9px] font-black text-manises-blue transition-all active:scale-95"
        >
          Añadir {formatCurrency(selectedNationalDraw.decimoPrice)}&nbsp;<span className="text-[13px] leading-none">+</span>
        </button>
      </div>

      {/* 4. Selección de décimos */}
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
          cartLines={nationalCart.lines}
          onToggle={(item) => onSelectNationalNumber(item, deliveryMode)}
          onIncrement={(number, drawId) => nationalCart.updateQuantity(number, drawId, 1)}
          onDecrement={handleDecrement}
        />
      </section>

      {/* Panel fijo inferior — números seleccionados */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden border-t border-slate-100 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.10)]"
      >
        {/* Contenido expandible — lista de décimos seleccionados */}
        <AnimatePresence>
          {cartExpanded && hasLines && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="max-h-[50vh] overflow-y-auto">
                {/* Cabecera */}
                <div className="flex items-center justify-between border-b border-slate-50 px-4 py-2.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Números seleccionados
                  </p>
                  <button
                    type="button"
                    onClick={nationalCart.clearCart}
                    className="text-[9px] font-black uppercase tracking-wider text-rose-400 transition-colors hover:text-rose-600"
                  >
                    Limpiar todo
                  </button>
                </div>

                {/* Filas por número */}
                <div className="divide-y divide-slate-50 px-4">
                  {nationalCart.lines.map((line) => (
                    <div
                      key={`${line.drawId}-${line.number}`}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-[1.1rem] font-black tracking-[0.16em] text-manises-blue">
                          {line.number}
                        </p>
                        <span className={cn(
                          'mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider',
                          line.deliveryMode === 'custody'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'border border-amber-200 bg-amber-50 text-amber-700'
                        )}>
                          {line.deliveryMode === 'custody' ? 'Digital' : 'Mensajería'}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <button
                            type="button"
                            onClick={() => {
                              if (line.quantity <= 1) nationalCart.removeLine(line.number, line.drawId);
                              else nationalCart.updateQuantity(line.number, line.drawId, -1);
                            }}
                            className="flex h-7 w-7 items-center justify-center text-[12px] font-black text-manises-blue transition-colors hover:bg-slate-50"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-[12px] font-black tabular-nums text-manises-blue">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => nationalCart.updateQuantity(line.number, line.drawId, 1)}
                            disabled={line.quantity >= line.maxQuantity}
                            className="flex h-7 w-7 items-center justify-center text-[12px] font-black text-manises-blue transition-colors hover:bg-slate-50 disabled:text-slate-200"
                          >
                            +
                          </button>
                        </div>
                        <p className="min-w-[3rem] text-right text-[11px] font-black text-manises-blue">
                          {formatCurrency(line.totalPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Envío si aplica */}
                {nationalCart.breakdown.hasShipping && (
                  <div className="flex items-center justify-between border-t border-slate-50 px-4 py-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Envío MRW
                    </span>
                    <span className="text-[11px] font-black text-manises-blue">
                      {formatCurrency(nationalCart.breakdown.shippingCost)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fila toggle */}
        <button
          type="button"
          onClick={() => hasLines && setCartExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between border-b border-slate-50 px-4 py-2.5"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-3.5 w-3.5 text-manises-blue/60" />
            {!hasLines ? (
              <span className="text-[10px] text-slate-400">Elige al menos un décimo</span>
            ) : (
              <span className="text-[10px] font-black text-manises-blue">
                {nationalCart.lines.length}{' '}
                {nationalCart.lines.length === 1 ? 'número' : 'números'}
                {' · '}
                {nationalCart.breakdown.totalDecimos}{' '}
                {nationalCart.breakdown.totalDecimos === 1 ? 'décimo' : 'décimos'} seleccionados
              </span>
            )}
          </div>
          {hasLines && (
            cartExpanded
              ? <NavArrowDown className="h-3.5 w-3.5 text-slate-400" />
              : <NavArrowUp className="h-3.5 w-3.5 text-slate-400" />
          )}
        </button>

        {/* Barra de acción */}
        <div
          className="bg-[#0a4792]/88"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
        <div className="mx-auto grid h-14 w-full max-w-screen-sm grid-cols-[1fr_1fr_2.15fr] text-white">
          {/* Saldo */}
          <div className="relative flex min-w-0 flex-col items-center justify-center border-r border-white/12 px-1">
            <div className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-white/[0.035]" />
            <p className={cn('relative text-[1.05rem] font-black leading-none', isOverBalance ? 'text-red-300' : 'text-manises-gold')}>
              {balanceParts.euros}
              <sup className="ml-0.5 align-super text-[0.5rem] font-black">,{balanceParts.cents}</sup>
            </p>
            <p className="relative mt-1 text-[0.5rem] font-bold uppercase tracking-[0.08em] leading-none text-white/58">
              Saldo €
            </p>
          </div>

          {/* Importe */}
          <div className="relative flex min-w-0 flex-col items-center justify-center border-r border-white/12 px-1">
            <div className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-white/[0.035]" />
            <p className="relative text-[1.05rem] font-black leading-none text-white">
              {totalParts.euros}
              <sup className="ml-0.5 align-super text-[0.5rem] font-black">,{totalParts.cents}</sup>
            </p>
            <p className="relative mt-1 text-[0.5rem] font-bold uppercase tracking-[0.08em] leading-none text-white/58">
              Importe €
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => nationalCart.onPersistToSession?.()}
            disabled={!hasLines}
            className={cn(
              'relative m-1.5 flex h-auto min-w-0 items-center justify-center overflow-hidden rounded-xl px-4 text-[1rem] font-black leading-none transition-all active:scale-[0.985]',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_6px_14px_rgba(0,0,0,0.14),0_0_14px_rgba(245,197,24,0.14)]',
              !hasLines
                ? 'cursor-not-allowed bg-white/10 text-white/45 shadow-none'
                : 'bg-manises-gold text-manises-blue'
            )}
          >
            <span className="absolute inset-x-4 top-0 h-px bg-white/45" />
            <span className="relative">
              {hasLines ? 'Añadir a cesta' : 'Elige décimo'}
            </span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
