import { AnimatePresence, motion } from 'motion/react';
import { ReceiptText } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { formatDate, formatCurrency } from '@/shared/lib/utils';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { GameReceiptVisual } from './GameReceiptVisual';
import type { Ticket } from '@/shared/types/domain';

interface TicketReceiptModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  ticketCode: string;
  orderDatesSummary: string;
  selectionSummary?: string;
}

/**
 * Modal tipo resguardo térmico (Thermal Receipt Mock).
 */
export function TicketReceiptModal({ 
  ticket, 
  onClose, 
  ticketCode, 
  orderDatesSummary,
  selectionSummary 
}: TicketReceiptModalProps) {
  if (!ticket) return null;
  const game = LOTTERY_GAMES.find((g) => g.id === ticket.gameId);
  const totalPrice = typeof ticket.metadata?.orderTotalPrice === 'number'
    ? ticket.metadata.orderTotalPrice
    : ticket.price;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white p-1 shadow-2xl"
        >
          <div className="rounded-[2.2rem] border-2 border-slate-50 bg-white p-6 pt-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-manises-blue/5 text-manises-blue">
                <ReceiptText className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-manises-blue">
                Resguardo de Apuesta
              </h3>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Lotería Manises · Admin. Nº 6
              </p>
            </div>

            <div className="space-y-4 font-mono text-[11px] text-slate-600">
              <div className="space-y-2 border-y border-dashed border-slate-200 py-3">
                <div className="flex justify-between">
                  <span>JUEGO:</span>
                  <span className="font-bold text-manises-blue">{game?.name.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>FECHA(S) SORTEO:</span>
                  <span className="font-bold text-manises-blue">{orderDatesSummary || formatDate(ticket.drawDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CÓDIGO:</span>
                  <span className="font-bold text-manises-blue">{ticketCode}</span>
                </div>
              </div>

              <div className="py-2">
                <GameReceiptVisual ticket={ticket} selectionSummary={selectionSummary} />
              </div>

              <div className="space-y-1 border-t border-dashed border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span>IMPORTE TOTAL:</span>
                  <span className="font-bold">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>EMITIDO:</span>
                  <span>{formatDate(ticket.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex h-10 w-full items-center justify-center rounded-lg bg-slate-50 opacity-30">
                {/* Mock barcode */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-slate-900"
                      style={{ width: i % 3 === 0 ? '2px' : '1px', height: '24px' }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                DEMO · SIN VALIDEZ OFICIAL
              </p>
              <Button variant="outline" className="h-12 w-full rounded-2xl" onClick={onClose}>
                Cerrar resguardo
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
