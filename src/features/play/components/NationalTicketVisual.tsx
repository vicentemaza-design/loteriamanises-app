import * as React from 'react';
import { cn, formatCurrency, formatDate } from '@/shared/lib/utils';
import { Landmark, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'motion/react';

export type NationalDrawType = 'ordinary' | 'special' | 'navidad' | 'nino';

interface NationalTicketVisualProps {
  number: string | null;
  drawLabel: string;
  drawDate: string;
  price: number;
  drawType?: NationalDrawType;
  className?: string;
}

export const NationalTicketVisual: React.FC<NationalTicketVisualProps> = ({
  number,
  drawLabel,
  drawDate,
  price,
  drawType = 'ordinary',
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
      default:
        return {
          bg: 'bg-white',
          accent: 'bg-slate-50',
          text: 'text-slate-900',
          border: 'border-slate-200',
          label: 'Lotería Nacional',
          seal: '🏛️',
        };
    }
  }, [drawType]);

  const displayNumbers = number ? number.split('') : ['?', '?', '?', '?', '?'];

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border-2 shadow-xl aspect-[1.8/1] flex flex-col",
      config.bg,
      config.border,
      className
    )}>
      {/* Patrón de fondo (Guilloche simulado) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <div className="absolute inset-0 flex flex-wrap gap-4 rotate-12 scale-150">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="w-12 h-12 border-2 border-current rounded-full" />
          ))}
        </div>
      </div>

      {/* Cabecera del décimo */}
      <div className={cn("px-4 py-2 flex items-center justify-between border-b border-dashed", config.accent)}>
        <div className="flex items-center gap-2">
          <Landmark className={cn("w-4 h-4", config.text)} />
          <span className={cn("text-[10px] font-black uppercase tracking-widest", config.text)}>
            Loterías y Apuestas del Estado
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className={cn("w-3 h-3", config.text, "opacity-60")} />
          <span className={cn("text-[8px] font-bold uppercase", config.text, "opacity-60")}>
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

        {/* Info Sorteo */}
        <div className="text-center mb-3">
          <p className={cn("text-[9px] font-black uppercase tracking-[0.2em]", config.text, "opacity-60")}>
            {drawLabel}
          </p>
          <p className={cn("text-xs font-black", config.text)}>
            {formatDate(drawDate)}
          </p>
        </div>

        {/* NÚMERO */}
        <div className="flex gap-1.5 justify-center relative z-10">
          {displayNumbers.map((digit, i) => (
            <motion.div
              key={i}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "w-10 h-14 rounded-lg flex items-center justify-center text-3xl font-black shadow-inner border",
                config.text === 'text-white' ? 'bg-white/10 border-white/20' : 'bg-slate-100 border-slate-200'
              )}
            >
              {digit}
            </motion.div>
          ))}
        </div>

        {/* Serie / Fracción */}
        <div className="mt-4 flex gap-4">
          <div className="text-center">
            <p className={cn("text-[8px] font-bold uppercase tracking-tighter opacity-50", config.text)}>Serie</p>
            <p className={cn("text-xs font-black", config.text)}>1ª</p>
          </div>
          <div className="text-center">
            <p className={cn("text-[8px] font-bold uppercase tracking-tighter opacity-50", config.text)}>Fracción</p>
            <p className={cn("text-xs font-black", config.text)}>1ª</p>
          </div>
          <div className="text-center px-3 py-1 rounded-full border border-current/10 bg-current/5">
            <p className={cn("text-[7px] font-black uppercase tracking-tighter opacity-50", config.text)}>Precio</p>
            <p className={cn("text-[13px] font-black leading-none", config.text)}>{formatCurrency(price)}</p>
          </div>
        </div>
      </div>

      {/* Pie con banda de seguridad */}
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
    </div>
  );
};
