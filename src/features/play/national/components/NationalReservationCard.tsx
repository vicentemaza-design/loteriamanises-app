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
    toast.success('Demo · confirmación manual pendiente de integración.');
  };

  return (
    <div className="rounded-[1.8rem] border border-manises-blue/10 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-manises-gold/10 text-manises-gold">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[12px] font-black text-manises-blue uppercase tracking-tight">Reserva demo activa</h3>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 rounded-lg text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50"
          onClick={onRemove}
        >
          Eliminar
        </Button>
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
        <div className="flex flex-col items-center justify-center min-w-[3rem] py-1 rounded-lg bg-manises-blue text-white shadow-sm">
          <p className="text-[7px] font-black uppercase opacity-60">Nº</p>
          <p className="text-[13px] font-black tracking-widest">{number}</p>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-manises-blue truncate leading-none">
            {drawLabel}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5 text-slate-400" />
            <p className="text-[9px] font-bold text-slate-500">
              Límite: 24h antes (Demo)
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[7px] font-black uppercase tracking-wider">
            Pendiente de confirmación
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-2.5 flex gap-2">
          <InfoCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-blue-800 leading-tight">
              Confirmación manual requerida
            </p>
            <p className="text-[8px] font-medium text-blue-700 leading-tight">
              Esta reserva demo no es compra automática. Debes pagar manualmente antes del límite.
            </p>
          </div>
        </div>

        <Button
          className="w-full h-9 rounded-xl bg-manises-blue text-white font-black text-[10px] uppercase tracking-widest shadow-md active:scale-[0.98] transition-all"
          onClick={handleConfirm}
        >
          Confirmar selección demo
        </Button>

        <p className="text-center text-[7px] font-bold text-slate-400 uppercase tracking-tighter">
          Demo · no se realizará ninguna reserva real · Confirmación manual pendiente de integración
        </p>
      </div>
    </div>
  );
}
