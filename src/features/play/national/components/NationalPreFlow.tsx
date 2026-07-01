/**
 * Pre-flujo de compra de Lotería Nacional: 2-3 pasos antes del selector de números.
 * Usa el estilo visual propio de la app (idéntico al Paso 2 de los juegos numéricos).
 */
import { useState } from 'react';
import { ShieldCheck, Truck, Spark, EditPencil, NavArrowRight } from 'iconoir-react/regular';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/shared/lib/utils';
import { NationalDeliverySelector, type DeliveryMode } from './NationalDeliverySelector';

export type NationalMethod = 'aleatorio' | 'elegir';

interface NationalPreFlowProps {
  /** Si hay chips de fecha → se muestra el paso de sorteo */
  dateChips?: unknown;
  onConfirm: (delivery: DeliveryMode, method: NationalMethod) => void;
}

type Step = 'entrega' | 'metodo';

export function NationalPreFlow({ dateChips, onConfirm }: NationalPreFlowProps) {
  const [step, setStep] = useState<Step>('entrega');
  const [delivery, setDelivery] = useState<DeliveryMode>('custody');
  const [method, setMethod] = useState<NationalMethod | null>(null);

  const handleEntregaContinue = () => setStep('metodo');

  const handleMetodoSelect = (m: NationalMethod) => {
    setMethod(m);
    onConfirm(delivery, m);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18 }}
        className="space-y-2.5"
      >
        {/* Chips de fecha (opcionales, p.ej. Nacional Jueves/Sábado) */}
        {dateChips && step === 'entrega' && (
          <div className="rounded-[1.2rem] border border-slate-100 bg-white px-3.5 py-3 shadow-sm">
            <p className="mb-2 px-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Sorteo</p>
            {dateChips}
          </div>
        )}

        {step === 'entrega' && (
          <>
            {/* Paso: Entrega */}
            <div className="rounded-[1.2rem] border border-slate-100 bg-white px-3.5 py-3 shadow-sm">
              <p className="mb-2 px-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                ¿Cómo quieres recibir tus décimos?
              </p>
              <NationalDeliverySelector
                selectedMode={delivery}
                onChange={setDelivery}
              />
            </div>

            <button
              type="button"
              onClick={handleEntregaContinue}
              className="flex w-full items-center justify-between rounded-2xl bg-manises-blue px-5 py-3.5 text-[13px] font-black text-white shadow-sm transition-all active:scale-[0.98]"
            >
              <span>Continuar</span>
              <NavArrowRight className="h-4.5 w-4.5" />
            </button>
          </>
        )}

        {step === 'metodo' && (
          <>
            {/* Paso: Método */}
            <div className="rounded-[1.2rem] border border-slate-100 bg-white px-3.5 py-3 shadow-sm">
              <p className="mb-2 px-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                ¿Cómo quieres obtener tus números?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'aleatorio' as NationalMethod, label: 'Aleatorio', icon: <Spark className="h-4 w-4 shrink-0 text-manises-gold" /> },
                  { id: 'elegir' as NationalMethod, label: 'Elegir número', icon: <EditPencil className="h-4 w-4 shrink-0" /> },
                ] as const).map(({ id, label, icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleMetodoSelect(id)}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.97]',
                      method === id
                        ? 'border-transparent text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                    )}
                    style={method === id ? { backgroundColor: '#0a4792' } : undefined}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Back subtle hint */}
            <button
              type="button"
              onClick={() => setStep('entrega')}
              className="flex items-center gap-1 px-1 text-[10px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Cambiar entrega
            </button>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
