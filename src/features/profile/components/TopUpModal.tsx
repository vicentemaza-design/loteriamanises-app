import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, CreditCard, Smartphone, ShieldCheck, ArrowRight,
  CheckCircle2, Loader2, Plus, Landmark, Copy, AlertCircle,
} from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { Button } from '@/shared/ui/Button';
import { formatCurrency } from '@/shared/lib/utils';
import { toast } from 'sonner';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => Promise<void>;
  currentBalance: number;
}

const AMOUNTS = [5, 10, 20, 50, 100, 200];
type PaymentMethod = 'card' | 'apple' | 'bizum' | 'transfer' | 'new-card';

const BANK_TRANSFER_INFO = {
  IBAN: 'ES91 2100 0418 4502 0005 1332',
  Titular: 'Administración Lotería nº 3 Manises',
  Banco: 'CaixaBank',
  'Concepto/Ref.': 'REF-RECARGA-2026',
} as const;

export function TopUpModal({ isOpen, onClose, onSuccess, currentBalance }: TopUpModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('apple');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [saveCard, setSaveCard] = useState(true);
  const [newCard, setNewCard] = useState({ number: '', name: '', expiry: '', cvv: '' });

  const effectiveAmount = isCustom ? (parseFloat(customValue) || 0) : selectedAmount;
  const isTransfer = selectedMethod === 'transfer';
  const isNewCard = selectedMethod === 'new-card';

  useEffect(() => {
    if (isOpen) {
      setSelectedAmount(10);
      setIsCustom(false);
      setCustomValue('');
      setSelectedMethod('apple');
      setIsProcessing(false);
      setIsSuccess(false);
      setSaveCard(true);
      setNewCard({ number: '', name: '', expiry: '', cvv: '' });
    }
  }, [isOpen]);

  const handlePay = async () => {
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
    if (isNewCard && (!newCard.number || !newCard.name || !newCard.expiry || !newCard.cvv)) {
      toast.error('Completa los datos de la tarjeta antes de continuar.');
      return;
    }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      await onSuccess(effectiveAmount);
      setIsSuccess(true);
      setTimeout(() => { onClose(); setIsProcessing(false); }, 1500);
    } catch {
      toast.error('No se ha podido completar la simulación de recarga.');
      setIsProcessing(false);
    }
  };

  const isDisabled = isProcessing;

  const btnBg = selectedMethod === 'apple'
    ? 'bg-black hover:bg-gray-900 border-b-4 border-gray-800'
    : selectedMethod === 'bizum'
    ? 'bg-[#00c4b3] hover:bg-[#00aba0] border-b-4 border-[#009e93]'
    : selectedMethod === 'transfer'
    ? 'bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-800'
    : 'bg-manises-blue hover:bg-[#083d7d] border-b-4 border-[#052a5a]';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isProcessing ? onClose : undefined}
            className="fixed inset-0 z-[90] bg-[#0a4792]/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col max-h-[calc(100dvh-0.75rem)]"
          >
            {/* Grabber */}
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
                <h3 className="text-2xl font-black text-manises-blue">¡Pago Completado!</h3>
                <p className="text-sm font-medium text-muted-foreground text-center">
                  Has recargado {formatCurrency(effectiveAmount)} con éxito.
                </p>
              </motion.div>
            ) : (
              <>
                {/* ── Scrollable content ─────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-5 pt-2 pb-6 space-y-5 overscroll-contain">

                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-manises-blue">Añadir fondos</h3>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        Saldo actual: {formatCurrency(currentBalance)}
                      </p>
                    </div>
                    {!isProcessing && (
                      <Button variant="ghost" size="icon" onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500">
                        <X className="w-5 h-5" />
                      </Button>
                    )}
                  </div>

                  <div className="bg-manises-blue/5 rounded-2xl p-3 border border-manises-blue/10">
                    <p className="text-[10px] font-bold text-manises-blue/60 uppercase tracking-widest text-center">
                      Demo · No se realizará ningún cargo real
                    </p>
                  </div>

                  {/* Amount */}
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
                      <PremiumTouchInteraction scale={0.95} className="col-span-3">
                        <button
                          onClick={() => { setIsCustom(true); setCustomValue(''); }}
                          disabled={isProcessing}
                          className={`w-full h-11 rounded-xl border-2 font-bold text-xs transition-all ${
                            isCustom
                              ? 'border-manises-blue bg-manises-blue/5 text-manises-blue shadow-sm'
                              : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          {isCustom ? 'Importe personalizado' : 'Otro importe'}
                        </button>
                      </PremiumTouchInteraction>
                    </div>
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

                  {/* Method selector */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest pl-1">Método de pago</p>
                    <div className="space-y-2">
                      {/* Existing card */}
                      <MethodRow
                        id="card" selected={selectedMethod} onSelect={setSelectedMethod} disabled={isProcessing}
                        iconEl={<CreditCard className="w-5 h-5" />} label="Visa **** 4452" sub="Exp: 09/27"
                        selBg="bg-manises-blue" selBorder="border-manises-blue" selCardBg="bg-blue-50/50"
                      />
                      {/* Apple Pay */}
                      <MethodRow
                        id="apple" selected={selectedMethod} onSelect={setSelectedMethod} disabled={isProcessing}
                        iconEl={<Smartphone className="w-5 h-5" />} label="Apple Pay" sub="Pago instantáneo"
                        selBg="bg-black" selBorder="border-manises-blue" selCardBg="bg-blue-50/50"
                      />
                      {/* Bizum */}
                      <MethodRow
                        id="bizum" selected={selectedMethod} onSelect={setSelectedMethod} disabled={isProcessing}
                        iconEl={<span className="font-black italic text-base">bz</span>} label="Bizum" sub="Recarga rápida"
                        selBg="bg-[#00c4b3]" selBorder="border-[#00c4b3]" selCardBg="bg-[#00c4b3]/10"
                        selLabel="text-[#00c4b3]" selDot="bg-[#00c4b3]"
                      />
                      {/* Transferencia bancaria */}
                      <MethodRow
                        id="transfer" selected={selectedMethod} onSelect={setSelectedMethod} disabled={isProcessing}
                        iconEl={<Landmark className="w-5 h-5" />} label="Transferencia bancaria" sub="Hasta 72 h hábiles"
                        selBg="bg-emerald-600" selBorder="border-emerald-500" selCardBg="bg-emerald-50/60"
                        selLabel="text-emerald-700" selDot="bg-emerald-600"
                      />
                      {/* Nueva tarjeta */}
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
                        <p className={`text-sm font-bold ${isNewCard ? 'text-manises-blue' : 'text-slate-500'}`}>
                          Añadir nueva tarjeta
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Transfer info block */}
                  {isTransfer && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 space-y-3">
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Datos de transferencia (demo)</p>
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

                  {/* New card form */}
                  {isNewCard && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest">Datos de la tarjeta (demo)</p>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Número de tarjeta"
                        value={newCard.number}
                        onChange={e => setNewCard(p => ({ ...p, number: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                        className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-manises-blue outline-none focus:border-manises-blue transition-all tracking-widest"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="MM/AA"
                          maxLength={5}
                          value={newCard.expiry}
                          onChange={e => setNewCard(p => ({ ...p, expiry: e.target.value }))}
                          className="h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-manises-blue outline-none focus:border-manises-blue transition-all"
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="CVV"
                          maxLength={4}
                          value={newCard.cvv}
                          onChange={e => setNewCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '') }))}
                          className="h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-manises-blue outline-none focus:border-manises-blue transition-all"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Nombre del titular"
                        value={newCard.name}
                        onChange={e => setNewCard(p => ({ ...p, name: e.target.value }))}
                        className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-manises-blue outline-none focus:border-manises-blue transition-all uppercase"
                      />
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveCard}
                          onChange={e => setSaveCard(e.target.checked)}
                          className="w-4 h-4 accent-manises-blue rounded"
                        />
                        <span className="text-[11px] font-bold text-manises-blue">Guardar tarjeta para futuras compras</span>
                      </label>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Demo · no operativo</p>
                  </div>
                </div>

                {/* ── Sticky footer — SIEMPRE VISIBLE ────────────────── */}
                <div
                  className="shrink-0 px-5 pt-3 border-t border-gray-100 bg-white space-y-2"
                  style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
                >
                  {!isTransfer && effectiveAmount > 500 && (
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest text-center animate-pulse">
                      Límite de recarga demo: 500€
                    </p>
                  )}
                  <PremiumTouchInteraction scale={0.98} className="w-full">
                    <Button
                      onClick={handlePay}
                      disabled={isDisabled}
                      className={`w-full h-14 rounded-2xl text-white font-black text-lg transition-all shadow-md ${btnBg}`}
                    >
                      {isProcessing ? (
                        <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Verificando...</>
                      ) : isTransfer ? (
                        <>Ver datos de transferencia <ArrowRight className="w-5 h-5 ml-2 opacity-70" /></>
                      ) : effectiveAmount > 0 ? (
                        <>Recargar {formatCurrency(effectiveAmount)} demo <ArrowRight className="w-5 h-5 ml-2 opacity-70" /></>
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
      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
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
