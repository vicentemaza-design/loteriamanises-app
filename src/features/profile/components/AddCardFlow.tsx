import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CreditCard, ArrowRight, Lock, Loader2, Info } from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { Button } from '@/shared/ui/Button';
import { formatCurrency } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { RedsysGateway } from './RedsysGateway';

const ADD_CARD_AMOUNTS = [1, 5, 10, 20, 50, 100];

interface AddCardFlowProps {
  isOpen: boolean;
  onClose: () => void;
  /** Llamado cuando el BE confirma el pago y la tarjeta ha quedado guardada. */
  onSuccess: (amount: number) => void;
}

export function AddCardFlow({ isOpen, onClose, onSuccess }: AddCardFlowProps) {
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [showRedsys, setShowRedsys] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const effectiveAmount = isCustom ? (parseFloat(customValue) || 0) : selectedAmount;

  const handleContinue = () => {
    if (effectiveAmount <= 0) {
      toast.error('Selecciona o introduce un importe para recargar.');
      return;
    }
    if (effectiveAmount > 500) {
      toast.error('El importe máximo de recarga es 500 €.');
      return;
    }
    setShowRedsys(true);
  };

  /**
   * En producción este handler no existe aquí: el resultado llega por redirect
   * desde la URL de retorno que configura el BE en la sesión Redsys.
   * onSuccess se llamará desde el handler de esa URL.
   */
  const handleRedsysCancel = () => {
    setShowRedsys(false);
    setIsProcessing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <AnimatePresence>
            {showRedsys && (
              <RedsysGateway
                mode="payment"
                amount={effectiveAmount}
                onAuthorize={() => {
                  // En producción: resultado vía redirect BE → onSuccess(effectiveAmount)
                  setShowRedsys(false);
                  onSuccess(effectiveAmount);
                }}
                onCancel={handleRedsysCancel}
              />
            )}
          </AnimatePresence>

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-0 z-[150] bg-white flex flex-col"
          >
            {/* Cabecera */}
            <div
              className="shrink-0 flex items-center gap-3 px-5 pb-4 border-b border-slate-100 bg-white"
              style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
            >
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-base font-black text-manises-blue flex-1 text-center pr-9">
                Añadir nueva tarjeta
              </h1>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 space-y-7">

              {/* Ilustración + título */}
              <div className="flex flex-col items-center gap-4 pt-2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-manises-blue/10 flex items-center justify-center">
                    <CreditCard className="w-11 h-11 text-manises-blue/50" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-manises-blue flex items-center justify-center shadow-md border-2 border-white">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-center px-4">
                  <h2 className="text-2xl font-black text-manises-blue">Vincula tu nueva tarjeta</h2>
                  <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
                    Para añadir una nueva tarjeta realiza una recarga. Serás redirigido
                    a la pasarela segura del banco para introducir los datos de tu tarjeta.
                  </p>
                </div>
              </div>

              {/* Importe */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest pl-1">
                  Selecciona importe a recargar
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {ADD_CARD_AMOUNTS.map(amount => (
                    <PremiumTouchInteraction key={amount} scale={0.95}>
                      <button
                        onClick={() => { setSelectedAmount(amount); setIsCustom(false); }}
                        className={`w-full h-14 rounded-2xl border-2 font-black text-base transition-all ${
                          !isCustom && selectedAmount === amount
                            ? 'border-manises-blue bg-manises-blue text-white shadow-md'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {amount} €
                      </button>
                    </PremiumTouchInteraction>
                  ))}
                </div>
                <PremiumTouchInteraction scale={0.98}>
                  <button
                    onClick={() => { setIsCustom(true); setCustomValue(''); }}
                    className={`w-full h-12 rounded-2xl border-2 flex items-center justify-center gap-2 font-semibold text-sm transition-all ${
                      isCustom
                        ? 'border-manises-blue bg-manises-blue/5 text-manises-blue'
                        : 'border-dashed border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    Otro importe
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

              {/* Aviso seguridad */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-manises-blue/5 border border-manises-blue/15">
                <Info className="w-4 h-4 text-manises-blue shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-manises-blue/75 leading-relaxed">
                  Los datos de tu tarjeta se introducen directamente en la pasarela
                  del banco. Lotería Manises nunca almacena ni accede a los datos de tu tarjeta.
                </p>
              </div>

            </div>

            {/* CTA fijo */}
            <div
              className="shrink-0 px-5 pt-4 border-t border-slate-100 bg-white space-y-2.5"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
            >
              {effectiveAmount > 500 && (
                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest text-center animate-pulse">
                  Límite máximo de recarga: 500 €
                </p>
              )}
              <PremiumTouchInteraction scale={0.98} className="w-full">
                <Button
                  onClick={handleContinue}
                  disabled={isProcessing || effectiveAmount <= 0 || effectiveAmount > 500}
                  className="w-full h-14 rounded-2xl bg-manises-blue hover:bg-[#083d7d] text-white font-black text-base shadow-md disabled:opacity-50"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Procesando...</>
                  ) : effectiveAmount > 0 ? (
                    <>Continuar al banco · {formatCurrency(effectiveAmount)} <ArrowRight className="w-5 h-5 ml-2" /></>
                  ) : (
                    <>Selecciona un importe <ArrowRight className="w-5 h-5 ml-2" /></>
                  )}
                </Button>
              </PremiumTouchInteraction>
              <div className="flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-[11px] font-semibold text-slate-400">Pago 100% seguro a través de Redsys</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
