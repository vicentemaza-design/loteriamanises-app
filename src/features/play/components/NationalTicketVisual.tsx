import * as React from 'react';
import { cn, formatCurrency, formatDate } from '@/shared/lib/utils';
import { BellRing, CheckCircle2, Landmark, ShieldCheck, Star, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import juevesTicket from '@/assets/images/loteria_jueves_ticket.jpg';
import sabadoTicket from '@/assets/images/loteria_sabado_ticket.jpg';

export type NationalDrawType = 'ordinary' | 'special' | 'navidad' | 'nino';

type DemoReservationStatus = 'Pendiente de confirmación';

interface DemoReservation {
  id: string;
  number: string;
  drawLabel: string;
  drawDate: string;
  deadlineDate: string;
  status: DemoReservationStatus;
}

interface NationalTicketVisualProps {
  number: string | null;
  drawLabel: string;
  drawDate: string;
  price: number;
  drawType?: NationalDrawType;
  gameId?: string;
  className?: string;
}

function getDemoDeadlineDate(dateIso: string): string {
  const date = new Date(dateIso);

  if (Number.isNaN(date.getTime())) {
    return dateIso;
  }

  date.setDate(date.getDate() - 1);
  date.setHours(20, 0, 0, 0);

  return date.toISOString();
}

export const NationalTicketVisual: React.FC<NationalTicketVisualProps> = ({
  number,
  drawLabel,
  drawDate,
  price,
  drawType = 'ordinary',
  gameId,
  className,
}) => {
  const [demoReservation, setDemoReservation] = React.useState<DemoReservation | null>(null);

  // Configuración visual según el tipo de sorteo
  const config = React.useMemo(() => {
    switch (drawType) {
      case 'navidad':
        return {
          bg: 'bg-[#991b1b]',
          accent: 'bg-[#7f1d1d]',
          text: 'text-white',
          border: 'border-[#450a0a]',
          label: 'Sorteo de Navidad',
          seal: '🎄',
        };
      case 'nino':
        return {
          bg: 'bg-[#1e40af]',
          accent: 'bg-[#1e3a8a]',
          text: 'text-white',
          border: 'border-[#172554]',
          label: 'Sorteo del Niño',
          seal: '👶',
        };
      case 'special':
        return {
          bg: 'bg-[#065f46]',
          accent: 'bg-[#064e3b]',
          text: 'text-white',
          border: 'border-[#022c22]',
          label: 'Sorteo Especial',
          seal: '✨',
        };
      default: {
        const isJueves = gameId === 'loteria-nacional-jueves';
        const isSabado = gameId === 'loteria-nacional-sabado';
        return {
          bg: 'bg-white',
          accent: 'bg-slate-50',
          text: 'text-slate-900',
          border: 'border-slate-200',
          label: 'Lotería Nacional',
          seal: '🏛️',
          realImage: isJueves ? juevesTicket : isSabado ? sabadoTicket : undefined,
        };
      }
    }
  }, [drawType, gameId]);

  const displayNumbers = number ? number.split('') : ['?', '?', '?', '?', '?'];
  const hasSelectedNumber = Boolean(number);

  const handleCreateDemoReservation = () => {
    if (!number) {
      toast.error('Elige un número antes de crear una reserva demo.');
      return;
    }

    setDemoReservation({
      id: `${number}-${drawDate}`,
      number,
      drawLabel,
      drawDate,
      deadlineDate: getDemoDeadlineDate(drawDate),
      status: 'Pendiente de confirmación',
    });
    toast.success('Reserva demo creada. Confirmación manual pendiente de integración.');
  };

  const handleConfirmDemoSelection = () => {
    toast.success('Selección demo marcada para confirmación manual. No se añadirá a la cesta automáticamente.');
  };

  const handleDeleteDemoReservation = () => {
    setDemoReservation(null);
    toast.success('Reserva demo eliminada.');
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className={cn(
        'relative overflow-hidden rounded-2xl border-2 shadow-xl aspect-[1.8/1] flex flex-col',
        config.bg,
        config.border
      )}>
        {/* Asset Real del Décimo */}
        {config.realImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={config.realImage}
              alt="Décimo visual demo"
              className="w-full h-full object-cover"
            />
            {/* Overlay suave para legibilidad si es necesario */}
            <div className="absolute inset-0 bg-white/10" />
          </div>
        )}

        {/* Patrón de fondo (Solo si no hay imagen real) */}
        {!config.realImage && (
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
            <div className="absolute inset-0 flex flex-wrap gap-4 rotate-12 scale-150">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="w-12 h-12 border-2 border-current rounded-full" />
              ))}
            </div>
          </div>
        )}

        {/* Cabecera del décimo (Sutil si hay imagen real) */}
        <div className={cn(
          'relative z-10 px-4 py-2 flex items-center justify-between border-b border-dashed',
          config.accent,
          config.realImage && 'bg-transparent border-transparent'
        )}>
          <div className="flex items-center gap-2">
            <Landmark className={cn('w-4 h-4', config.realImage ? 'text-slate-900' : config.text)} />
            <span className={cn(
              'text-[10px] font-black uppercase tracking-widest',
              config.realImage ? 'text-slate-900' : config.text
            )}>
              Administración demo
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className={cn('w-3 h-3', config.realImage ? 'text-slate-900' : config.text, 'opacity-60')} />
            <span className={cn(
              'text-[8px] font-bold uppercase',
              config.realImage ? 'text-slate-900' : config.text,
              'opacity-60'
            )}>
              Visual demo
            </span>
          </div>
        </div>

        {/* Cuerpo principal */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
          {/* Sello de agua / Icono fondo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-10 grayscale">
            {config.seal}
          </div>

          {/* Info Sorteo (Solo si no hay imagen real, en real ya viene impreso) */}
          {!config.realImage && (
            <div className="text-center mb-3">
              <p className={cn('text-[9px] font-black uppercase tracking-[0.2em]', config.text, 'opacity-60')}>
                {drawLabel}
              </p>
              <p className={cn('text-xs font-black', config.text)}>
                {formatDate(drawDate)}
              </p>
            </div>
          )}

          {/* NÚMERO - Versión integrada como 'placa' o cápsula premium */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn(
              'relative z-10 flex flex-col items-center',
              config.realImage && 'mt-2'
            )}
          >
            {/* La Placa / Cápsula del número */}
            <div className={cn(
              'flex items-center justify-center px-6 py-4 rounded-[2rem] transition-all',
              config.realImage
                ? 'bg-white/95 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-white/50'
                : 'bg-white/10 border border-white/20'
            )}>
              <div className="flex gap-3">
                {displayNumbers.map((digit, i) => (
                  <div
                    key={i}
                    className={cn(
                      'text-5xl font-black tracking-tighter',
                      config.realImage ? 'text-slate-900' : config.text
                    )}
                  >
                    {digit}
                  </div>
                ))}
              </div>
            </div>

            {/* Indicador sutil de posición o tipo si es real */}
            {config.realImage && (
              <div className="mt-3 flex items-center gap-2">
                <div className="h-[1px] w-4 bg-slate-300" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Número seleccionado</span>
                <div className="h-[1px] w-4 bg-slate-300" />
              </div>
            )}
          </motion.div>

          {hasSelectedNumber && (
            <button
              type="button"
              onClick={handleCreateDemoReservation}
              className="relative z-10 mt-3 inline-flex items-center gap-2 rounded-full border border-manises-blue/15 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-manises-blue shadow-sm backdrop-blur-sm transition active:scale-95"
            >
              <BellRing className="h-3.5 w-3.5" />
              Crear reserva demo
            </button>
          )}

          {/* Serie / Fracción / Precio - Estilo minimalista sobre el décimo */}
          <div className={cn(
            'mt-4 flex gap-4 items-center px-4 py-2 rounded-full',
            config.realImage ? 'bg-black/5 backdrop-blur-sm border border-black/5' : 'bg-current/5'
          )}>
            <div className="text-center">
              <p className={cn('text-[7px] font-black uppercase tracking-widest opacity-40', config.text)}>Serie</p>
              <p className={cn('text-xs font-black', config.text)}>1ª</p>
            </div>
            <div className="h-4 w-[1px] bg-current/10" />
            <div className="text-center">
              <p className={cn('text-[7px] font-black uppercase tracking-widest opacity-40', config.text)}>Fracción</p>
              <p className={cn('text-xs font-black', config.text)}>1ª</p>
            </div>
            <div className="h-4 w-[1px] bg-current/10" />
            <div className="text-center">
              <p className={cn('text-[7px] font-black uppercase tracking-widest opacity-40', config.text)}>Precio</p>
              <p className={cn('text-xs font-black', config.text)}>{formatCurrency(price)}</p>
            </div>
          </div>
        </div>

        {/* Pie con banda de seguridad (Solo si no hay imagen real) */}
        {!config.realImage && (
          <div className={cn('px-4 py-1.5 border-t border-dashed flex items-center justify-between', config.accent)}>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className={cn('w-1 h-3 rounded-full opacity-20', config.text === 'text-white' ? 'bg-white' : 'bg-slate-900')} />
                ))}
              </div>
              <span className={cn('text-[9px] font-mono', config.text, 'opacity-40')}>
                081980300001
              </span>
            </div>
            <Star className={cn('w-3 h-3 animate-pulse', config.text === 'text-white' ? 'text-amber-400' : 'text-amber-500')} />
          </div>
        )}
      </div>

      {demoReservation && (
        <motion.section
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-[1.35rem] border border-manises-blue/10 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Reservas demo</p>
              <h3 className="mt-1 text-base font-black tracking-widest text-manises-blue">{demoReservation.number}</h3>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-amber-900">
              {demoReservation.status}
            </span>
          </div>

          <div className="mt-3 grid gap-2 rounded-2xl bg-slate-50 p-3 text-[11px] font-semibold text-slate-600">
            <div className="flex items-center justify-between gap-2">
              <span>Sorteo</span>
              <span className="text-right font-black text-manises-blue">{demoReservation.drawLabel} · {formatDate(demoReservation.drawDate)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Fecha límite demo</span>
              <span className="text-right font-black text-manises-blue">{formatDate(demoReservation.deadlineDate)}</span>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-dashed border-manises-blue/15 bg-manises-blue/[0.03] p-3">
            <p className="text-[11px] font-black text-manises-blue">No es compra automática</p>
            <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-600">
              Requiere confirmación manual antes del sorteo. Demo · reserva pendiente de integración.
            </p>
            <p className="mt-1 text-[10px] font-semibold leading-relaxed text-slate-500">
              Demo · no se realizará ninguna reserva real. Confirmación manual pendiente de integración.
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleConfirmDemoSelection}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-manises-blue px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-sm transition active:scale-95"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirmar selección demo
            </button>
            <button
              type="button"
              onClick={handleDeleteDemoReservation}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 transition active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar reserva
            </button>
          </div>
        </motion.section>
      )}
    </div>
  );
};
