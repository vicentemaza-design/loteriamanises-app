import { formatCurrency } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/Button';
import { Bookmark, Calendar, InfoCircle } from 'iconoir-react/regular';
import { toast } from 'sonner';

interface NationalReservationCardProps {
  number: string;
  drawLabel: string;
  drawDate: string;
  onRemove: () => void;
}

export function NationalReservationCard({
  number,
  drawLabel,
  drawDate,
  onRemove,
}: NationalReservationCardProps) {
  const handleConfirm = () => {
    toast.success('Simulación: Confirmación de reserva enviada (demo).');
  };

  return (
    <div className="rounded-[1.8rem] border border-manises-blue/10 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-manises-gold/10 text-manises-gold">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-manises-blue">Reservas demo activas</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Confirmación manual pendiente
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50"
          onClick={onRemove}
        >
          Eliminar
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5">
        <div className="flex flex-col items-center justify-center min-w-[3.5rem] py-1.5 rounded-xl bg-manises-blue text-white shadow-sm">
          <p className="text-[8px] font-black uppercase opacity-60">Reserva</p>
          <p className="text-sm font-black tracking-widest">{number}</p>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black text-manises-blue truncate">
            {drawLabel}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-slate-400" />
            <p className="text-[10px] font-bold text-slate-500">
              Límite: 24h antes del sorteo (Demo)
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-wider">
            Pendiente
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 flex gap-3">
          <InfoCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-blue-800 leading-tight">
              No es compra automática
            </p>
            <p className="text-[9px] font-medium text-blue-700 leading-snug">
              Esta reserva requiere que entres y confirmes manualmente el pago antes de la fecha límite.
            </p>
          </div>
        </div>

        <Button
          className="w-full rounded-xl bg-manises-blue text-white font-bold py-2.5 shadow-md active:scale-[0.98] transition-all"
          onClick={handleConfirm}
        >
          Confirmar selección demo
        </Button>

        <p className="text-center text-[8px] font-medium text-slate-400">
          Demo · no se realizará ninguna reserva real · Pendiente de integración
        </p>
      </div>
    </div>
  );
}
