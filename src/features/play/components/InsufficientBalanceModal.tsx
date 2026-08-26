import { motion, AnimatePresence } from 'motion/react';
import { WarningTriangle, Lock, Xmark } from 'iconoir-react/regular';
import { formatCurrency } from '@/shared/lib/utils';
import { useDialogA11y } from '@/shared/hooks/useDialogA11y';

interface InsufficientBalanceModalProps {
  isOpen: boolean;
  missingAmount: number;
  onAddBalance: () => void;
  onClose: () => void;
  /** Texto del botón de confirmación de la cesta que abre este aviso — "Pagar" en
   * juegos numéricos, "Comprar" en Lotería Nacional/Navidad. Ver Paso 2. */
  confirmLabel?: string;
}

// Aviso de 2 pasos: recargar saldo es un paso previo explícito, nunca una
// confirmación de compra automática. Paso 1 (activo) abre la recarga; Paso 2
// (bloqueado, informativo) recuerda que hay que volver a pulsar el botón de
// compra tras recargar. Reutilizado por GamesCartPanel y LotteryCartPanel.
export function InsufficientBalanceModal({
  isOpen,
  missingAmount,
  onAddBalance,
  onClose,
  confirmLabel = 'Pagar',
}: InsufficientBalanceModalProps) {
  const dialogRef = useDialogA11y<HTMLDivElement>({ active: isOpen, onClose });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            // z-[255]/[256]: este aviso también se abre desde dentro de
            // LotteryCartPanel/GamesCartPanel (root z-[200]) antes de la
            // recarga (TopUpModal, z-[260]/[261]) — por debajo del carrito
            // quedaba invisible/no-clicable.
            className="fixed inset-0 z-[255] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="insufficient-balance-title"
            tabIndex={-1}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-[256] mx-auto max-h-[90dvh] max-w-screen-sm overflow-y-auto rounded-t-[2rem] bg-white px-5 pb-8 pt-4 shadow-2xl outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <WarningTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p id="insufficient-balance-title" className="text-[14px] font-black text-manises-blue">Saldo insuficiente</p>
                  <p className="text-[11px] font-medium text-slate-500">Te faltan {formatCurrency(missingAmount)} para confirmar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200"
                aria-label="Cerrar"
              >
                <Xmark className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mb-4 overflow-hidden rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-manises-blue/[0.04] p-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-manises-blue text-[12px] font-black text-white">1</div>
                <div className="flex-1">
                  <p className="text-[12px] font-black text-manises-blue">Recargar saldo</p>
                  <p className="text-[10px] font-medium text-slate-500">Añadir {formatCurrency(missingAmount)} o más</p>
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-600">Siguiente</span>
              </div>
              <div className="flex items-center gap-3 p-4 opacity-50">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[12px] font-black text-slate-500">2</div>
                <div className="flex-1">
                  <p className="text-[12px] font-black text-slate-600">Pulsar &quot;{confirmLabel}&quot;</p>
                  <p className="text-[10px] font-medium text-slate-400">El botón se activará en verde al volver</p>
                </div>
                <Lock className="h-4 w-4 text-slate-300" />
              </div>
            </div>

            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
              <WarningTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-[11px] font-semibold leading-relaxed text-amber-800">
                Recargar saldo <span className="font-black">no confirma tu jugada</span>. Después de recargar, el botón <span className="font-black">&quot;{confirmLabel}&quot;</span> se activará en verde para confirmarlo.
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onAddBalance}
                className="w-full rounded-2xl bg-manises-blue py-4 text-[13px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-[0.98]"
              >
                Recargar saldo
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl py-3 text-[12px] font-bold text-slate-400"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
