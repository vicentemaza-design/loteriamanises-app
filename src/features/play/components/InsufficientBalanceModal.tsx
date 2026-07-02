import { motion, AnimatePresence } from 'motion/react';
import { Wallet, X } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/utils';

interface InsufficientBalanceModalProps {
  isOpen: boolean;
  missingAmount: number;
  onAddBalance: () => void;
  onClose: () => void;
}

export function InsufficientBalanceModal({
  isOpen,
  missingAmount,
  onAddBalance,
  onClose,
}: InsufficientBalanceModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="pointer-events-none fixed inset-0 z-[121] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 26, stiffness: 340 }}
              className="pointer-events-auto relative w-full max-w-[340px] overflow-hidden rounded-[2rem] bg-white px-6 pb-6 pt-7 shadow-2xl"
            >
              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Icon */}
              <div className="mb-5 flex justify-center">
                <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full bg-manises-blue/10">
                  <span className="text-[2.6rem] leading-none select-none" role="img" aria-hidden>😊</span>
                  <span className="absolute -right-1 -top-1 text-[1.1rem] leading-none select-none" role="img" aria-hidden>✨</span>
                  <span className="absolute -left-1 bottom-1 text-[0.75rem] leading-none select-none" role="img" aria-hidden>⭐</span>
                </div>
              </div>

              {/* Heading */}
              <div className="mb-5 text-center">
                <h2 className="text-[1.6rem] font-black leading-none text-manises-blue">¡Ups!</h2>
                <p className="mt-2 text-[15px] font-black leading-snug text-slate-800">
                  No tienes saldo suficiente
                </p>
              </div>

              {/* Info box */}
              <div className="mb-6 flex gap-3 rounded-2xl bg-manises-blue/[0.07] p-4">
                <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-manises-blue" />
                <div>
                  <p className="text-[13px] font-black text-manises-blue">
                    Te faltan {formatCurrency(missingAmount)}.
                  </p>
                  <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
                    Añade saldo y luego tendrás que confirmar el pedido.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={onAddBalance}
                  className="w-full rounded-2xl bg-manises-blue py-4 text-[13px] font-black tracking-wide text-white shadow-[0_6px_20px_rgba(10,71,146,0.35)] transition-all active:scale-[0.98]"
                >
                  Añadir saldo
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-2xl border-2 border-manises-blue/25 py-[14px] text-[13px] font-black tracking-wide text-manises-blue transition-all active:scale-[0.98]"
                >
                  Ahora no
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
