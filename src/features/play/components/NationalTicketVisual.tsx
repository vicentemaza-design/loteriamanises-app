import * as React from 'react';
import { cn, formatCurrency, formatDate } from '@/shared/lib/utils';
import { Landmark, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'motion/react';

import juevesTicket from '@/assets/images/loteria_jueves_ticket.jpg';
import sabadoTicket from '@/assets/images/loteria_sabado_ticket.jpg';

export type NationalDrawType = 'ordinary' | 'special' | 'navidad' | 'nino';

interface NationalTicketVisualProps {
  number: string | null;
  drawLabel: string;
  drawDate: string;
  price: number;
  drawType?: NationalDrawType;
  gameId?: string;
  className?: string;
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

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border-2 shadow-xl aspect-[1.8/1] flex flex-col",
      config.bg,
      config.border,
      className
    )}>
      {/* Asset Real del Décimo */}
      {config.realImage && (
        <div className="absolute inset-0 z-0">
          <img 
            src={config.realImage} 
            alt="Décimo Oficial" 
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
        "relative z-10 px-4 py-2 flex items-center justify-between border-b border-dashed", 
        config.accent,
        config.realImage && "bg-transparent border-transparent"
      )}>
        <div className="flex items-center gap-2">
          <Landmark className={cn("w-4 h-4", config.realImage ? "text-slate-900" : config.text)} />
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest", 
            config.realImage ? "text-slate-900" : config.text
          )}>
            Loterías y Apuestas del Estado
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className={cn("w-3 h-3", config.realImage ? "text-slate-900" : config.text, "opacity-60")} />
          <span className={cn(
            "text-[8px] font-bold uppercase", 
            config.realImage ? "text-slate-900" : config.text, 
            "opacity-60"
          )}>
            Oficial
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
            <p className={cn("text-[9px] font-black uppercase tracking-[0.2em]", config.text, "opacity-60")}>
              {drawLabel}
            </p>
            <p className={cn("text-xs font-black", config.text)}>
              {formatDate(drawDate)}
            </p>
          </div>
        )}

        {/* NÚMERO - Versión integrada como 'placa' o cápsula premium */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "relative z-10 flex flex-col items-center",
            config.realImage && "mt-2"
          )}
        >
          {/* La Placa / Cápsula del número */}
          <div className={cn(
            "flex items-center justify-center px-6 py-4 rounded-[2rem] transition-all",
            config.realImage 
              ? "bg-white/95 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-white/50" 
              : "bg-white/10 border border-white/20"
          )}>
            <div className="flex gap-3">
              {displayNumbers.map((digit, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-5xl font-black tracking-tighter",
                    config.realImage ? "text-slate-900" : config.text
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
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Número Seleccionado</span>
              <div className="h-[1px] w-4 bg-slate-300" />
            </div>
          )}
        </motion.div>

        {/* Serie / Fracción / Precio - Estilo minimalista sobre el décimo */}
        <div className={cn(
          "mt-4 flex gap-4 items-center px-4 py-2 rounded-full",
          config.realImage ? "bg-black/5 backdrop-blur-sm border border-black/5" : "bg-current/5"
        )}>
          <div className="text-center">
            <p className={cn("text-[7px] font-black uppercase tracking-widest opacity-40", config.text)}>Serie</p>
            <p className={cn("text-xs font-black", config.text)}>1ª</p>
          </div>
          <div className="h-4 w-[1px] bg-current/10" />
          <div className="text-center">
            <p className={cn("text-[7px] font-black uppercase tracking-widest opacity-40", config.text)}>Fracción</p>
            <p className={cn("text-xs font-black", config.text)}>1ª</p>
          </div>
          <div className="h-4 w-[1px] bg-current/10" />
          <div className="text-center">
            <p className={cn("text-[7px] font-black uppercase tracking-widest opacity-40", config.text)}>Precio</p>
            <p className={cn("text-xs font-black", config.text)}>{formatCurrency(price)}</p>
          </div>
        </div>
      </div>

      {/* Pie con banda de seguridad (Solo si no hay imagen real) */}
      {!config.realImage && (
        <div className={cn("px-4 py-1.5 border-t border-dashed flex items-center justify-between", config.accent)}>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className={cn("w-1 h-3 rounded-full opacity-20", config.text === 'text-white' ? 'bg-white' : 'bg-slate-900')} />
              ))}
            </div>
            <span className={cn("text-[9px] font-mono", config.text, "opacity-40")}>
              081980300001
            </span>
          </div>
          <Star className={cn("w-3 h-3 animate-pulse", config.text === 'text-white' ? 'text-amber-400' : 'text-amber-500')} />
        </div>
      )}
    </div>
  );
};
