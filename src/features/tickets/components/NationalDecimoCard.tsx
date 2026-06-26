import { Target } from 'lucide-react';
import type { Ticket } from '@/shared/types/domain';
import { NationalTicketThumbnail } from '@/features/play/components/NationalTicketThumbnail';
import { formatCurrency, formatDate } from '@/shared/lib/utils';

interface NationalDecimoCardProps {
  ticket: Ticket;
  displayNumber: string;
}

/**
 * Previsualización mock de un décimo de Lotería Nacional.
 */
export function NationalDecimoCard({ ticket, displayNumber }: NationalDecimoCardProps) {
  const drawLabel = (ticket.metadata?.nationalDrawLabel as string) || 'Sorteo Nacional';
  const status = ticket.metadata?.playStatus;
  const isPending = status === 'pending' || status === 'processing' || (!status && ticket.status === 'pending');
  const isScrutinized = status === 'scrutinized' || ticket.status === 'won' || ticket.status === 'lost';
  const quantity = ticket.metadata?.nationalQuantity ?? 1;
  const deliveryMode = ticket.metadata?.deliveryMode;
  const seriesFractions = ticket.metadata?.seriesFractions ?? [];
  const address = ticket.metadata?.shippingAddress;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-manises-blue/10 bg-[#fffdf5] shadow-inner">
      <div className="absolute right-0 top-0 rounded-bl-xl bg-manises-gold/10 px-2 py-1 text-[8px] font-black uppercase text-manises-gold">
        {isPending ? 'Solicitud' : 'Certificado demo'}
      </div>

      <div className="flex p-4">
        {isPending ? (
          <div className="mr-4 flex h-24 w-20 shrink-0 flex-col items-center justify-center rounded-lg border border-dashed border-manises-blue/15 bg-white p-2 shadow-sm">
            <div className="flex h-full w-full items-center justify-center rounded bg-manises-blue/5">
              <Target className="h-8 w-8 text-manises-blue/20" />
            </div>
            <p className="mt-1 text-center text-[6px] font-bold uppercase leading-tight text-slate-300">Pendiente de asignar</p>
          </div>
        ) : (
          <NationalTicketThumbnail drawId={ticket.gameId.includes('jueves') ? 'jueves' : 'sabado'} className="mr-4 w-24 shadow-sm" />
        )}

        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-manises-blue/40">
              Lotería Nacional
            </p>
            <h4 className="text-sm font-black text-manises-blue">{drawLabel}</h4>
            <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
              {isPending ? 'Pendiente / tramitando' : `Confirmada ${ticket.metadata?.confirmedAt ? formatDate(ticket.metadata.confirmedAt) : ''}`}
            </p>
          </div>

          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <span className="block text-[28px] font-black leading-none tracking-tighter text-manises-blue">
                {displayNumber.padStart(5, '0')}
              </span>
              <p className="text-[9px] font-bold text-slate-400">
                {quantity} {quantity === 1 ? 'décimo' : 'décimos'} · {formatCurrency(ticket.price)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!isPending && seriesFractions.length > 0 && (
        <div className="border-t border-dashed border-manises-blue/10 bg-white/70 px-4 py-3">
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">Series y fracciones asignadas</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {seriesFractions.map((item, index) => (
              <div key={`${item.serie}-${item.fraccion}-${index}`} className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5">
                <p className="text-[9px] font-black text-manises-blue">Serie {item.serie}</p>
                <p className="text-[8px] font-bold text-slate-400">Fracción {item.fraccion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {ticket.metadata?.holderName && !isPending && (
        <div className="border-t border-dashed border-manises-blue/10 bg-white/60 px-4 py-2">
          <p className="text-[9px] font-bold text-slate-500">Titular: <span className="font-black text-manises-blue">{ticket.metadata.holderName}</span></p>
        </div>
      )}

      {isScrutinized && (
        <div className="border-t border-dashed border-manises-blue/10 bg-emerald-50/70 px-4 py-2">
          <p className="text-[9px] font-black uppercase tracking-wider text-emerald-700">
            Premio obtenido: {ticket.prize ? formatCurrency(ticket.prize) : '0,00 €'}
          </p>
          {deliveryMode === 'custody' ? (
            <p className="mt-1 text-[9px] font-semibold text-emerald-700/80">Custodia: abono automático en saldo demo.</p>
          ) : (
            <p className="mt-1 text-[9px] font-semibold text-emerald-700/80">Mensajería: {ticket.metadata?.shippingStatus ?? 'estado pendiente'}</p>
          )}
        </div>
      )}

      {deliveryMode === 'shipping' && address && (
        <div className="border-t border-dashed border-manises-blue/10 bg-amber-50/60 px-4 py-2">
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-amber-800">Dirección de envío</p>
          <p className="mt-1 text-[9px] font-semibold leading-relaxed text-amber-900">
            {address.name} {address.surnames} · {address.address}, {address.postalCode} {address.municipality} ({address.province}) · {address.phone}
          </p>
        </div>
      )}

      <div className="border-t border-dashed border-manises-blue/10 bg-manises-blue/[0.02] p-2 text-center">
        <p className="text-[8px] font-bold uppercase tracking-widest text-manises-blue/30">
          {deliveryMode === 'shipping' ? 'Mensajería demo · gastos agrupados en pedido' : 'Custodia demo · Administración Nº 6 · Manises'}
        </p>
      </div>
    </div>
  );
}
