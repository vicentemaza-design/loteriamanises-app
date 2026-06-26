import * as React from 'react';
import { cn, formatCurrency, formatDate } from '@/shared/lib/utils';
import { Landmark, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'motion/react';

import juevesTicket from '@/assets/images/loteria_jueves_ticket.jpg';
import sabadoTicket from '@/assets/images/loteria_sabado_ticket.jpg';
import navidadTicket from '@/assets/images/img2.rtve.jpg';

export type NationalDrawType = 'ordinary' | 'special' | 'navidad' | 'nino';

// ─────────────────────────────────────────────────────────────────────────────
// Ticket field placement — bounding-box model
//
// Both images: 530×290 px → ratio ≈ 1.827:1.
// Container: aspect-[1.8/1]. Each field is % of container dimensions.
//
// JUEVES numberBox — white strip to the RIGHT of the "JUEVES" label.
//   The green "JUEVES" block takes ~27% of width; number starts after it.
//   left: 32%, width: 38% → centered in the white zone (32%–70%)
//   top: 11%, height: 14% → vertically within the header band
//
// SÁBADO numberBox — upper white zone (slightly left of JUEVES due to layout):
//   left: 30%, width: 38%
//   top:  8%, height: 14%
//
// Font calibration (390px viewport, Jueves):
//   Box h = 14% × 216.7px = 30.3px
//   NUMBER_SIZE clamp(18px, 7vw, 32px) → at 390px: 27.3px → 90% of box h ✓
//   Fill: 5 × (0.6 + 0.18) × 27.3px = 5 × 21.3px = 106.5px / (38%×390=148px) ≈ 72% ✓
//
// Serie/Fracción: removed from circle overlays.
//   Now rendered as a compact gradient band at the bottom of the ticket.
// ─────────────────────────────────────────────────────────────────────────────

interface TicketFieldBox {
  top: string;
  left: string;
  width: string;
  height: string;
}

interface TicketFieldConfig {
  numberBox: TicketFieldBox;
  numberSize?: string;
  numberLetterSpacing?: string;
}

const MONO = '"Courier New", Courier, monospace';
const INK = '#111827';
const NUMBER_SIZE = 'clamp(20px, 7.5vw, 34px)';

const TICKET_FIELD_PLACEMENT: Record<string, TicketFieldConfig> = {
  sabado: {
    numberBox: { top: '10%', left: '32%', width: '38%', height: '15%' },
  },
  jueves: {
    numberBox: { top: '13%', left: '34%', width: '38%', height: '15%' },
  },
  navidad: {
    numberBox: { top: '7%', left: '37%', width: '38%', height: '16%' },
    numberSize: 'clamp(18px, 6.4vw, 30px)',
    numberLetterSpacing: '0.12em',
  },
};

// ─────────────────────────────────────────────────────────────────────────────

interface NationalTicketVisualProps {
  number: string | null;
  /** Serie del décimo seleccionado. */
  serie?: string;
  /** Fracción del décimo seleccionado. */
  fraccion?: string;
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
  const config = React.useMemo(() => {
    switch (drawType) {
      case 'navidad':
        return {
          bg: 'bg-white', accent: 'bg-slate-50',
          text: 'text-slate-900', border: 'border-slate-200',
          label: 'Sorteo de Navidad', seal: '🎄',
          realImage: navidadTicket,
        };
      case 'nino':
        return {
          bg: 'bg-[#1e40af]', accent: 'bg-[#1e3a8a]',
          text: 'text-white', border: 'border-[#172554]',
          label: 'Sorteo del Niño', seal: '👶',
        };
      case 'special':
        return {
          bg: 'bg-[#065f46]', accent: 'bg-[#064e3b]',
          text: 'text-white', border: 'border-[#022c22]',
          label: 'Sorteo Especial', seal: '✨',
        };
      default: {
        const isJueves = gameId === 'loteria-nacional-jueves';
        const isSabado = gameId === 'loteria-nacional-sabado';
        return {
          bg: 'bg-white', accent: 'bg-slate-50',
          text: 'text-slate-900', border: 'border-slate-200',
          label: 'Lotería Nacional', seal: '🏛️',
          realImage: isJueves ? juevesTicket : isSabado ? sabadoTicket : undefined,
        };
      }
    }
  }, [drawType, gameId]);

  const templateKey =
    gameId === 'loteria-nacional-jueves' ? 'jueves'
    : gameId === 'loteria-nacional-sabado' ? 'sabado'
    : drawType === 'navidad' ? 'navidad'
    : null;

  const fieldConfig: TicketFieldConfig | null = config.realImage && templateKey
    ? (TICKET_FIELD_PLACEMENT[templateKey] ?? null)
    : null;

  const displayNumber = number ?? '?????';
  const isPlaceholder = !number;

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border-2 shadow-xl aspect-[1.8/1] flex flex-col',
      config.bg,
      config.border,
      className
    )}>

      {/* ── Base image (Jueves / Sábado) ── */}
      {config.realImage && (
        <div className="absolute inset-0 z-0">
          <img
            src={config.realImage}
            alt="Décimo oficial"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* ── Decorative background for non-image tickets ── */}
      {!config.realImage && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
          <div className="absolute inset-0 flex flex-wrap gap-4 rotate-12 scale-150">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="w-12 h-12 border-2 border-current rounded-full" />
            ))}
          </div>
        </div>
      )}

      {/* ── Header — only for non-real-image tickets (navidad, niño, especial) ── */}
      {!config.realImage && (
        <div className={cn(
          'relative z-10 px-4 py-2 flex items-center justify-between border-b border-dashed',
          config.accent
        )}>
          <div className="flex items-center gap-2">
            <Landmark className={cn('w-4 h-4', config.text)} />
            <span className={cn('text-[10px] font-black uppercase tracking-widest', config.text)}>
              Loterías y Apuestas del Estado
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className={cn('w-3 h-3 opacity-60', config.text)} />
            <span className={cn('text-[8px] font-bold uppercase opacity-60', config.text)}>
              Validación demo
            </span>
          </div>
        </div>
      )}

      {/* ── Tiny demo badge for real images (top-right, unobtrusive) ── */}
      {config.realImage && (
        <span className="absolute top-1 right-2 z-30 text-[7px] font-bold uppercase tracking-wider text-slate-400/40 pointer-events-none select-none">
          demo
        </span>
      )}

      {/* ── NUMBER overlay — bounding-box model (Jueves / Sábado) ── */}
      {fieldConfig && (
        <motion.div
          key={displayNumber}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute z-20 pointer-events-none overflow-hidden flex items-center justify-center"
          style={{
            top: fieldConfig.numberBox.top,
            left: fieldConfig.numberBox.left,
            width: fieldConfig.numberBox.width,
            height: fieldConfig.numberBox.height,
          }}
        >
          <span
            style={{
              display: 'block',
              whiteSpace: 'nowrap',
              fontSize: fieldConfig.numberSize ?? NUMBER_SIZE,
              fontWeight: 900,
              fontFamily: MONO,
              letterSpacing: fieldConfig.numberLetterSpacing ?? '0.18em',
              lineHeight: 1,
              color: isPlaceholder ? `${INK}55` : INK,
            }}
          >
            {displayNumber}
          </span>
        </motion.div>
      )}

      {/* Serie / Fracción reserved for future certificate/receipt view — not shown in showcase */}

      {/* ── Body for non-real-image tickets (navidad, niño, especial) ── */}
      {!config.realImage && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-10 grayscale">
            {config.seal}
          </div>

          <div className="text-center mb-3">
            <p className={cn('text-[9px] font-black uppercase tracking-[0.2em] opacity-60', config.text)}>
              {drawLabel}
            </p>
            <p className={cn('text-xs font-black', config.text)}>
              {formatDate(drawDate)}
            </p>
          </div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="flex items-center justify-center px-6 py-4 rounded-[2rem] bg-white/10 border border-white/20">
              <div className="flex gap-3">
                {displayNumber.split('').map((digit, i) => (
                  <div key={i} className={cn('text-5xl font-black tracking-tighter', config.text)}>
                    {digit}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="mt-4 flex gap-4 items-center px-4 py-2 rounded-full bg-current/5">
            <div className="text-center">
              <p className={cn('text-[7px] font-black uppercase tracking-widest opacity-40', config.text)}>Precio</p>
              <p className={cn('text-xs font-black', config.text)}>{formatCurrency(price)}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer barcode band for non-image tickets ── */}
      {!config.realImage && (
        <div className={cn('px-4 py-1.5 border-t border-dashed flex items-center justify-between', config.accent)}>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div
                  key={i}
                  className={cn(
                    'w-1 h-3 rounded-full opacity-20',
                    config.text === 'text-white' ? 'bg-white' : 'bg-slate-900'
                  )}
                />
              ))}
            </div>
            <span className={cn('text-[9px] font-mono opacity-40', config.text)}>
              081980300001
            </span>
          </div>
          <Star className={cn(
            'w-3 h-3 animate-pulse',
            config.text === 'text-white' ? 'text-amber-400' : 'text-amber-500'
          )} />
        </div>
      )}
    </div>
  );
};
