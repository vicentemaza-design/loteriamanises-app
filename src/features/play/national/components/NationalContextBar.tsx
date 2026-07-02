import { Calendar, ShieldCheck, Spark, EditPencil, Truck } from 'iconoir-react/regular';
import type { DeliveryMode } from './NationalDeliverySelector';
import type { NationalMethod } from './NationalPreFlow';

interface NationalContextBarProps {
  drawDate: string; // ISO con hora
  delivery?: DeliveryMode;
  method: NationalMethod;
  onEdit: () => void;
}

function formatContextDate(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase();
  const day = d.getDate();
  const month = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();
  const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${weekday} ${day} ${month} · ${time}`;
}

export function NationalContextBar({ drawDate, delivery, method, onEdit }: NationalContextBarProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
      {/* Fecha */}
      <div className="flex shrink-0 items-center gap-1">
        <Calendar className="h-3 w-3 text-manises-blue/50" />
        <span className="text-[9px] font-black tracking-wide text-manises-blue">
          {formatContextDate(drawDate)}
        </span>
      </div>

      {delivery && (
        <>
          <span className="text-slate-200">|</span>
          <div className="flex shrink-0 items-center gap-1">
            {delivery === 'custody' ? (
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
            ) : (
              <Truck className="h-3 w-3 text-blue-500" />
            )}
            <span className="text-[9px] font-bold text-slate-500">
              {delivery === 'custody' ? 'Digital' : 'Envío'}
            </span>
          </div>
        </>
      )}

      <span className="text-slate-200">|</span>

      {/* Método */}
      <div className="flex shrink-0 items-center gap-1">
        {method === 'aleatorio' ? (
          <Spark className="h-3 w-3 text-manises-gold" />
        ) : (
          <EditPencil className="h-3 w-3 text-slate-400" />
        )}
        <span className="text-[9px] font-bold text-slate-500">
          {method === 'aleatorio' ? 'Aleatorio' : 'Manual'}
        </span>
      </div>

      {/* Editar */}
      <button
        type="button"
        onClick={onEdit}
        className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-50 transition-colors hover:bg-slate-100 active:scale-95"
      >
        <EditPencil className="h-3 w-3 text-slate-400" />
      </button>
    </div>
  );
}
