import type { ElementType, ReactNode } from 'react';
import { Clock, CheckCircle2, Trophy, User, Truck, Lock, LayoutList, AlertTriangle, Info } from 'lucide-react';
import { NationalTicketThumbnail } from '@/features/play/components/NationalTicketThumbnail';
import { formatCurrency, cn } from '@/shared/lib/utils';
import type { Ticket } from '@/shared/types/domain';

// ── helpers ────────────────────────────────────────────────────────────────

type PlayStatus = 'pending' | 'processing' | 'confirmed' | 'scrutinized' | 'rejected';

function getPlayStatus(t: Ticket): PlayStatus {
  const s = t.metadata?.playStatus;
  if (s === 'pending' || s === 'processing' || s === 'confirmed' || s === 'scrutinized' || s === 'rejected') return s;
  if (t.status === 'won' || t.status === 'lost') return 'scrutinized';
  return 'pending';
}

function getDrawId(ticket: Ticket): string {
  if (ticket.gameType === 'navidad') return 'navidad';
  if (ticket.gameType === 'nino') return 'nino';
  if (ticket.gameId.includes('jueves')) return 'jueves';
  return 'sabado';
}

function getNumber(ticket: Ticket): string {
  return (ticket.metadata?.nationalNumber ?? ticket.numbers.join('')).padStart(5, '0');
}

function getQty(ticket: Ticket): number {
  return ticket.metadata?.nationalQuantity ?? 1;
}

function getOrderTotal(ticket: Ticket): number {
  return typeof ticket.metadata?.orderTotalPrice === 'number' ? ticket.metadata.orderTotalPrice : ticket.price;
}

function getPedidoCode(ticket: Ticket): string {
  return `TLJ-${ticket.id.slice(-8).toUpperCase()}`;
}

const DRAW_NAMES: Record<string, string> = {
  'navidad': 'Lotería de Navidad',
  'nino': 'El Niño',
  'loteria-nacional': 'Lotería Nacional',
};

function getDrawName(ticket: Ticket): string {
  return ticket.metadata?.nationalDrawLabel ?? DRAW_NAMES[ticket.gameType] ?? 'Lotería';
}

function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

// ── Document status header ─────────────────────────────────────────────────

type StatusVariant = 'pending' | 'confirmed' | 'scrutinized';

function DocumentStatusHeader({
  variant,
  description,
}: {
  variant: StatusVariant;
  description: string;
}) {
  const configs = {
    pending: {
      Icon: Clock,
      circleBg: 'bg-amber-100',
      iconColor: 'text-amber-500',
      titleColor: 'text-amber-600',
      title: 'PENDIENTE DE CONFIRMACIÓN',
      subtitle: 'Solicitud recibida',
    },
    confirmed: {
      Icon: CheckCircle2,
      circleBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-600',
      title: 'CONFIRMADO',
      subtitle: 'Justificante de compra',
    },
    scrutinized: {
      Icon: Trophy,
      circleBg: 'bg-manises-blue/10',
      iconColor: 'text-manises-blue',
      titleColor: 'text-manises-blue',
      title: 'ESCRUTADO',
      subtitle: 'Resultado del sorteo',
    },
  } as const;

  const { Icon, circleBg, iconColor, titleColor, title, subtitle } = configs[variant];

  return (
    <div className="flex flex-col items-center gap-2 px-6 pt-6 pb-4 text-center">
      <div className={cn('flex h-[56px] w-[56px] items-center justify-center rounded-full', circleBg)}>
        <Icon className={cn('h-7 w-7', iconColor)} />
      </div>
      <div>
        <p className={cn('text-[13px] font-black uppercase tracking-[0.10em]', titleColor)}>{title}</p>
        <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{subtitle}</p>
      </div>
      <p className="max-w-[290px] text-[11px] font-medium leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

// ── Stats bar: NÚMERO | DÉCIMOS | IMPORTE TOTAL ────────────────────────────

function StatsBar({ number, qty, total }: { number: string; qty: number; total: number }) {
  return (
    <div className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 bg-white">
      <div className="flex flex-col items-center py-3 px-2">
        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">Número</p>
        <p className="mt-1 text-[20px] font-black tracking-[0.10em] text-manises-blue leading-none">{number}</p>
      </div>
      <div className="flex flex-col items-center py-3 px-2">
        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">Décimos</p>
        <p className="mt-1 text-[20px] font-black text-manises-blue leading-none">{qty}</p>
        <p className="text-[9px] font-semibold text-slate-400">{qty === 1 ? 'décimo' : 'décimos'}</p>
      </div>
      <div className="flex flex-col items-center py-3 px-2">
        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">Importe total</p>
        <p className="mt-1 text-[15px] font-black text-emerald-600 leading-none">{formatCurrency(total)}</p>
      </div>
    </div>
  );
}

// ── Bounding boxes (mismos valores que NationalTicketVisual) ───────────────

const NUMBER_BOX: Record<string, { top: string; left: string; width: string; height: string }> = {
  jueves:  { top: '13%', left: '40%', width: '38%', height: '15%' },
  sabado:  { top: '10%', left: '38%', width: '38%', height: '15%' },
  navidad: { top:  '7%', left: '43%', width: '38%', height: '16%' },
  nino:    { top: '13%', left: '40%', width: '38%', height: '15%' },
};

// ── Décimo image with number overlay ──────────────────────────────────────

function DecimoImage({ ticket }: { ticket: Ticket }) {
  const number = getNumber(ticket);
  const drawId = getDrawId(ticket);
  const series = ticket.metadata?.seriesFractions ?? [];
  const firstSerie = series.length > 0 ? String(series[0].serie) : null;
  const box = NUMBER_BOX[drawId] ?? NUMBER_BOX.jueves;

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-md">
      <NationalTicketThumbnail drawId={drawId} className="w-full" />
      {/* Número en el hueco en blanco del décimo */}
      <div
        className="absolute z-10 flex items-center justify-center overflow-hidden pointer-events-none"
        style={box}
      >
        <span
          style={{
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 'clamp(22px, 9.5vw, 42px)',
            fontWeight: 900,
            letterSpacing: '0.18em',
            lineHeight: 1,
            color: '#111827',
            whiteSpace: 'nowrap',
          }}
        >
          {number}
        </span>
      </div>
      {firstSerie && (
        <div className="absolute top-2.5 right-2.5 z-20 rounded-lg bg-white/92 px-2.5 py-1 shadow-sm backdrop-blur-sm">
          <p className="text-[9px] font-bold text-slate-500">
            SERIE <span className="font-black text-manises-blue">{firstSerie}</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ── Section wrapper ─────────────────────────────────────────────────────────

function InfoSection({
  icon: Icon,
  title,
  children,
}: {
  icon: ElementType;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-50 px-4 py-2.5">
        <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{title}</p>
      </div>
      <div className="divide-y divide-slate-50">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueClass,
  multiline,
}: {
  label: string;
  value: string;
  valueClass?: string;
  multiline?: boolean;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-4 py-2', multiline && 'items-start')}>
      <span className="shrink-0 text-[10px] font-medium text-slate-400">{label}</span>
      <span className={cn('text-right text-[10px] font-black text-manises-blue', valueClass)}>
        {value}
      </span>
    </div>
  );
}

// ── Series y fracciones (grouped) ──────────────────────────────────────────

function SeriesFracciones({ ticket }: { ticket: Ticket }) {
  const items = ticket.metadata?.seriesFractions ?? [];
  const qty = getQty(ticket);
  if (items.length === 0) return null;

  const grouped = items.reduce<Record<string, (string | number)[]>>((acc, { serie, fraccion }) => {
    const key = String(serie);
    if (!acc[key]) acc[key] = [];
    acc[key].push(fraccion);
    return acc;
  }, {});

  return (
    <InfoSection icon={LayoutList} title="Series y fracciones asignadas">
      <div className="px-4 py-3 space-y-1.5">
        {Object.entries(grouped).map(([serie, fracciones]) => (
          <div key={serie} className="flex items-baseline gap-1">
            <span className="text-[10px] font-black text-manises-blue shrink-0">Serie {serie}</span>
            <span className="text-[9px] text-slate-300 mx-0.5">·</span>
            <span className="text-[10px] font-medium text-slate-500">
              Frac.: {(fracciones as (string | number)[]).join(', ')}
            </span>
          </div>
        ))}
        <div className="border-t border-slate-100 pt-1.5">
          <span className="text-[10px] font-black text-manises-blue">
            Total: {qty} {qty === 1 ? 'décimo' : 'décimos'}
          </span>
        </div>
      </div>
    </InfoSection>
  );
}

// ── Datos del titular ───────────────────────────────────────────────────────

function DatosTitular({ ticket }: { ticket: Ticket }) {
  const holderName = ticket.metadata?.holderName;
  const holderNif = ticket.metadata?.holderNif;
  if (!holderName && !holderNif) return null;

  return (
    <InfoSection icon={User} title="Datos del titular">
      {holderName && <InfoRow label="Titular" value={holderName} />}
      {holderNif && <InfoRow label="NIF" value={holderNif} />}
    </InfoSection>
  );
}

// ── Datos de envío (mensajería) ─────────────────────────────────────────────

function DatosEnvio({ ticket }: { ticket: Ticket }) {
  const addr = ticket.metadata?.shippingAddress;
  if (!addr) return null;

  const fullName = `${addr.name} ${addr.surnames ?? ''}`.trim();
  const fullAddress = `${addr.address}, ${addr.postalCode} ${addr.municipality}${addr.province ? ` (${addr.province})` : ''}`;

  return (
    <InfoSection icon={Truck} title="Datos de envío (Mensajería)">
      <InfoRow label="Nombre" value={fullName} />
      <InfoRow label="Dirección" value={fullAddress} multiline />
      <InfoRow label="Código Postal" value={addr.postalCode} />
      {addr.phone && <InfoRow label="Teléfono" value={addr.phone} />}
      {ticket.metadata?.shippingStatus && (
        <InfoRow label="Empresa de transporte" value={ticket.metadata.shippingStatus} />
      )}
    </InfoSection>
  );
}

// ── Custodia digital info ───────────────────────────────────────────────────

function DatosCustodia() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
        <Lock className="h-4 w-4 text-emerald-600" />
      </div>
      <div>
        <p className="text-[11px] font-black text-emerald-700">Custodia digital</p>
        <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-emerald-600">
          Tu décimo está custodiado en Admin. Lotería Manises. Los premios menores se abonan automáticamente en tu saldo.
        </p>
      </div>
    </div>
  );
}

// ── Premios obtenidos (escrutado) ───────────────────────────────────────────

function PremiosObtenidos({ prize, isShipping }: { prize: number; isShipping: boolean }) {
  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-2xl border border-orange-200 bg-orange-50">
        <div className="flex items-center gap-2 border-b border-orange-100 px-4 py-2.5">
          <Trophy className="h-3.5 w-3.5 shrink-0 text-orange-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-orange-600">Premios obtenidos</p>
        </div>
        <div className="divide-y divide-orange-100">
          <div className="flex justify-between px-4 py-2">
            <span className="text-[10px] font-medium text-slate-500">Premio obtenido</span>
            <span className="text-[10px] font-black text-manises-blue">{formatCurrency(prize)}</span>
          </div>
          <div className="flex justify-between px-4 py-2">
            <span className="text-[10px] font-black text-manises-blue">Total premiado</span>
            <span className="text-[12px] font-black text-manises-blue">{formatCurrency(prize)}</span>
          </div>
        </div>
      </div>
      {isShipping && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <p className="text-[10px] font-medium leading-relaxed text-amber-700">
            Los premios deberán cobrarse presentando el décimo físico original en cualquier punto de venta oficial de Loterías.
          </p>
        </div>
      )}
      {!isShipping && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <Lock className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
          <p className="text-[10px] font-medium leading-relaxed text-emerald-700">
            Premio ingresado automáticamente en tu saldo de Lotería Manises tras el escrutinio.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Resumen económico ───────────────────────────────────────────────────────

function ResumenEconomico({
  ticket,
  showPrize,
}: {
  ticket: Ticket;
  showPrize?: boolean;
}) {
  const qty = getQty(ticket);
  const orderTotal = getOrderTotal(ticket);
  const isShipping = ticket.metadata?.deliveryMode === 'shipping';
  const decimosTotal = qty * ticket.price;
  const shippingCost = isShipping ? Math.max(orderTotal - decimosTotal, 0) : 0;
  const prize = ticket.prize ?? 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-50 px-4 py-2.5">
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">Resumen económico</p>
      </div>
      <div className="space-y-2 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500">Importe de décimos</span>
          <span className="text-[10px] font-black text-manises-blue">{formatCurrency(isShipping ? decimosTotal : orderTotal)}</span>
        </div>
        {isShipping && shippingCost > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Gastos de envío</span>
            <span className="text-[10px] font-black text-manises-blue">{formatCurrency(shippingCost)}</span>
          </div>
        )}
        {showPrize && prize > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Premios obtenidos</span>
            <span className="text-[10px] font-black text-emerald-600">{formatCurrency(prize)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-[11px] font-black text-manises-blue">Total pagado</span>
          <span className="text-[14px] font-black text-manises-blue">{formatCurrency(orderTotal)}</span>
        </div>
      </div>
    </div>
  );
}

// ── State: Pending ─────────────────────────────────────────────────────────

function StatePending({ ticket }: { ticket: Ticket }) {
  const number = getNumber(ticket);
  const qty = getQty(ticket);
  const orderTotal = getOrderTotal(ticket);
  const drawName = getDrawName(ticket);
  const drawDate = formatLongDate(ticket.drawDate);

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      <DocumentStatusHeader
        variant="pending"
        description="Hemos recibido correctamente tu solicitud. Estamos comprobando la disponibilidad del número solicitado. Cuando el pedido sea confirmado recibirás una notificación y este documento pasará a ser tu justificante de compra."
      />

      <InfoSection icon={Info} title="Datos de la solicitud">
        <div className="flex items-start justify-between gap-4 px-4 py-2.5">
          <span className="shrink-0 text-[10px] font-medium text-slate-400">Número solicitado</span>
          <span className="text-right font-mono text-[18px] font-black tracking-[0.12em] text-manises-blue leading-tight">
            {number}
          </span>
        </div>
        <InfoRow label="Décimos solicitados" value={`${qty} ${qty === 1 ? 'décimo' : 'décimos'}`} />
        <InfoRow
          label="Importe solicitado"
          value={formatCurrency(orderTotal)}
          valueClass="text-amber-600"
        />
        <InfoRow label="Fecha de solicitud" value={formatDateTime(ticket.createdAt)} />
        <div className="flex items-start justify-between gap-4 px-4 py-2">
          <span className="shrink-0 text-[10px] font-medium text-slate-400">Sorteo</span>
          <div className="text-right">
            <p className="text-[10px] font-black text-manises-blue">{drawName}</p>
            <p className="text-[10px] font-semibold text-slate-400">{drawDate}</p>
          </div>
        </div>
        <InfoRow label="Nº de pedido" value={getPedidoCode(ticket)} />
      </InfoSection>

      <div className="flex items-start gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        <p className="text-[10px] font-medium leading-relaxed text-slate-500">
          Este documento no tiene validez como justificante de compra.
        </p>
      </div>
    </div>
  );
}

// ── State: Confirmed ────────────────────────────────────────────────────────

function StateConfirmed({ ticket }: { ticket: Ticket }) {
  const number = getNumber(ticket);
  const qty = getQty(ticket);
  const orderTotal = getOrderTotal(ticket);
  const isShipping = ticket.metadata?.deliveryMode === 'shipping';

  return (
    <div className="flex flex-col gap-4 pb-6">
      <DocumentStatusHeader
        variant="confirmed"
        description="Tu compra ha sido realizada con éxito. Este documento es tu justificante de compra."
      />

      <StatsBar number={number} qty={qty} total={orderTotal} />

      <div className="flex flex-col gap-4 px-4">
        <DecimoImage ticket={ticket} />
        <SeriesFracciones ticket={ticket} />
        <DatosTitular ticket={ticket} />
        {isShipping ? <DatosEnvio ticket={ticket} /> : <DatosCustodia />}
        <ResumenEconomico ticket={ticket} />
      </div>
    </div>
  );
}

// ── State: Scrutinized ──────────────────────────────────────────────────────

function StateScrutinized({ ticket }: { ticket: Ticket }) {
  const number = getNumber(ticket);
  const qty = getQty(ticket);
  const orderTotal = getOrderTotal(ticket);
  const isShipping = ticket.metadata?.deliveryMode === 'shipping';
  const prize = ticket.prize ?? 0;
  const hasPrize = prize > 0;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <DocumentStatusHeader
        variant="scrutinized"
        description="El sorteo ha sido celebrado. Este es el resultado definitivo de tu compra."
      />

      <StatsBar number={number} qty={qty} total={orderTotal} />

      <div className="flex flex-col gap-4 px-4">
        <DecimoImage ticket={ticket} />
        <SeriesFracciones ticket={ticket} />
        <DatosTitular ticket={ticket} />
        {isShipping ? <DatosEnvio ticket={ticket} /> : <DatosCustodia />}
        {hasPrize && <PremiosObtenidos prize={prize} isShipping={isShipping} />}
        <ResumenEconomico ticket={ticket} showPrize={hasPrize} />
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

export function NationalDetailContent({ ticket }: { ticket: Ticket }) {
  const status = getPlayStatus(ticket);

  if (status === 'pending' || status === 'processing') return <StatePending ticket={ticket} />;
  if (status === 'confirmed') return <StateConfirmed ticket={ticket} />;
  if (status === 'scrutinized') return <StateScrutinized ticket={ticket} />;

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
      <p className="text-[11px] font-black text-red-700">Pedido rechazado</p>
      <p className="text-[10px] font-semibold text-red-600">
        {ticket.metadata?.rejectionReason ?? 'El pedido no pudo tramitarse.'}
      </p>
    </div>
  );
}
