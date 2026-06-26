import { Truck, Lock, Package, Clock, CheckCircle2, Trophy, MapPin, Info } from 'lucide-react';
import { NationalTicketThumbnail } from '@/features/play/components/NationalTicketThumbnail';
import { formatCurrency, formatDate, cn } from '@/shared/lib/utils';
import type { Ticket } from '@/shared/types/domain';

type PlayStatus = 'pending' | 'processing' | 'confirmed' | 'scrutinized' | 'rejected';

function getPlayStatus(t: Ticket): PlayStatus {
  const s = t.metadata?.playStatus;
  if (s === 'pending' || s === 'processing' || s === 'confirmed' || s === 'scrutinized' || s === 'rejected') return s;
  if (t.status === 'won' || t.status === 'lost') return 'scrutinized';
  return 'pending';
}

function getDrawId(ticket: Ticket): string {
  if (ticket.gameId.includes('jueves')) return 'jueves';
  if (ticket.gameId.includes('sabado') || ticket.gameId.includes('sábado')) return 'sabado';
  if (ticket.gameType === 'navidad') return 'sabado';
  return 'jueves';
}

// ── Shared: Decimo image + number ─────────────────────────────────────────

function DecimoImage({ ticket }: { ticket: Ticket }) {
  const number = (ticket.metadata?.nationalNumber ?? ticket.numbers.join('')).padStart(5, '0');
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-sm">
      <NationalTicketThumbnail drawId={getDrawId(ticket)} className="w-full" />
      <div className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-2 py-1 backdrop-blur-sm">
        <p className="text-[13px] font-black tracking-widest text-manises-blue">{number}</p>
      </div>
    </div>
  );
}

// ── Shared: Series & fracciones ────────────────────────────────────────────

function SeriesFracciones({ ticket }: { ticket: Ticket }) {
  const items = ticket.metadata?.seriesFractions ?? [];
  const status = getPlayStatus(ticket);
  const isPending = status === 'pending' || status === 'processing';

  if (isPending) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Datos provisionales</p>
            <p className="text-[9px] font-semibold text-slate-400">Las series y fracciones se asignarán cuando el pedido esté confirmado.</p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
      <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Series y fracciones asignadas</p>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, i) => (
          <div key={`${item.serie}-${item.fraccion}-${i}`} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
            <p className="text-[9px] font-black text-manises-blue">Serie {item.serie}</p>
            <p className="text-[8px] font-bold text-slate-400">Fracción {item.fraccion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── State: processing + shipping (Tramitando, Envío a domicilio) ───────────

function StateProcessingShipping({ ticket }: { ticket: Ticket }) {
  const orderTotal = typeof ticket.metadata?.orderTotalPrice === 'number' ? ticket.metadata.orderTotalPrice : ticket.price;
  const qty = ticket.metadata?.nationalQuantity ?? 1;
  const shipping = 6.00; // demo shipping cost
  const decimosTotal = qty * (ticket.price);
  const address = ticket.metadata?.shippingAddress;

  return (
    <div className="flex flex-col gap-3 px-4 pt-3">
      {/* Status banner */}
      <div className="flex items-start gap-3 rounded-[1.35rem] border border-blue-100 bg-blue-50 px-4 py-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100">
          <Package className="h-4.5 w-4.5 text-blue-600" />
        </div>
        <div>
          <p className="text-[11px] font-black text-blue-700">Envío a domicilio</p>
          <p className="text-[10px] font-semibold leading-relaxed text-blue-600">
            Estamos gestionando tu solicitud de compra. Recibirás una notificación cuando el pedido esté listo para su envío.
          </p>
        </div>
      </div>

      {/* Resumen económico */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-[1.1rem] border border-slate-100 bg-white px-3 py-3 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Resumen del pedido</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-[10px] font-semibold text-slate-500">Décimos ({qty})</span>
              <span className="text-[10px] font-black text-manises-blue">{formatCurrency(decimosTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-semibold text-slate-500">Gastos de envío</span>
              <span className="text-[10px] font-black text-manises-blue">{formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-1 mt-1">
              <span className="text-[10px] font-black text-slate-700">Total pedido</span>
              <span className="text-[11px] font-black text-manises-blue">{formatCurrency(orderTotal)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[1.1rem] border border-slate-100 bg-white px-3 py-3 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Dirección de entrega</p>
          {address ? (
            <div className="mt-1.5 space-y-0.5">
              <p className="text-[10px] font-black text-manises-blue">{address.name} {address.surnames}</p>
              <p className="text-[9px] font-semibold leading-relaxed text-slate-500">{address.address}</p>
              <p className="text-[9px] font-semibold text-slate-400">{address.postalCode} {address.municipality}</p>
            </div>
          ) : (
            <p className="mt-1 text-[9px] font-semibold text-slate-400">—</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <p className="text-[9px] font-semibold leading-relaxed text-slate-500">
            Te notificaremos en esta misma pantalla cuando el pedido haya sido confirmado y esté listo para su envío.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── State: pending + custody (Solicitud recibida) ──────────────────────────

function StatePendingCustody({ ticket }: { ticket: Ticket }) {
  const qty = ticket.metadata?.nationalQuantity ?? 1;
  const number = (ticket.metadata?.nationalNumber ?? ticket.numbers.join('')).padStart(5, '0');

  return (
    <div className="flex flex-col gap-3 px-4 pt-3">
      <div className="flex items-start gap-3 rounded-[1.35rem] border border-amber-100 bg-amber-50 px-4 py-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
          <Clock className="h-4.5 w-4.5 text-amber-600" />
        </div>
        <div>
          <p className="text-[11px] font-black text-amber-700">Solicitud recibida</p>
          <p className="text-[10px] font-semibold leading-relaxed text-amber-600">
            Hemos recibido correctamente tu solicitud de compra. Estamos verificando la disponibilidad del número solicitado. Una vez validado y asignado, el pedido pasará a estado Confirmado.
          </p>
        </div>
      </div>

      {/* Número solicitado */}
      <div className="rounded-[1.35rem] border border-slate-100 bg-white px-4 py-4 text-center shadow-sm">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Número solicitado</p>
        <p className="mt-2 text-[36px] font-black tracking-[0.12em] text-manises-blue">{number}</p>
        <div className="mt-2 flex justify-center gap-4">
          <div className="text-center">
            <p className="text-[9px] font-black uppercase text-slate-400">Cantidad solicitada</p>
            <p className="text-[12px] font-black text-manises-blue">{qty} {qty === 1 ? 'décimo' : 'décimos'}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black uppercase text-slate-400">Importe solicitado</p>
            <p className="text-[12px] font-black text-manises-blue">{formatCurrency(ticket.price * qty)}</p>
          </div>
        </div>
      </div>

      <SeriesFracciones ticket={ticket} />

      <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          <p className="text-[9px] font-semibold leading-relaxed text-amber-700">
            Pedido pendiente de confirmación. Recibirás una notificación cuando el pedido haya sido confirmado o si fuera necesario realizar alguna modificación por falta de disponibilidad.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── State: confirmed ───────────────────────────────────────────────────────

function StateConfirmed({ ticket }: { ticket: Ticket }) {
  const confirmedAt = ticket.metadata?.confirmedAt;
  const deliveryMode = ticket.metadata?.deliveryMode;
  const address = ticket.metadata?.shippingAddress;
  const qty = ticket.metadata?.nationalQuantity ?? 1;
  const isShipping = deliveryMode === 'shipping';

  return (
    <div className="flex flex-col gap-3 px-4 pt-3">
      {/* Delivery type chip row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black',
          isShipping
            ? 'border-blue-100 bg-blue-50 text-blue-700'
            : 'border-manises-blue/10 bg-manises-blue/5 text-manises-blue'
        )}>
          {isShipping ? <Truck className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          {isShipping ? 'Envío por mensajería' : 'Décimo en custodia'}
        </div>
        {confirmedAt && (
          <p className="text-[10px] font-semibold text-slate-400">Confirmado {formatDate(confirmedAt)}</p>
        )}
      </div>

      {/* Decimo image */}
      <DecimoImage ticket={ticket} />

      <SeriesFracciones ticket={ticket} />

      {/* Shipping address (if mensajería) */}
      {isShipping && address && (
        <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <div className="space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Datos de entrega</p>
              <p className="text-[10px] font-black text-manises-blue">{address.name} {address.surnames}</p>
              <p className="text-[9px] font-semibold text-slate-500">{address.address}</p>
              <p className="text-[9px] font-semibold text-slate-400">{address.postalCode} {address.municipality} ({address.province})</p>
            </div>
          </div>
        </div>
      )}

      {/* Custody info */}
      {!isShipping && (
        <div className="rounded-xl border border-manises-blue/10 bg-manises-blue/5 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 shrink-0 text-manises-blue/60" />
            <p className="text-[9px] font-semibold leading-relaxed text-manises-blue/70">
              Décimo en custodia en Lotería Manises. Puedes visualizar en todo momento la imagen del décimo depositado.
            </p>
          </div>
        </div>
      )}

      {/* Participation summary */}
      <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5">
        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Participación</p>
        <p className="text-[10px] font-semibold text-slate-600">
          Participas en {qty === 1 ? '1 décimo completo' : `${qty} décimos`} del número asignado. Incluye todas las series y fracciones indicadas.
        </p>
      </div>
    </div>
  );
}

// ── State: scrutinized ─────────────────────────────────────────────────────

function StateScrutinized({ ticket }: { ticket: Ticket }) {
  const prize = ticket.prize ?? 0;
  const hasPrize = prize > 0;
  const deliveryMode = ticket.metadata?.deliveryMode;
  const isCustody = deliveryMode === 'custody';

  return (
    <div className="flex flex-col gap-3 px-4 pt-3">
      {/* Prize result */}
      {hasPrize ? (
        <div className="flex items-start gap-3 rounded-[1.35rem] border border-emerald-100 bg-emerald-50 px-4 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <Trophy className="h-4.5 w-4.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-black text-emerald-700">Premio disponible en tu cuenta</p>
            <p className="text-[22px] font-black leading-none text-emerald-600">{formatCurrency(prize)}</p>
            <p className="text-[9px] font-semibold text-emerald-600/80">
              {isCustody ? 'Importe ingresado automáticamente en tu saldo.' : 'Puedes consultar el estado del cobro en la sección "Mi cuenta".'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-[1.35rem] border border-slate-100 bg-slate-50 px-4 py-3.5">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-slate-300" />
          <div>
            <p className="text-[11px] font-black text-slate-500">Sorteo celebrado</p>
            <p className="text-[10px] font-semibold text-slate-400">El número no ha resultado premiado en este sorteo.</p>
          </div>
        </div>
      )}

      {/* Decimo image */}
      <DecimoImage ticket={ticket} />

      <SeriesFracciones ticket={ticket} />

      {/* Custody auto-payment info */}
      {isCustody && hasPrize && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <p className="text-[9px] font-semibold leading-relaxed text-emerald-700">
              Cobro automático de premios. El importe se ingresará automáticamente en tu cuenta tras validar todos los sorteos. Puedes consultarlo en tu saldo disponible.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

export function NationalDetailContent({ ticket }: { ticket: Ticket }) {
  const status = getPlayStatus(ticket);
  const deliveryMode = ticket.metadata?.deliveryMode;
  const isShipping = deliveryMode === 'shipping';

  if (status === 'processing' && isShipping) return <StateProcessingShipping ticket={ticket} />;
  if (status === 'pending' || status === 'processing') return <StatePendingCustody ticket={ticket} />;
  if (status === 'confirmed') return <StateConfirmed ticket={ticket} />;
  if (status === 'scrutinized') return <StateScrutinized ticket={ticket} />;

  // rejected or fallback
  return (
    <div className="mx-4 mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
      <p className="text-[11px] font-black text-red-700">Pedido rechazado</p>
      <p className="text-[10px] font-semibold text-red-600">
        {(ticket.metadata?.rejectionReason as string | undefined) ?? 'El pedido no pudo tramitarse.'}
      </p>
    </div>
  );
}
