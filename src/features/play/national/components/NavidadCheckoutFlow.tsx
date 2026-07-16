import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Spark, NavArrowUp, NavArrowDown } from 'iconoir-react/regular';
import { Search, ShoppingCart } from 'lucide-react';
import { cn, formatCurrency } from '@/shared/lib/utils';
import type { NationalShowcaseItem } from '../contracts/national-play.contract';
import { NationalTicketThumbnail } from '@/features/play/components/NationalTicketThumbnail';

// ─── Types ───────────────────────────────────────────────────────────────────

type DeliveryMode = 'custody' | 'shipping';

interface CartItem {
  number: string;
  quantity: number;
  unitPrice: number;
  deliveryMode: DeliveryMode;
  maxQuantity: number;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface NavidadCheckoutFlowProps {
  showcaseItems: NationalShowcaseItem[];
  initialDeliveryMode?: DeliveryMode;
  drawId?: string;
  onConfirm: (items: Array<{ number: string; quantity: number; deliveryMode: DeliveryMode }>) => void;
}

// ─── Navidad décimo mini-card ─────────────────────────────────────────────────

function NavidadDecimoCard({ number, compact, drawId }: { number: string; active?: boolean; compact?: boolean; drawId?: string }) {
  return (
    <div className="relative shrink-0">
      <NationalTicketThumbnail
        drawId={drawId ?? 'navidad'}
        number={number}
        className={compact ? 'w-14 shadow-sm' : 'w-[88px] shadow-sm'}
      />
      {!compact && (
        <div className="absolute inset-x-0 bottom-0 rounded-b-md bg-black/55 py-1 text-center">
          <span className="font-mono text-[10px] font-black tracking-widest text-white leading-none">
            {number}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NavidadCheckoutFlow({
  showcaseItems,
  initialDeliveryMode = 'custody',
  drawId = 'navidad',
  onConfirm,
}: NavidadCheckoutFlowProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryMode] = useState<DeliveryMode>(initialDeliveryMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [minAvailability, setMinAvailability] = useState<0 | 10 | 20 | 30 | 50>(0);
  const [cartExpanded, setCartExpanded] = useState(false);
  const [activeCartNumber, setActiveCartNumber] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const stepperTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTicketTap = (number: string) => {
    if (stepperTimerRef.current) clearTimeout(stepperTimerRef.current);
    if (activeCartNumber === number) { setActiveCartNumber(null); return; }
    setActiveCartNumber(number);
    stepperTimerRef.current = setTimeout(() => setActiveCartNumber(null), 2000);
  };

  useEffect(() => {
    if (cart.length > 0) setCartExpanded(true);
  }, [cart.length]);

  const filteredItems = showcaseItems.filter(i => {
    if (searchQuery && !i.number.includes(searchQuery)) return false;
    if (minAvailability > 0 && i.available < minAvailability) return false;
    return true;
  });

  const totalDecimos = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const getCartItem = (number: string) => cart.find(i => i.number === number);

  const updateCart = (item: NationalShowcaseItem, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.number === item.number);
      if (!existing) {
        if (delta <= 0) return prev;
        return [...prev, {
          number: item.number,
          quantity: 1,
          unitPrice: item.decimoPrice,
          deliveryMode,
          maxQuantity: item.available,
        }];
      }
      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) return prev.filter(i => i.number !== item.number);
      return prev.map(i => i.number === item.number
        ? { ...i, quantity: Math.min(nextQty, i.maxQuantity) }
        : i
      );
    });
  };

  const removeFromCart = (number: string) => {
    setCart(prev => prev.filter(i => i.number !== number));
  };

  return (
    <div
      className="space-y-3 pb-[200px]"
      onClick={() => { if (cartExpanded) { setCartExpanded(false); setActiveCartNumber(null); } }}
    >
      {/* Buscador + lupa */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={searchInputRef}
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="Ej.: 12345 · 123 · 45"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value.replace(/\D/g, ''))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-manises-blue placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#991b1b]/20 focus:border-[#991b1b]/40"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
              ×
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => searchInputRef.current?.focus()}
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-[#991b1b]/30 hover:text-[#991b1b] transition-colors"
          aria-label="Buscar número"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Décimo de la Suerte */}
      <div
        className="flex items-center gap-2.5 rounded-2xl border-2 border-manises-gold/40 bg-amber-50/60 p-2.5 cursor-pointer select-none transition-all hover:border-manises-gold/60 active:scale-[0.98]"
        onClick={() => {
          const available = showcaseItems.filter(i => i.available > 0 && !getCartItem(i.number));
          if (available.length > 0) {
            const random = available[Math.floor(Math.random() * available.length)];
            updateCart(random, 1);
          }
        }}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const available = showcaseItems.filter(i => i.available > 0 && !getCartItem(i.number));
            if (available.length > 0) updateCart(available[Math.floor(Math.random() * available.length)], 1);
          }
        }}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-manises-gold/30 bg-manises-gold/10">
          <Spark className="h-4 w-4 text-manises-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-manises-blue">Décimo de la Suerte</p>
          <p className="text-[8px] font-medium text-slate-400">Elegido por Lotería Manises</p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-manises-gold/30 bg-white px-2.5 py-1 text-[9px] font-black text-manises-gold shadow-sm">
          Añadir {formatCurrency(showcaseItems[0]?.decimoPrice ?? 20)}
          <span className="text-sm leading-none">+</span>
        </div>
      </div>

      {/* Filtro disponibilidad mínima */}
      <div>
        <p className="mb-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">
          Mostrar números con disponibilidad mínima
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {([0, 10, 20, 30, 50] as const).map(val => (
            <button
              key={val}
              type="button"
              onClick={() => setMinAvailability(val)}
              className={cn(
                'rounded-full border py-1 text-[9px] font-black uppercase tracking-wider transition-all',
                minAvailability === val
                  ? 'border-[#991b1b] bg-[#991b1b] text-white'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-[#991b1b]/30'
              )}
            >
              {val === 0 ? 'Todos' : `+${val}`}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de números */}
      <div className="space-y-1">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50 py-10 px-6 text-center">
            <p className="text-sm font-bold text-slate-400">Sin resultados</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-slate-300">
              Prueba con otro número o filtro
            </p>
          </div>
        ) : (
          filteredItems.map(item => {
            const cartItem = getCartItem(item.number);
            const isInCart = !!cartItem;
            const qty = cartItem?.quantity ?? 0;

            return (
              <motion.div
                key={item.number}
                layout
                whileTap={{ scale: 0.97 }}
                transition={{ layout: { type: 'spring', stiffness: 400, damping: 30 } }}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl border-2 px-3 py-1.5 transition-all',
                  isInCart
                    ? 'border-[#991b1b]/30 bg-[#991b1b]/[0.04]'
                    : 'border-slate-100 bg-white'
                )}
              >
                <NavidadDecimoCard number={item.number} active={isInCart} compact drawId={drawId} />

                <div className="min-w-0 flex-1">
                  <p className="text-[1.1rem] font-black leading-none tracking-widest text-manises-blue tabular-nums">
                    {item.number}
                  </p>
                  <p className={cn(
                    'mt-0.5 text-[8px] font-semibold leading-none',
                    item.available <= 1 ? 'text-amber-600'
                      : item.available <= 4 ? 'text-red-500'
                      : 'text-slate-400'
                  )}>
                    {item.available <= 1 ? 'Último décimo' : `${item.available} disponibles`}
                  </p>
                </div>

                <div
                  className={cn(
                    'shrink-0 flex items-center rounded-xl border p-0.5 shadow-sm',
                    isInCart ? 'border-[#991b1b]/30 bg-white' : 'border-slate-200 bg-slate-50'
                  )}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => updateCart(item, -1)}
                    disabled={qty === 0}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black transition-colors',
                      isInCart
                        ? 'text-[#991b1b] hover:bg-[#991b1b]/10'
                        : 'text-slate-300 cursor-default'
                    )}
                  >
                    {isInCart && qty <= 1 ? '×' : '−'}
                  </button>
                  <span className={cn(
                    'w-5 text-center text-[12px] font-black tabular-nums',
                    isInCart ? 'text-[#991b1b]' : 'text-slate-300'
                  )}>{qty}</span>
                  <button
                    type="button"
                    onClick={() => updateCart(item, 1)}
                    disabled={qty >= item.available}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black transition-colors disabled:opacity-30 text-[#991b1b] hover:bg-[#991b1b]/10'
                    )}
                  >
                    +
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Panel inferior: carrusel colapsable + barra de acción */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden border-t border-slate-100 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.10)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Carrusel de thumbnails (expandible) */}
        <AnimatePresence>
          {cartExpanded && cart.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="flex gap-5 overflow-x-auto px-5 pt-3 pb-5">
                <AnimatePresence initial={false} mode="popLayout">
                  {cart.map(item => {
                    const isActive = activeCartNumber === item.number;
                    return (
                      <motion.div
                        key={item.number}
                        layout
                        initial={{ scale: 0.5, opacity: 0, y: 24 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, transition: { duration: 0.18 } }}
                        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                        className="relative shrink-0 cursor-pointer"
                        onClick={() => handleTicketTap(item.number)}
                      >
                        <NationalTicketThumbnail
                          drawId={drawId}
                          className="w-[100px] rounded-sm shadow-md"
                        />

                        {!isActive && (
                          <span className="pointer-events-none absolute inset-x-0 bottom-[57%] translate-x-2 text-center font-mono text-[15px] font-black tracking-tight text-black">
                            {item.number}
                          </span>
                        )}

                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="absolute inset-0 rounded-xl bg-black/75 flex items-center justify-center"
                              onClick={e => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-1 rounded-xl bg-white/15 p-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (item.quantity <= 1) { removeFromCart(item.number); setActiveCartNumber(null); }
                                    else setCart(prev => prev.map(i => i.number === item.number ? { ...i, quantity: i.quantity - 1 } : i));
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-black text-base hover:bg-white/20 transition-colors"
                                >
                                  {item.quantity <= 1 ? '×' : '−'}
                                </button>
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#991b1b] text-white font-black text-sm border-2 border-white/30">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setCart(prev => prev.map(i => i.number === item.number && i.quantity < i.maxQuantity ? { ...i, quantity: i.quantity + 1 } : i))}
                                  disabled={item.quantity >= item.maxQuantity}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-black text-base hover:bg-white/20 transition-colors disabled:opacity-30"
                                >
                                  +
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); removeFromCart(item.number); }}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[11px] font-black text-white shadow-sm hover:bg-rose-600 transition-colors"
                          aria-label={`Quitar ${item.number}`}
                        >
                          ×
                        </button>

                        {!isActive && (
                          <span className="absolute -bottom-2.5 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#991b1b] text-[9px] font-black text-white shadow-sm">
                            {item.quantity}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fila toggle: resumen + flecha */}
        <button
          type="button"
          onClick={() => cart.length > 0 && setCartExpanded(e => !e)}
          className={cn(
            'flex w-full items-center justify-between border-b border-slate-50 px-4 py-2.5 transition-colors',
            cart.length > 0 ? 'hover:bg-slate-50/60' : 'cursor-default'
          )}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-3.5 w-3.5 text-manises-blue/60 shrink-0" />
            {cart.length === 0 ? (
              <span className="text-[10px] font-medium text-slate-400">Elige al menos un décimo</span>
            ) : (
              <span className="text-[10px] font-black text-manises-blue">
                {cart.length} {cart.length === 1 ? 'número' : 'números'} · {totalDecimos} {totalDecimos === 1 ? 'décimo seleccionado' : 'décimos seleccionados'}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            cartExpanded
              ? <NavArrowDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              : <NavArrowUp className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          )}
        </button>

        {/* Barra de acción: total + CONTINUAR */}
        <div
          className="bg-[#0a4792]/88"
          style={{ backdropFilter: 'blur(24px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="mx-auto grid h-14 w-full max-w-screen-sm grid-cols-[1fr_1fr_2.15fr] text-white">
            <div className="relative flex min-w-0 flex-col items-center justify-center border-r border-white/12 px-1">
              <div className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-white/[0.035]" />
              <motion.p
                key={totalDecimos}
                initial={{ scale: 1.4, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 600, damping: 28 }}
                className="relative text-[1.05rem] font-black leading-none text-white tabular-nums"
              >
                {totalDecimos}
              </motion.p>
              <p className="relative mt-1 text-[0.5rem] font-bold uppercase leading-none tracking-[0.08em] text-white/58">
                Décimos
              </p>
            </div>
            <div className="relative flex min-w-0 flex-col items-center justify-center border-r border-white/12 px-1">
              <div className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-white/[0.035]" />
              <p className="relative text-[1.05rem] font-black leading-none text-white tabular-nums">
                {totalPrice.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                <sup className="ml-0.5 align-super text-[0.5rem] font-black">,00</sup>
              </p>
              <p className="relative mt-1 text-[0.5rem] font-bold uppercase leading-none tracking-[0.08em] text-white/58">
                Precio total
              </p>
            </div>
            <button
              type="button"
              onClick={() => { if (cart.length > 0) onConfirm(cart.map(i => ({ number: i.number, quantity: i.quantity, deliveryMode: i.deliveryMode }))); }}
              disabled={cart.length === 0}
              className={cn(
                'relative m-1.5 flex h-auto min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl px-3 transition-all active:scale-[0.985]',
                'shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_6px_14px_rgba(0,0,0,0.14)]',
                cart.length === 0
                  ? 'cursor-not-allowed bg-white/10 text-white/45 shadow-none'
                  : 'bg-manises-gold text-manises-blue'
              )}
            >
              <span className="absolute inset-x-4 top-0 h-px bg-white/45" />
              <span className="relative text-[0.9rem] font-black leading-none">Continuar</span>
              <span className="relative mt-0.5 text-[0.48rem] font-bold uppercase leading-none tracking-[0.08em] opacity-70">
                Añadir a cesta
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
