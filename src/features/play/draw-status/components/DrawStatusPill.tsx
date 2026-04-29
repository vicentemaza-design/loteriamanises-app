import {
  CheckCircle,
  InfoCircle,
  Timer,
  WarningTriangle,
} from 'iconoir-react/regular';
import { cn } from '@/shared/lib/utils';
import type { ResolvedDrawStatus } from '../contracts/draw-status.contract';

interface DrawStatusPillProps {
  drawStatus: ResolvedDrawStatus;
  selectedDrawsCount?: number;
  className?: string;
}

function formatCompactDrawMoment(iso: string): string {
  const date = new Date(iso);
  const weekday = date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  const time = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${weekday} ${time}`;
}

function formatCompactTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DrawStatusPill({
  drawStatus,
  selectedDrawsCount = 1,
  className,
}: DrawStatusPillProps) {
  const extraDrawsCount = Math.max(selectedDrawsCount - 1, 0);
  const isClosed = drawStatus.state === 'closed';
  const heading = isClosed
    ? 'Cierre demo alcanzado'
    : extraDrawsCount > 0
      ? 'Primer sorteo seleccionado'
      : 'Próximo sorteo';
  const secondaryText = isClosed
    ? 'Validación operativa pendiente de integración'
    : drawStatus.isDemoCutoff
      ? 'Hora límite demo · Pendiente de integración'
      : 'Hora límite';
  const cutoffLabel = drawStatus.isDemoCutoff ? 'Límite demo' : 'Límite';
  const statusLabel = drawStatus.state === 'open'
    ? 'Abierto'
    : drawStatus.state === 'closingSoon'
      ? 'Cierra pronto'
      : 'Cierre demo';

  const Icon = drawStatus.state === 'open'
    ? CheckCircle
    : drawStatus.state === 'closingSoon'
      ? WarningTriangle
      : InfoCircle;

  return (
    <div
      className={cn(
        'rounded-2xl border px-3 py-2.5 shadow-sm backdrop-blur-sm transition-colors',
        drawStatus.state === 'open' && 'border-sky-200/80 bg-sky-50/80',
        drawStatus.state === 'closingSoon' && 'border-amber-200/80 bg-amber-50/80',
        drawStatus.state === 'closed' && 'border-slate-200/80 bg-slate-50/90',
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
            drawStatus.state === 'open' && 'bg-sky-100 text-sky-700',
            drawStatus.state === 'closingSoon' && 'bg-amber-100 text-amber-700',
            drawStatus.state === 'closed' && 'bg-slate-200 text-slate-600',
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
              {heading}
              <span className="ml-1 normal-case tracking-normal text-slate-400">{secondaryText}</span>
            </p>

            <div className="flex items-center gap-1.5">
              {extraDrawsCount > 0 && (
                <span className="rounded-full bg-white/85 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-slate-500">
                  +{extraDrawsCount} sorteos
                </span>
              )}

              <span
                className={cn(
                  'rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em]',
                  drawStatus.state === 'open' && 'bg-emerald-100 text-emerald-700',
                  drawStatus.state === 'closingSoon' && 'bg-amber-100 text-amber-700',
                  drawStatus.state === 'closed' && 'bg-slate-200 text-slate-700',
                )}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-[12px] font-black text-slate-700">
            <Timer className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <p className="min-w-0 truncate">
              Sorteo: {formatCompactDrawMoment(drawStatus.drawDate)} · {cutoffLabel}: {formatCompactTime(drawStatus.salesCloseAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
