import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Smartphone, ShieldCheck, ArrowRight, CheckCircle2, Loader2, Plus } from 'lucide-react';
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

export function TopUpModal({ isOpen, onClose, onSuccess, currentBalance }: TopUpModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'apple' | 'card' | 'bizum'>('apple');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const effectiveAmount = isCustom ? (parseFloat(customValue) || 0) : selectedAmount;

  useEffect(() => {
    if (isOpen) {
      setSelectedAmount(10);
      setIsCustom(false);
      setCustomValue('');
      setSelectedMethod('apple');
      setIsProcessing(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handlePay = async () => {
    setIsProcessing(true);

    // Simulating bank delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      await onSuccess(effectiveAmount);
      setIsSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
         onClose();
         setIsProcessing(false);
      }, 1500);
    } catch {
      toast.error('No se ha podido completar la simulación de recarga.');
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isProcessing ? onClose : undefined}
            className="fixed inset-0 z-50 bg-[#0a4792]/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col max-h-[95vh] overflow-hidden"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
          >
            {/* Grabber */}
            <div className="w-full flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-gray-200" />
            </div>

            {isSuccess ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center p-8 pb-12 gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-manises-blue">¡Pago Completado!</h3>
                <p className="text-sm font-medium text-muted-foreground text-center">
                  Has recargado {formatCurrency(effectiveAmount)} con éxito.
                </p>
              </motion.div>
            ) : (
              <div className="px-5 pt-2 pb-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-manises-blue">Añadir fondos</h3>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      Saldo actual: {formatCurrency(currentBalance)}
                    </p>
                  </div>
                  {!isProcessing && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>

                <div className="bg-manises-blue/5 rounded-2xl p-3 border border-manises-blue/10">
                  <p className="text-[10px] font-bold text-manises-blue/60 uppercase tracking-widest text-center">
                    Demo · No se realizará ningún cargo real
                  </p>
                </div>

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

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest pl-1">Método de pago</p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                    {/* Tarjeta */}
                    <button onClick={() => setSelectedMethod('card')} disabled={isProcessing} className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${selectedMethod === 'card' ? 'border-manises-blue bg-blue-50/50' : 'border-slate-100 bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedMethod === 'card' ? 'bg-manises-blue text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-bold ${selectedMethod === 'card' ? 'text-manises-blue' : 'text-slate-700'}`}>Visa **** 4452</p>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Exp: 09/27</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'card' ? 'border-manises-blue' : 'border-slate-300'}`}>
                        {selectedMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-manises-blue" />}
                      </div>
                    </button>

                    {/* Apple Pay */}
                    <button onClick={() => setSelectedMethod('apple')} disabled={isProcessing} className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${selectedMethod === 'apple' ? 'border-manises-blue bg-blue-50/50' : 'border-slate-100 bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedMethod === 'apple' ? 'bg-black text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-bold ${selectedMethod === 'apple' ? 'text-manises-blue' : 'text-slate-700'}`}>Apple Pay</p>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Pago instantáneo</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'apple' ? 'border-manises-blue' : 'border-slate-300'}`}>
                        {selectedMethod === 'apple' && <div className="w-2.5 h-2.5 rounded-full bg-manises-blue" />}
                      </div>
                    </button>

                    {/* Bizum */}
                    <button onClick={() => setSelectedMethod('bizum')} disabled={isProcessing} className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${selectedMethod === 'bizum' ? 'border-[#00c4b3] bg-[#00c4b3]/10' : 'border-slate-100 bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-base ${selectedMethod === 'bizum' ? 'bg-[#00c4b3] text-white' : 'bg-slate-100 text-slate-500'}`}>
                          bz
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-bold ${selectedMethod === 'bizum' ? 'text-[#00c4b3]' : 'text-slate-700'}`}>Bizum</p>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Recarga rápida</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'bizum' ? 'border-[#00c4b3]' : 'border-slate-300'}`}>
                        {selectedMethod === 'bizum' && <div className="w-2.5 h-2.5 rounded-full bg-[#00c4b3]" />}
                      </div>
                    </button>

                    {/* Añadir nueva tarjeta */}
                    <button 
                      onClick={() => toast.info('Demo: Formulario de nueva tarjeta')} 
                      disabled={isProcessing}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                        <Plus className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-slate-500">Añadir nueva tarjeta</p>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2 pb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Demo · método de pago no operativo</p>
                </div>

                <AnimatePresence mode="wait">
                  <div className="w-full flex flex-col gap-2">
                    {effectiveAmount > 500 && (
                      <p className="text-[9px] font-black text-red-500 uppercase tracking-widest text-center animate-pulse">
                        Límite de recarga demo: 500€
                      </p>
                    )}
                    <PremiumTouchInteraction scale={0.98} className="w-full">
                      <Button
                        onClick={handlePay}
                        disabled={isProcessing || effectiveAmount <= 0 || effectiveAmount > 500}
                        className={`w-full h-14 rounded-2xl text-white font-black text-lg transition-all shadow-md ${
                          selectedMethod === 'apple' ? 'bg-black hover:bg-gray-900 border-b-4 border-gray-800' :
                          selectedMethod === 'bizum' ? 'bg-[#00c4b3] hover:bg-[#00aba0] border-b-4 border-[#009e93]' :
                          'bg-manises-blue hover:bg-[#083d7d] border-b-4 border-[#052a5a]'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Verificando...
                          </>
                        ) : (
                          <>
                            Recargar {formatCurrency(effectiveAmount)} demo <ArrowRight className="w-5 h-5 ml-2 opacity-70" />
                          </>
                        )}
                      </Button>
                    </PremiumTouchInteraction>
                  </div>
                </AnimatePresence>
                
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
