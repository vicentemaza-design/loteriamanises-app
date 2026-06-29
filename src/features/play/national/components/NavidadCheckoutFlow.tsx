import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavArrowLeft, Spark, QrCode } from 'iconoir-react/regular';
import { Repeat2 } from 'lucide-react';
import {
  Smartphone, Truck, Check, Loader2, CreditCard,
  Wallet, AlertTriangle, CheckCircle2, Gift, ArrowRight, Eye,
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { PurchaseBottomBar } from '@/features/play/components/PurchaseBottomBar';
import { cn, formatCurrency } from '@/shared/lib/utils';
import type { LotteryGame } from '@/shared/types/domain';
import type { NationalShowcaseItem } from '../contracts/national-play.contract';
import { NationalTicketVisual } from '@/features/play/components/NationalTicketVisual';
import { NationalTicketThumbnail } from '@/features/play/components/NationalTicketThumbnail';

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 'selection' | 'cart' | 'recharge' | 'processing' | 'confirmed';
type DeliveryMode = 'custody' | 'shipping';

interface CartItem {
  number: string;
  serie?: string;
  fraccion?: string;
  quantity: number;
  unitPrice: number;
  deliveryMode: DeliveryMode;
  maxQuantity: number;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface NavidadCheckoutFlowProps {
  game: LotteryGame;
  showcaseItems: NationalShowcaseItem[];
  availableBalance: number;
  drawDate: string;
  onTopUp: (amount: number) => Promise<void>;
  onGoToTickets: () => void;
}

// ─── Navidad décimo mini-card ─────────────────────────────────────────────────

function NavidadDecimoCard({ number, active }: { number: string; active?: boolean }) {
  return (
    <div className="relative shrink-0">
      <NationalTicketThumbnail
        drawId="navidad"
        number={number}
        className="w-[88px] shadow-sm"
      />
      <span className="pointer-events-none absolute right-1 top-1 text-[6px] font-black uppercase tracking-[0.16em] text-slate-400/60">
        demo
      </span>
    </div>
  );
}

// ─── Recharge inline view ─────────────────────────────────────────────────────

const RECHARGE_AMOUNTS = [5, 10, 20, 50, 100, 200];
type PayMethod = 'apple' | 'bizum' | 'card';

interface RechargeViewProps {
  currentBalance: number;
  neededAmount: number;
  onBack: () => void;
  onSuccess: (amount: number) => Promise<void>;
}

function RechargeView({ currentBalance, neededAmount, onBack, onSuccess }: RechargeViewProps) {
  const shortfall = Math.max(0, neededAmount - currentBalance);
  const defaultAmount = RECHARGE_AMOUNTS.find(a => a >= shortfall) ?? RECHARGE_AMOUNTS[RECHARGE_AMOUNTS.length - 1];
  const [selected, setSelected] = useState(defaultAmount);
  const [method, setMethod] = useState<PayMethod>('apple');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRecharge = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    try {
      await onSuccess(selected);
      setIsSuccess(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-4 py-10 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Saldo añadido</p>
          <p className="mt-1 text-2xl font-black text-manises-blue">+{formatCurrency(selected)}</p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">Tu saldo ha sido actualizado</p>
        </div>
        <Button
          onClick={onBack}
          className="mt-2 w-full rounded-2xl py-3 font-black text-xs uppercase tracking-widest bg-manises-blue text-white"
        >
          Finalizar compra
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500"
        >
          <NavArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recargar saldo</p>
          <p className="text-sm font-black text-manises-blue">Te faltan {formatCurrency(shortfall)}</p>
        </div>
      </div>

      {/* Balance info */}
      <div className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
        <div className="flex-1 text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Saldo actual</p>
          <p className="mt-0.5 text-lg font-black text-manises-blue">{formatCurrency(currentBalance)}</p>
        </div>
        <div className="w-px bg-slate-200" />
        <div className="flex-1 text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total pedido</p>
          <p className="mt-0.5 text-lg font-black text-manises-blue">{formatCurrency(neededAmount)}</p>
        </div>
      </div>

      {/* Amount selector */}
      <div>
        <p className="mb-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Importe</p>
        <div className="grid grid-cols-3 gap-2">
          {RECHARGE_AMOUNTS.map(a => (
            <button
              key={a}
              onClick={() => setSelected(a)}
              className={cn(
                'rounded-xl border-2 py-2.5 text-sm font-black transition-all',
                selected === a
                  ? 'border-manises-blue bg-manises-blue text-white shadow-sm'
                  : 'border-slate-200 bg-white text-manises-blue hover:border-manises-blue/30'
              )}
            >
              {formatCurrency(a)}
            </button>
          ))}
        </div>
      </div>

      {/* Method */}
      <div>
        <p className="mb-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Método de pago</p>
        <div className="space-y-2">
          {([
            { id: 'apple' as PayMethod, label: 'Apple Pay', sub: 'Biometría · instantáneo', icon: <span className="text-base">🍎</span> },
            { id: 'bizum' as PayMethod, label: 'Bizum', sub: 'Tu número de teléfono', icon: <span className="text-base font-black text-[#00c4b3]">B</span> },
            { id: 'card' as PayMethod, label: 'Tarjeta guardada', sub: '•••• 4242', icon: <CreditCard className="h-4 w-4 text-manises-blue" /> },
          ] as { id: PayMethod; label: string; sub: string; icon: ReactNode }[]).map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl border-2 p-3 transition-all',
                method === m.id
                  ? 'border-manises-blue bg-manises-blue/[0.04]'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
                {m.icon}
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black text-manises-blue">{m.label}</p>
                <p className="text-[9px] font-medium text-slate-400">{m.sub}</p>
              </div>
              {method === m.id && (
                <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-manises-blue">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleRecharge}
        disabled={isProcessing}
        className="w-full rounded-2xl py-3.5 font-black text-xs uppercase tracking-widest bg-manises-blue text-white"
      >
        {isProcessing ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando…</>
        ) : (
          <>Recargar {formatCurrency(selected)} demo</>
        )}
      </Button>
      <p className="text-center text-[9px] font-medium text-slate-400">
        Simulación demo · sin cargo real
      </p>
    </div>
  );
}

// ─── Processing step ──────────────────────────────────────────────────────────

const PROCESS_STEPS = [
  'Verificando identidad',
  'Procesando pago',
  'Reservando décimos',
  'Confirmando pedido',
];

function ProcessingView() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers = PROCESS_STEPS.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), 600 + i * 700)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#991b1b]/10">
        <Loader2 className="h-8 w-8 animate-spin text-[#991b1b]" />
      </div>
      <div className="w-full space-y-3">
        <p className="mb-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          Procesando compra
        </p>
        {PROCESS_STEPS.map((label, i) => (
          <AnimatePresence key={label}>
            {i < visibleCount && (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3"
              >
                <div className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors',
                  i < visibleCount - 1
                    ? 'bg-emerald-100'
                    : 'bg-slate-100 animate-pulse'
                )}>
                  {i < visibleCount - 1
                    ? <Check className="h-3.5 w-3.5 text-emerald-600" />
                    : <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                  }
                </div>
                <span className="text-[12px] font-semibold text-manises-blue">{label}</span>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </div>
  );
}

// ─── Confirmed step ───────────────────────────────────────────────────────────

interface ConfirmedViewProps {
  items: CartItem[];
  totalPrice: number;
  orderRef: string;
  onViewTickets: () => void;
  onBuyMore: () => void;
}

function ConfirmedView({ items, totalPrice, orderRef, onViewTickets, onBuyMore }: ConfirmedViewProps) {
  const totalDecimos = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Success header */}
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
        >
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </motion.div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Pedido confirmado</p>
          <h2 className="mt-1 text-2xl font-black text-manises-blue">
            🎄 ¡Buena suerte!
          </h2>
          <p className="mt-1 text-[11px] font-medium text-slate-500">
            {totalDecimos} {totalDecimos === 1 ? 'décimo reservado' : 'décimos reservados'}
          </p>
        </div>
      </div>

      {/* Order ref */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Nº de pedido</p>
        <p className="mt-0.5 font-mono text-base font-black tracking-widest text-manises-blue">{orderRef}</p>
      </div>

      {/* Tickets list */}
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3"
          >
            <NavidadDecimoCard number={item.number} active />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-lg font-black tracking-[0.12em] text-manises-blue">{item.number}</p>
              <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                {item.quantity} {item.quantity === 1 ? 'décimo' : 'décimos'} ·{' '}
                {item.deliveryMode === 'custody' ? 'Custodia digital' : 'Mensajería'} ·{' '}
                {formatCurrency(item.quantity * item.unitPrice)}
              </p>
            </div>
            <div className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider',
              item.deliveryMode === 'custody'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            )}>
              {item.deliveryMode === 'custody' ? 'Digital' : 'Envío'}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-2xl border border-manises-blue/10 bg-manises-blue/[0.03] px-4 py-3">
        <span className="text-[11px] font-black uppercase tracking-widest text-manises-blue/60">Total pagado</span>
        <span className="text-lg font-black text-manises-blue">{formatCurrency(totalPrice)}</span>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          onClick={onViewTickets}
          className="w-full rounded-2xl py-3.5 font-black text-xs uppercase tracking-widest bg-manises-blue text-white"
        >
          <Gift className="mr-2 h-4 w-4" />
          Ver mis jugadas
        </Button>
        <Button
          variant="outline"
          onClick={onBuyMore}
          className="w-full rounded-2xl py-3 font-black text-xs uppercase tracking-widest border-slate-200 text-slate-500"
        >
          Comprar más décimos
        </Button>
      </div>

      <p className="text-center text-[9px] font-medium text-slate-400 pb-4">
        Recibirás confirmación por email · Servicio demo
      </p>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NavidadCheckoutFlow({
  game,
  showcaseItems,
  availableBalance,
  drawDate,
  onTopUp,
  onGoToTickets,
}: NavidadCheckoutFlowProps) {
  const [step, setStep] = useState<Step>('selection');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('custody');
  const [searchQuery, setSearchQuery] = useState('');
  const [minAvailability, setMinAvailability] = useState<0 | 10 | 20 | 30 | 50>(0);
  const [showFaltaSaldo, setShowFaltaSaldo] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(availableBalance);
  const [orderRef] = useState(() => `NAV-${Date.now().toString(36).toUpperCase().slice(-6)}`);

  // Sync balance updates from parent
  useEffect(() => {
    setCurrentBalance(availableBalance);
  }, [availableBalance]);

  const filteredItems = showcaseItems.filter(i => {
    if (searchQuery && !i.number.includes(searchQuery)) return false;
    if (minAvailability > 0 && i.available < minAvailability) return false;
    return true;
  });

  const totalDecimos = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const hasSufficientBalance = currentBalance >= totalPrice;

  const getCartItem = (number: string) => cart.find(i => i.number === number);

  const updateCart = (item: NationalShowcaseItem, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.number === item.number);
      if (!existing) {
        if (delta <= 0) return prev;
        return [...prev, {
          number: item.number,
          serie: item.serie,
          fraccion: item.fraccion,
          quantity: 1,
          unitPrice: item.decimoPrice,
          deliveryMode,
          maxQuantity: item.available,
        }];
      }
      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) return prev.filter(i => i.number !== item.number);
      return prev.map(i => i.number === item.number
        ? { ...i, quantity: Math.min(nextQty, i.maxQuantity), deliveryMode }
        : i
      );
    });
  };

  const removeFromCart = (number: string) => {
    setCart(prev => prev.filter(i => i.number !== number));
  };

  const updateCartDeliveryMode = (mode: DeliveryMode) => {
    setDeliveryMode(mode);
    setCart(prev => prev.map(i => ({ ...i, deliveryMode: mode })));
  };

  const handleContinueToCart = () => {
    if (cart.length === 0) return;
    setStep('cart');
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const handleFinalizarCompra = () => {
    if (!hasSufficientBalance) {
      setShowFaltaSaldo(true);
      return;
    }
    setStep('processing');
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    setTimeout(() => {
      setStep('confirmed');
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }, PROCESS_STEPS.length * 700 + 900);
  };

  const handleTopUpSuccess = async (amount: number) => {
    await onTopUp(amount);
    setCurrentBalance(prev => prev + amount);
    setShowFaltaSaldo(false);
  };

  const handleBuyMore = () => {
    setCart([]);
    setStep('selection');
    setSearchQuery('');
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  // ── Confirmed ─────────────────────────────────────────────────────────────
  if (step === 'confirmed') {
    return (
      <ConfirmedView
        items={cart}
        totalPrice={totalPrice}
        orderRef={orderRef}
        onViewTickets={onGoToTickets}
        onBuyMore={handleBuyMore}
      />
    );
  }

  // ── Processing ─────────────────────────────────────────────────────────────
  if (step === 'processing') {
    return <ProcessingView />;
  }

  // ── Recharge ───────────────────────────────────────────────────────────────
  if (step === 'recharge') {
    return (
      <RechargeView
        currentBalance={currentBalance}
        neededAmount={totalPrice}
        onBack={() => setStep('cart')}
        onSuccess={handleTopUpSuccess}
      />
    );
  }

  // ── Cart (Mi Cesta) ────────────────────────────────────────────────────────
  if (step === 'cart') {
    return (
      <div className="space-y-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep('selection')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500"
          >
            <NavArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mi cesta</p>
              <span className={cn(
                'rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider',
                deliveryMode === 'custody'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              )}>
                {deliveryMode === 'custody' ? 'Décimos digitales' : 'Mensajería'}
              </span>
            </div>
            <h2 className="text-base font-black text-manises-blue">
              {totalDecimos} {totalDecimos === 1 ? 'décimo' : 'décimos'}
            </h2>
          </div>
        </div>

        {/* Horizontal thumbnail carousel */}
        {cart.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-1 pt-0.5">
            {cart.map(item => (
              <div key={item.number} className="relative shrink-0">
                <NavidadDecimoCard number={item.number} active />
                {item.quantity > 1 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#991b1b] text-[8px] font-black text-white">
                    ×{item.quantity}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sorteo group header */}
        <div className="flex items-center justify-between px-0.5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Sorteo</p>
            <p className="text-sm font-black text-manises-blue">
              {new Date(drawDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className="text-[10px] font-medium text-slate-400">
            {cart.length} {cart.length === 1 ? 'número' : 'números'}
          </span>
        </div>

        {/* Cart items */}
        <div className="space-y-2.5">
          {cart.map(item => (
            <div
              key={item.number}
              className="rounded-[1.35rem] border border-slate-100 bg-white p-3 shadow-sm space-y-2.5"
            >
              <div className="flex items-center gap-3">
                <NavidadDecimoCard number={item.number} active />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-lg font-black tracking-[0.12em] text-manises-blue">{item.number}</p>
                  <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                    {formatCurrency(item.unitPrice)} / décimo
                  </p>
                </div>
                {/* Quantity stepper */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                  <button
                    onClick={() => removeFromCart(item.number)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black text-slate-400 hover:bg-white hover:text-manises-blue transition-colors"
                  >
                    {item.quantity <= 1 ? '×' : '−'}
                  </button>
                  <span className="w-6 text-center text-[13px] font-black text-manises-blue">{item.quantity}</span>
                  <button
                    onClick={() => setCart(prev => prev.map(i => i.number === item.number && i.quantity < i.maxQuantity ? { ...i, quantity: i.quantity + 1 } : i))}
                    disabled={item.quantity >= item.maxQuantity}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black text-slate-400 hover:bg-white hover:text-manises-blue transition-colors disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
                <span className="min-w-[52px] text-right text-[13px] font-black text-manises-blue">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </span>
              </div>

              {/* Acciones por décimo */}
              <div className="flex gap-2 border-t border-slate-50 pt-2">
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500 hover:border-manises-blue/20 hover:text-manises-blue transition-colors"
                >
                  <Eye className="h-3 w-3" />
                  Ver décimo
                </button>
                {deliveryMode === 'custody' && (
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-manises-blue/20 bg-manises-blue/[0.04] py-1.5 text-[9px] font-black uppercase tracking-wider text-manises-blue hover:bg-manises-blue/[0.08] transition-colors"
                  >
                    <Repeat2 className="h-3 w-3" />
                    Abonarme
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="rounded-[1.35rem] border border-slate-100 bg-white p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-400">Subtotal ({totalDecimos} décimos)</span>
            <span className="font-black text-manises-blue">{formatCurrency(totalPrice)}</span>
          </div>
          {deliveryMode === 'shipping' && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-400">Envío MRW</span>
              <span className="font-black text-manises-blue">Gratis demo</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-[12px] font-black uppercase tracking-widest text-manises-blue">Total</span>
            <span className="text-xl font-black text-manises-blue">{formatCurrency(totalPrice)}</span>
          </div>
        </div>

        {/* Balance banner */}
        <div className={cn(
          'flex items-center gap-3 rounded-2xl px-4 py-3',
          hasSufficientBalance
            ? 'border border-emerald-200 bg-emerald-50'
            : 'border border-rose-200 bg-rose-50'
        )}>
          <Wallet className={cn('h-4 w-4 shrink-0', hasSufficientBalance ? 'text-emerald-600' : 'text-rose-500')} />
          <div className="flex-1 min-w-0">
            <p className={cn('text-[10px] font-black', hasSufficientBalance ? 'text-emerald-700' : 'text-rose-700')}>
              {hasSufficientBalance
                ? `Saldo disponible: ${formatCurrency(currentBalance)}`
                : `Saldo insuficiente · disponible: ${formatCurrency(currentBalance)}`
              }
            </p>
            {!hasSufficientBalance && (
              <p className="mt-0.5 text-[9px] font-semibold text-rose-500">
                Te faltan {formatCurrency(totalPrice - currentBalance)}
              </p>
            )}
          </div>
          {!hasSufficientBalance && (
            <button
              onClick={() => setStep('recharge')}
              className="shrink-0 rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-rose-600 hover:bg-rose-50 transition-colors"
            >
              Recargar
            </button>
          )}
        </div>

        <PurchaseBottomBar
          availableBalance={currentBalance}
          totalPrice={totalPrice}
          canContinue={cart.length > 0}
          ctaLabel={hasSufficientBalance ? 'Finalizar' : 'Recargar'}
          onContinue={hasSufficientBalance ? handleFinalizarCompra : () => setStep('recharge')}
          activeColor={game.color}
          validationText="Añade al menos un décimo"
        />

        {/* Falta saldo modal overlay */}
        <AnimatePresence>
          {showFaltaSaldo && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
                onClick={() => setShowFaltaSaldo(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 80 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-[100] mx-auto max-w-screen-sm rounded-t-[2rem] bg-white px-5 pb-8 pt-5 shadow-2xl"
              >
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100">
                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-manises-blue">Falta saldo</h3>
                    <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-slate-500">
                      Necesitas {formatCurrency(totalPrice)} y tienes {formatCurrency(currentBalance)}.
                      Te faltan <strong>{formatCurrency(totalPrice - currentBalance)}</strong>.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => { setShowFaltaSaldo(false); setStep('recharge'); }}
                    className="w-full rounded-2xl py-3.5 font-black text-xs uppercase tracking-widest bg-manises-blue text-white"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Recargar saldo
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowFaltaSaldo(false)}
                    className="w-full rounded-2xl py-3 font-black text-xs uppercase tracking-widest text-slate-400"
                  >
                    Volver a la cesta
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Selection ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-20">
      {/* Navidad décimo visual */}
      <NationalTicketVisual
        number={cart[0]?.number ?? null}
        drawLabel={`Sorteo de Navidad ${new Date(drawDate).getFullYear()}`}
        drawDate={drawDate}
        price={game.price}
        drawType="navidad"
        gameId={game.id}
        className="shadow-xl"
      />

      {/* Delivery mode */}
      <div className="space-y-2.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-manises-blue">Tipo de entrega</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { id: 'custody' as DeliveryMode, label: 'Custodia digital', sub: 'Sin envío · digital', icon: <Smartphone className="h-4 w-4" /> },
            { id: 'shipping' as DeliveryMode, label: 'Mensajería', sub: 'Décimo físico a tu casa', icon: <Truck className="h-4 w-4" /> },
          ] as { id: DeliveryMode; label: string; sub: string; icon: ReactNode }[]).map(opt => (
            <button
              key={opt.id}
              onClick={() => updateCartDeliveryMode(opt.id)}
              className={cn(
                'flex items-center gap-2 rounded-2xl border-2 p-3 text-left transition-all',
                deliveryMode === opt.id
                  ? 'border-[#991b1b] bg-[#991b1b] text-white shadow-md'
                  : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
              )}
            >
              {opt.icon}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider">{opt.label}</p>
                <p className={cn('text-[8px] font-medium opacity-70', deliveryMode === opt.id ? 'text-white' : 'text-slate-400')}>
                  {opt.sub}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Búsqueda + QR */}
      <div className="space-y-2.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Números disponibles</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="Buscar por número…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-manises-blue placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#991b1b]/20 focus:border-[#991b1b]/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                ×
              </button>
            )}
          </div>
          <button
            type="button"
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-[#991b1b]/30 hover:text-[#991b1b] transition-colors"
            aria-label="Escanear QR"
          >
            <QrCode className="h-5 w-5" />
          </button>
        </div>

        {/* Filtros de disponibilidad */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {([0, 10, 20, 30, 50] as const).map(val => (
            <button
              key={val}
              type="button"
              onClick={() => setMinAvailability(val)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider transition-all',
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

      {/* Showcase */}
      <div className="space-y-2">
        {/* Décimo de la Suerte — card destacada */}
        <motion.div
          layout
          className="flex items-center gap-3 rounded-2xl border-2 border-manises-gold/40 bg-amber-50/60 p-3 cursor-pointer select-none transition-all hover:border-manises-gold/60"
          onClick={() => {
            const available = showcaseItems.filter(i => i.available > 0 && !getCartItem(i.number));
            if (available.length > 0) {
              const random = available[Math.floor(Math.random() * available.length)];
              updateCart(random, 1);
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const available = showcaseItems.filter(i => i.available > 0 && !getCartItem(i.number)); if (available.length > 0) { const random = available[Math.floor(Math.random() * available.length)]; updateCart(random, 1); } }}}
        >
          <div className="flex h-[52px] w-[88px] shrink-0 items-center justify-center rounded-xl border-2 border-manises-gold/40 bg-manises-gold/10">
            <Spark className="h-6 w-6 text-manises-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-black text-manises-blue">Décimo de la Suerte</p>
              <span className="rounded-full bg-manises-gold/20 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-manises-gold">
                Aleatorio
              </span>
            </div>
            <p className="mt-0.5 text-[9px] font-medium text-slate-400">
              Manises · {formatCurrency(showcaseItems[0]?.decimoPrice ?? 20)} · Número sorpresa
            </p>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-manises-gold/20 text-manises-gold">
            +
          </div>
        </motion.div>

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
                className={cn(
                  'flex items-center gap-3 rounded-2xl border-2 p-2.5 transition-all cursor-pointer select-none',
                  isInCart
                    ? 'border-[#991b1b] bg-[#991b1b]/[0.04]'
                    : 'border-slate-100 bg-white hover:border-[#991b1b]/30'
                )}
                onClick={() => updateCart(item, isInCart ? 0 : 1)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); updateCart(item, isInCart ? 0 : 1); }}}
              >
                <NavidadDecimoCard number={item.number} active={isInCart} />

                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xl font-black leading-none tracking-widest text-manises-blue">
                      {item.number}
                    </p>
                    <p className={cn(
                      'mt-1 text-[9px] font-semibold leading-none',
                      isInCart
                        ? 'text-[#991b1b]/70'
                        : item.available <= 1
                          ? 'text-amber-600'
                          : item.available <= 4
                            ? 'text-red-500'
                            : 'text-slate-400'
                    )}>
                      {isInCart
                        ? `${item.available <= 1 ? 'Último décimo' : `Quedan ${item.available}`} · máx. ${item.available}`
                        : item.available <= 1
                          ? 'Último décimo'
                          : `Quedan ${item.available}`}
                    </p>
                  </div>

                  {isInCart ? (
                    <div
                      className="flex items-center gap-0.5 rounded-xl border border-[#991b1b]/20 bg-white p-0.5 shadow-sm"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => updateCart(item, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black text-[#991b1b] hover:bg-[#991b1b]/10 transition-colors"
                      >
                        {qty <= 1 ? '×' : '−'}
                      </button>
                      <span className="w-5 text-center text-[13px] font-black text-[#991b1b]">{qty}</span>
                      <button
                        type="button"
                        onClick={() => updateCart(item, 1)}
                        disabled={qty >= item.available}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black text-[#991b1b] hover:bg-[#991b1b]/10 transition-colors disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    item.badge === 'destacado' ? (
                      <span className="rounded-full border border-[#991b1b]/15 bg-[#991b1b]/[0.05] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#991b1b]">
                        Top
                      </span>
                    ) : null
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <PurchaseBottomBar
        availableBalance={currentBalance}
        totalPrice={totalPrice}
        canContinue={cart.length > 0}
        ctaLabel={cart.length > 0 ? 'Mi cesta' : 'Elegir décimo'}
        onContinue={handleContinueToCart}
        activeColor={game.color}
        validationText="Elige al menos un décimo"
      />
    </div>
  );
}
