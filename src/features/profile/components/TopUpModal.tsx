import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, CreditCard, ShieldCheck, ArrowRight,
  CheckCircle2, Loader2, Plus, Landmark, Copy, AlertCircle, Lock,
} from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { Button } from '@/shared/ui/Button';
import { formatCurrency } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { RedsysGateway } from './RedsysGateway';
import { AddCardFlow } from './AddCardFlow';
import { useSecurityGate } from '@/features/profile/hooks/useSecurityGate';
import { getConnectivityErrorMessage } from '@/services/api/adapters/http/http.client';
import { useDialogA11y } from '@/shared/hooks/useDialogA11y';
import { isDemoEnvironment } from '@/features/profile/lib/security';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => Promise<void>;
  currentBalance: number;
  /**
   * Cuando la recarga se abre porque una compra no llega a cubrirse (cesta de
   * juegos/lotería), el contexto superior pasa a avisar del déficit en vez de
   * mostrar el saldo actual, y el importe se preselecciona al mínimo de
   * AMOUNTS que lo cubre — el resto del modal (métodos de pago, tarjetas,
   * CTA) es exactamente el mismo que en Mi cuenta, sin bifurcaciones.
   */
  deficitAmount?: number;
}

const AMOUNTS = [5, 10, 20, 50, 100, 200];
type PaymentMethod = 'none' | 'card' | 'apple' | 'google' | 'bizum' | 'transfer' | 'new-card';

interface StoredCard { id: string; brand: string; last4: string; expires: string; isDefault: boolean; }

function readSavedCards(): StoredCard[] {
  try {
    const stored = localStorage.getItem('manises_payment_cards');
    return stored ? (JSON.parse(stored) as StoredCard[]) : [];
  } catch { return []; }
}

function ApplePayIcon({ white = false }: { white?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={white ? '#ffffff' : '#000000'}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function GooglePayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M12.24 10.285V14.4h5.92c-.24 1.44-1.44 4.2-5.92 4.2-3.56 0-6.46-2.94-6.46-6.6s2.9-6.6 6.46-6.6c2.02 0 3.38.86 4.16 1.6l2.84-2.74C17.42 2.74 15.06 1.8 12.24 1.8 6.54 1.8 2 6.34 2 12s4.54 10.2 10.24 10.2c5.9 0 9.82-4.14 9.82-9.98 0-.68-.08-1.2-.18-1.72H12.24z" fill="#4285F4"/>
      <path d="M2 12c0-1.86.5-3.6 1.36-5.1L6.22 9.76A6.58 6.58 0 0 0 5.54 12c0 .8.14 1.56.38 2.28l-2.88 2.24A10.17 10.17 0 0 1 2 12z" fill="#34A853"/>
      <path d="M12.24 22.2c2.64 0 4.86-.86 6.48-2.34l-3.08-2.38c-.86.58-1.96.92-3.4.92-2.6 0-4.82-1.76-5.6-4.12L3.04 16.7A10.2 10.2 0 0 0 12.24 22.2z" fill="#FBBC05"/>
      <path d="M22.06 12.02c0-.68-.08-1.2-.18-1.74H12.24V14.4h5.92c-.26 1.26-.96 2.32-2 3.04l3.08 2.38C20.9 18.22 22.06 15.42 22.06 12.02z" fill="#EA4335"/>
    </svg>
  );
}

const BANK_TRANSFER_INFO = {
  IBAN: 'ES91 2100 0418 4502 0005 1332',
  Titular: 'Administración Lotería nº 3 Manises',
  Banco: 'CaixaBank',
  'Concepto/Ref.': 'REF-RECARGA-2026',
} as const;

export function TopUpModal({ isOpen, onClose, onSuccess, currentBalance, deficitAmount }: TopUpModalProps) {
  const [savedCards, setSavedCards] = useState<StoredCard[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showTokenizeRedsys, setShowTokenizeRedsys] = useState(false);
  const [showAddCardFlow, setShowAddCardFlow] = useState(false);
  const { requireReauth, gateModal } = useSecurityGate();
  const dialogRef = useDialogA11y<HTMLDivElement>({ active: isOpen, onClose });

  const primaryCard = savedCards[0] ?? null;
  const hasSavedCard = primaryCard !== null;
  const isDemo = isDemoEnvironment();

  const effectiveAmount = isCustom ? (parseFloat(customValue) || 0) : selectedAmount;
  const isTransfer = selectedMethod === 'transfer';
  const isNewCard = selectedMethod === 'new-card';
  const canSubmit = effectiveAmount > 0 && effectiveAmount <= 500 && selectedMethod !== 'none';

  // Reset del modal cada vez que se abre. Lee `isDemo` e `deficitAmount` sin
  // listarlos en deps — `isDemo` es invariante durante la sesión; `deficitAmount`
  // SÍ cambia mientras el modal sigue abierto (en cuanto onSuccess() actualiza
  // el saldo del carrito, el padre recalcula total-balance y baja un nuevo
  // valor) pero solo debe fijar la preselección al ABRIRSE, nunca a mitad de
  // un pago: listarlo forzaría este efecto a re-ejecutarse justo cuando
  // handlePay() está esperando dentro de su propio onSuccess(), reseteando
  // isProcessing/isSuccess y rompiendo la pantalla de éxito y el auto-cierre
  // (reproducido en QA: el sheet volvía a su estado inicial en vez de mostrar
  // "¡Pago completado!"). Intentional exclusion.
  useEffect(() => {
    if (isOpen) {
      const cards = readSavedCards();
      setSavedCards(cards);
      // Con déficit (recarga inline desde una compra): preselecciona el
      // importe más pequeño de AMOUNTS que lo cubre, igual que hacía el
      // flujo inline antes de unificarse aquí; si el déficit supera el
      // mayor importe fijo, cae a "otro importe" con el valor exacto.
      if (deficitAmount && deficitAmount > 0) {
        const suggested = AMOUNTS.find(a => a >= deficitAmount);
        if (suggested) {
          setSelectedAmount(suggested);
          setIsCustom(false);
          setCustomValue('');
        } else {
          setIsCustom(true);
          setCustomValue(deficitAmount.toFixed(2));
        }
      } else {
        setSelectedAmount(10);
        setIsCustom(false);
        setCustomValue('');
      }
      // Fuera de demo, la tarjeta guardada no tiene backend real que la cargue
      // (ver handlePay) — no puede quedar preseleccionada como método válido.
      setSelectedMethod(cards.length > 0 && isDemo ? 'card' : 'none');
      setIsProcessing(false);
      setIsSuccess(false);
      setShowTokenizeRedsys(false);
      setShowAddCardFlow(false);
    }
  }, [isOpen]);

  const handlePay = async () => {
    // Local PIN gate only when the user opted in (Perfil → Seguridad →
    // "Al cargar saldo") — never a substitute for BE authorization of the
    // recharge itself, which onSuccess()/Redsys still perform exactly as
    // before. See docs/be-handoff/security-reauthentication.md.
    const reauthed = await requireReauth('topUp');
    if (!reauthed) return;
    if (isTransfer) {
      toast.success('Datos copiados. El saldo se actualizará en hasta 72 h hábiles.');
      return;
    }
    if (effectiveAmount <= 0) {
      toast.error('Selecciona o introduce un importe para recargar.');
      return;
    }
    if (effectiveAmount > 500) {
      toast.error('El importe máximo de recarga es 500 €.');
      return;
    }
    if (isNewCard) {
      setShowAddCardFlow(true);
      return;
    }
    // Fuera de demo no existe todavía un cargo real sobre una tarjeta ya
    // guardada (la fila queda deshabilitada en la UI, ver MethodRow "card"
    // más abajo) — esta comprobación es solo defensa en profundidad, nunca
    // debe simular un pago exitoso en producción.
    if (selectedMethod === 'card' && !isDemo) {
      toast.error('La recarga con esta tarjeta todavía no está disponible.');
      return;
    }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      await onSuccess(effectiveAmount);
      setIsSuccess(true);
      setTimeout(() => { onClose(); setIsProcessing(false); }, 1500);
    } catch (err) {
      toast.error(getConnectivityErrorMessage(err) ?? 'No se ha podido completar la recarga.');
      setIsProcessing(false);
    }
  };

  const handleAddCardFlowSuccess = async (amount: number) => {
    setShowAddCardFlow(false);
    setIsProcessing(true);
    try {
      await onSuccess(amount);
      setSavedCards(readSavedCards());
      setIsSuccess(true);
      setTimeout(() => { onClose(); setIsProcessing(false); }, 1500);
    } catch (err) {
      toast.error(getConnectivityErrorMessage(err) ?? 'No se ha podido completar el pago.');
      setIsProcessing(false);
    }
  };

  const handleTokenizeAuthorize = () => {
    setShowTokenizeRedsys(false);
    setSavedCards(readSavedCards());
    setIsSuccess(true);
    setTimeout(() => { onClose(); }, 1500);
  };

  const btnBg = 'bg-manises-blue hover:bg-[#083d7d]';

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          <AnimatePresence>
            {showTokenizeRedsys && (
              <RedsysGateway
                mode="tokenize"
                onAuthorize={handleTokenizeAuthorize}
                onCancel={() => setShowTokenizeRedsys(false)}
              />
            )}
          </AnimatePresence>

          <AddCardFlow
            isOpen={showAddCardFlow}
            onClose={() => setShowAddCardFlow(false)}
            onSuccess={handleAddCardFlowSuccess}
          />

          {/* z-[260]/[261]: este modal se reutiliza también como recarga
              inline DENTRO de GamesCartPanel/LotteryCartPanel, cuyo panel
              raíz es z-[200] — z-[90]/[100] (valor original, correcto en su
              único uso previo desde WalletPage, sin nada más en pantalla)
              quedaba tapado/no-clicable detrás del carrito. Se alinea con
              z-[250], ya usado por ShippingAddressModal/AddSorteoModal/
              AbonarseModal para el mismo problema (modal por encima del
              carrito) — ver AddCardFlow.tsx/RedsysGateway.tsx, subidos en
              el mismo cambio para mantener su jerarquía relativa. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isProcessing ? onClose : undefined}
            className="fixed inset-0 z-[260] bg-[#0a4792]/40 backdrop-blur-sm"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="topup-modal-title"
            tabIndex={-1}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[261] bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col max-h-[calc(100dvh-0.75rem)] outline-none"
          >
            <div className="w-full flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-gray-200" />
            </div>

            {isSuccess ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center p-8 pb-12 gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 id="topup-modal-title" className="text-2xl font-black text-manises-blue">¡Pago Completado!</h3>
                <p className="text-sm font-medium text-muted-foreground text-center">
                  Has recargado {formatCurrency(effectiveAmount)} con éxito.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 pt-2 pb-6 space-y-5 overscroll-contain">

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 id="topup-modal-title" className="text-2xl font-black text-manises-blue">Añadir fondos</h3>
                      {deficitAmount && deficitAmount > 0 ? (
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                          Te faltan {formatCurrency(deficitAmount)} para completar el pago
                        </p>
                      ) : (
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          Saldo actual: {formatCurrency(currentBalance)}
                        </p>
                      )}
                    </div>
                    {!isProcessing && (
                      <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar" className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500">
                        <X className="w-5 h-5" />
                      </Button>
                    )}
                  </div>

                  {isDemo && (
                    <div className="bg-manises-blue/5 rounded-2xl p-3 border border-manises-blue/10">
                      <p className="text-[10px] font-bold text-manises-blue/60 uppercase tracking-widest text-center">
                        Demo · No se realizará ningún cargo real
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest pl-1">Selecciona importe</p>
                    <div className="grid grid-cols-3 gap-2">
                      {AMOUNTS.map(amount => (
                        <PremiumTouchInteraction key={amount} scale={0.95}>
                          <button
                            onClick={() => { setSelectedAmount(amount); setIsCustom(false); }}
                            disabled={isProcessing}
                            className={`w-full h-12 rounded-xl border-2 font-black text-base transition-all ${
                              !isCustom && selectedAmount === amount
                                ? 'border-manises-blue bg-manises-blue text-white shadow-md'
                                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                            }`}
                          >
                            {amount}€
                          </button>
                        </PremiumTouchInteraction>
                      ))}
                    </div>
                    <PremiumTouchInteraction scale={0.95} className="block mt-4">
                      <button
                        onClick={() => { setIsCustom(true); setCustomValue(''); }}
                        disabled={isProcessing}
                        className={`w-full h-11 rounded-xl border-2 font-bold text-xs transition-all ${
                          isCustom
                            ? 'border-manises-blue bg-manises-blue/5 text-manises-blue shadow-sm'
                            : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {isCustom ? 'Importe personalizado' : 'Introducir otro importe'}
                      </button>
                    </PremiumTouchInteraction>
                    {isCustom && (
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-manises-blue font-black text-lg">€</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="1"
                          max="500"
                          placeholder="0.00"
                          value={customValue}
                          onChange={(e) => setCustomValue(e.target.value)}
                          className="w-full h-14 pl-9 pr-4 rounded-2xl border-2 border-manises-blue bg-manises-blue/5 text-manises-blue font-black text-xl outline-none focus:ring-2 focus:ring-manises-gold/50 tabular-nums"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest pl-1">Método de pago</p>
                    <div className="space-y-2">
                      {/* Tarjeta guardada — solo si existe realmente, nunca una tarjeta
                          ficticia. Fuera de demo no hay todavía un cargo real sobre una
                          tarjeta ya guardada, así que se muestra deshabilitada con
                          "Próximamente", igual que Apple/Google Pay/Bizum más abajo. */}
                      {hasSavedCard && primaryCard && (
                        <MethodRow
                          id="card" selected={selectedMethod} onSelect={setSelectedMethod} disabled={isProcessing || !isDemo}
                          iconEl={<CreditCard className="w-5 h-5" />}
                          label={`${primaryCard.brand} **** ${primaryCard.last4}`}
                          sub={isDemo ? `Exp: ${primaryCard.expires}` : 'Próximamente'}
                          selBg="bg-manises-blue" selBorder="border-manises-blue" selCardBg="bg-blue-50/50"
                        />
                      )}
                      {/* Único punto de entrada para tarjeta: añadir (nueva) tarjeta vía el
                          flujo existente preparado para Redsys/AddCardFlow. Sin tarjeta
                          guardada, es la única forma de pagar con tarjeta. */}
                      <button
                        onClick={() => setSelectedMethod('new-card')}
                        disabled={isProcessing}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
                          isNewCard ? 'border-manises-blue bg-blue-50/50' : 'border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isNewCard ? 'bg-manises-blue text-white' : 'border border-slate-200 text-slate-400'}`}>
                          <Plus className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                          <p className={`text-sm font-bold ${isNewCard ? 'text-manises-blue' : 'text-slate-500'}`}>
                            {hasSavedCard ? '+ Añadir otra tarjeta' : '+ Añadir tarjeta'}
                          </p>
                          {isNewCard && (
                            <p className="text-[9px] text-manises-blue/60 font-medium flex items-center gap-1 mt-0.5">
                              <Lock className="w-2.5 h-2.5" />
                              Te redirigiremos a la pasarela segura Redsys
                            </p>
                          )}
                        </div>
                      </button>
                      {/* Apple Pay / Google Pay / Bizum: sin integración real todavía —
                          simulados y marcados como demo en este entorno; fuera de demo se
                          muestran deshabilitados con "Próximamente" en vez de fingir que
                          ya están disponibles. */}
                      <MethodRow
                        id="apple" selected={selectedMethod} onSelect={setSelectedMethod} disabled={isProcessing || !isDemo}
                        iconEl={<ApplePayIcon white={selectedMethod === 'apple'} />} label="Apple Pay"
                        sub={isDemo ? 'Pago instantáneo · demo' : 'Próximamente'}
                        selBg="bg-black" selBorder="border-manises-blue" selCardBg="bg-blue-50/50"
                      />
                      <MethodRow
                        id="google" selected={selectedMethod} onSelect={setSelectedMethod} disabled={isProcessing || !isDemo}
                        iconEl={<GooglePayIcon />} label="Google Pay"
                        sub={isDemo ? 'Pago instantáneo · demo' : 'Próximamente'}
                        selBg="bg-white" selBorder="border-manises-blue" selCardBg="bg-blue-50/50"
                      />
                      <MethodRow
                        id="bizum" selected={selectedMethod} onSelect={setSelectedMethod} disabled={isProcessing || !isDemo}
                        iconEl={<span className="font-black italic text-base">bz</span>} label="Bizum"
                        sub={isDemo ? 'Recarga rápida · demo' : 'Próximamente'}
                        selBg="bg-[#00c4b3]" selBorder="border-[#00c4b3]" selCardBg="bg-[#00c4b3]/10"
                        selLabel="text-[#00c4b3]" selDot="bg-[#00c4b3]"
                      />
                      <MethodRow
                        id="transfer" selected={selectedMethod} onSelect={setSelectedMethod} disabled={isProcessing}
                        iconEl={<Landmark className="w-5 h-5" />} label="Transferencia bancaria" sub="Hasta 72 h hábiles"
                        selBg="bg-emerald-600" selBorder="border-emerald-500" selCardBg="bg-emerald-50/60"
                        selLabel="text-emerald-700" selDot="bg-emerald-600"
                      />
                    </div>
                  </div>

                  {isTransfer && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 space-y-3">
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                        {isDemo ? 'Datos de transferencia (demo)' : 'Datos de transferencia'}
                      </p>
                      {(Object.entries(BANK_TRANSFER_INFO) as [string, string][]).map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{label}</p>
                            <p className="text-xs font-bold text-manises-blue truncate">{value}</p>
                          </div>
                          <button
                            onClick={() => { navigator.clipboard?.writeText(value); toast.success(`${label} copiado`); }}
                            className="p-1.5 rounded-lg bg-white border border-blue-200 text-blue-400 hover:bg-blue-100 shrink-0"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-start gap-2 pt-3 border-t border-blue-200">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-medium text-amber-700 leading-relaxed">
                          El saldo por transferencia puede tardar hasta <strong>72 horas hábiles</strong> en reflejarse en tu cuenta.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {isDemo ? 'Demo · no operativo' : 'Pago seguro y cifrado'}
                    </p>
                  </div>
                </div>

                <div
                  className="shrink-0 px-5 pt-3 border-t border-gray-100 bg-white space-y-2"
                  style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
                >
                  {!isTransfer && effectiveAmount > 500 && (
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest text-center animate-pulse">
                      {isDemo ? 'Límite de recarga demo: 500€' : 'Límite de recarga: 500€'}
                    </p>
                  )}
                  <PremiumTouchInteraction scale={0.98} className="w-full">
                    <Button
                      onClick={handlePay}
                      disabled={isProcessing || !canSubmit}
                      className={`w-full h-14 rounded-2xl text-white font-black text-base min-[375px]:text-lg transition-all shadow-md ${btnBg}`}
                    >
                      {isProcessing ? (
                        <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Verificando...</>
                      ) : isTransfer ? (
                        <>Ver datos de transferencia <ArrowRight className="w-5 h-5 ml-2 opacity-70" /></>
                      ) : isNewCard ? (
                        <>Añadir tarjeta <ArrowRight className="w-5 h-5 ml-2 opacity-70" /></>
                      ) : selectedMethod === 'none' ? (
                        <>Selecciona un método de pago</>
                      ) : effectiveAmount > 0 ? (
                        <>Recargar {formatCurrency(effectiveAmount)}{isDemo ? ' demo' : ''} <ArrowRight className="w-5 h-5 ml-2 opacity-70" /></>
                      ) : (
                        <>Recargar saldo <ArrowRight className="w-5 h-5 ml-2 opacity-70" /></>
                      )}
                    </Button>
                  </PremiumTouchInteraction>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
    {gateModal}
    </>
  );
}

interface MethodRowProps {
  id: PaymentMethod;
  selected: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
  disabled: boolean;
  iconEl: ReactNode;
  label: string;
  sub: string;
  selBg: string;
  selBorder: string;
  selCardBg: string;
  selLabel?: string;
  selDot?: string;
}

function MethodRow({ id, selected, onSelect, disabled, iconEl, label, sub, selBg, selBorder, selCardBg, selLabel, selDot }: MethodRowProps) {
  const isSelected = selected === id;
  return (
    <button
      onClick={() => onSelect(id)}
      disabled={disabled}
      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
        isSelected ? `${selBorder} ${selCardBg}` : 'border-slate-100 bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? `${selBg} text-white` : 'bg-slate-100 text-slate-500'}`}>
          {iconEl}
        </div>
        <div className="text-left">
          <p className={`text-sm font-bold ${isSelected ? (selLabel ?? 'text-manises-blue') : 'text-slate-700'}`}>{label}</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase">{sub}</p>
        </div>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? selBorder : 'border-slate-300'}`}>
        {isSelected && <div className={`w-2.5 h-2.5 rounded-full ${selDot ?? selBg}`} />}
      </div>
    </button>
  );
}
