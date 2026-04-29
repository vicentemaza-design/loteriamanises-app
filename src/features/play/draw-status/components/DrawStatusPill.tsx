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
    ? 'Sorteo no disponible'
    : drawStatus.isDemoCutoff
      ? 'Hora límite demo'
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
        'rounded-[1.15rem] border px-3 py-2 shadow-sm backdrop-blur-sm transition-colors',
        drawStatus.state === 'open' && 'border-sky-200/80 bg-sky-50/80',
        drawStatus.state === 'closingSoon' && 'border-amber-200/80 bg-amber-50/80',
        drawStatus.state === 'closed' && 'border-slate-200/80 bg-slate-50/90',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <div
          className={cn(
            'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
            drawStatus.state === 'open' && 'bg-sky-100 text-sky-700',
            drawStatus.state === 'closingSoon' && 'bg-amber-100 text-amber-700',
            drawStatus.state === 'closed' && 'bg-slate-200 text-slate-600',
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                {heading}
              </p>
              <p className="mt-0.5 text-[10px] font-medium leading-snug text-slate-400">
                {secondaryText}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {extraDrawsCount > 0 && (
                <span className="rounded-full bg-white/85 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-slate-500">
                  +{extraDrawsCount}
                </span>
              )}

              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em]',
                  drawStatus.state === 'open' && 'bg-emerald-100 text-emerald-700',
                  drawStatus.state === 'closingSoon' && 'bg-amber-100 text-amber-700',
                  drawStatus.state === 'closed' && 'bg-slate-200 text-slate-700',
                )}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-black text-slate-700">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1">
              <Timer className="h-3 w-3 shrink-0 text-slate-400" />
              <span>Sorteo {formatCompactDrawMoment(drawStatus.drawDate)}</span>
            </span>
            <span className="inline-flex rounded-full bg-white/80 px-2 py-1">
              {cutoffLabel} {formatCompactTime(drawStatus.salesCloseAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
