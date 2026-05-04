import * as React from 'react';
import { cn, formatCurrency, formatDate } from '@/shared/lib/utils';
import { Landmark, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'motion/react';

import juevesTicket from '@/assets/images/loteria_jueves_ticket.jpg';
import sabadoTicket from '@/assets/images/loteria_sabado_ticket.jpg';

export type NationalDrawType = 'ordinary' | 'special' | 'navidad' | 'nino';

// ─────────────────────────────────────────────────────────────────────────────
// Ticket field placement — bounding-box model
//
// Both images: 530×290 px → ratio ≈ 1.827:1.
// Container: aspect-[1.8/1]. Each field is a box (top/left/width/height as %
// of the container). The value text is flex-centered inside the box.
// overflow:hidden prevents bleed.
//
// Measured from 530×290 source pixels:
//
//   JUEVES numberBox  — white strip below "S.E. LOTERÍAS" header:
//     x: 128–390 px → left: 24.2%, width: 49.4%
//     y:  22– 68 px → top:   7.6%, height: 15.9%
//   JUEVES serieBox   — SERIE circle, right column:
//     x: 390–530 px → left: 73.6%, width: 26.4%
//     y:  90–132 px → top:  31.0%, height: 14.5%
//   JUEVES fraccionBox — FRACCIÓN circle, right column:
//     x: 390–530 px → left: 73.6%, width: 26.4%
//     y: 140–183 px → top:  48.3%, height: 14.8%
//
//   SÁBADO numberBox  — upper white zone (before "LOTERÍA NACIONAL" text):
//     x: 145–385 px → left: 27.4%, width: 45.3%
//     y:  18– 65 px → top:   6.2%, height: 16.2%
//   SÁBADO serieBox   — SERIE circle, right column:
//     x: 385–530 px → left: 72.6%, width: 27.4%
//     y:  95–140 px → top:  32.8%, height: 15.5%
//   SÁBADO fraccionBox — FRACCIÓN circle, right column:
//     x: 385–530 px → left: 72.6%, width: 27.4%
//     y: 150–198 px → top:  51.7%, height: 16.6%
//
// Font-size calibration (Jueves numberBox, 390px viewport):
//   Container h ≈ 390/1.8 = 217px; box h = 15.9% × 217 = 34.5px
//   NUMBER_SIZE clamp(20px, 7.5vw, 38px) → at 390px: 29.3px → 84.9% of box h ✓
//   FIELD_SIZE  clamp(13px, 4.0vw, 20px) → at 390px: 15.6px → 49.5% of circle h ✓
// ─────────────────────────────────────────────────────────────────────────────

interface TicketFieldBox {
  top: string;
  left: string;
  width: string;
  height: string;
}

interface TicketFieldConfig {
  numberBox: TicketFieldBox;
  serieBox: TicketFieldBox;
  fraccionBox: TicketFieldBox;
}

const MONO = '"Courier New", Courier, monospace';
const INK = '#111827';
// Fills ~71% of white-zone width at 390px: 5×(0.6+0.12)×35.1px = 126px / 178px ≈ 71%
const NUMBER_SIZE = 'clamp(26px, 9vw, 46px)';
const FIELD_SIZE = 'clamp(13px, 4.0vw, 20px)';

const TICKET_FIELD_PLACEMENT: Record<string, TicketFieldConfig> = {
  sabado: {
    numberBox:   { top: '6.2%',  left: '27.4%', width: '45.3%', height: '16.2%' },
    serieBox:    { top: '32.8%', left: '72.6%', width: '27.4%', height: '15.5%' },
    fraccionBox: { top: '51.7%', left: '72.6%', width: '27.4%', height: '16.6%' },
  },
  jueves: {
    // top shifted to 9% (was 7.6%) to clear "S.E. LOTERÍAS" header text
    numberBox:   { top: '9%',    left: '24.2%', width: '49.4%', height: '15.9%' },
    serieBox:    { top: '31.0%', left: '73.6%', width: '26.4%', height: '14.5%' },
    fraccionBox: { top: '48.3%', left: '73.6%', width: '26.4%', height: '14.8%' },
  },
};

// ─────────────────────────────────────────────────────────────────────────────

interface NationalTicketVisualProps {
  number: string | null;
  /** Serie del décimo seleccionado. Fluye desde NationalShowcaseItem → NationalCartLine. */
  serie?: string;
  /** Fracción del décimo seleccionado. Fluye desde NationalShowcaseItem → NationalCartLine. */
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
  serie,
  fraccion,
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
          bg: 'bg-[#991b1b]', accent: 'bg-[#7f1d1d]',
          text: 'text-white', border: 'border-[#450a0a]',
          label: 'Sorteo de Navidad', seal: '🎄',
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

      {/* ── Header — only for non-real-image tickets (navidad, niño, especial).
            For Jueves/Sábado the image already prints the S.E. LOTERÍAS header;
            showing our JSX header on top would overlap the image's number strip. ── */}
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

      {/* ── Tiny demo badge for real images (bottom-right, unobtrusive) ── */}
      {config.realImage && (
        <span className="absolute bottom-1 right-2 z-30 text-[7px] font-bold uppercase tracking-wider text-slate-400/40 pointer-events-none select-none">
          demo
        </span>
      )}

      {/* ── Field overlays — bounding-box model (Jueves / Sábado) ── */}
      {fieldConfig && (
        <>
          {/* NUMBER — flex-centered inside the white strip box */}
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
                fontSize: NUMBER_SIZE,
                fontWeight: 900,
                fontFamily: MONO,
                letterSpacing: '0.12em',
                lineHeight: 1,
                color: isPlaceholder ? `${INK}1a` : INK,
              }}
            >
              {displayNumber}
            </span>
          </motion.div>

          {/* SERIE — flex-centered inside SERIE circle box */}
          <div
            className="absolute z-20 pointer-events-none overflow-hidden flex items-center justify-center"
            style={{
              top: fieldConfig.serieBox.top,
              left: fieldConfig.serieBox.left,
              width: fieldConfig.serieBox.width,
              height: fieldConfig.serieBox.height,
            }}
          >
            <span
              style={{
                display: 'block',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                fontSize: FIELD_SIZE,
                fontWeight: 800,
                fontFamily: MONO,
                letterSpacing: '0.04em',
                lineHeight: 1,
                color: serie ? INK : `${INK}30`,
              }}
            >
              {serie ?? '—'}
            </span>
          </div>

          {/* FRACCIÓN — flex-centered inside FRACCIÓN circle box */}
          <div
            className="absolute z-20 pointer-events-none overflow-hidden flex items-center justify-center"
            style={{
              top: fieldConfig.fraccionBox.top,
              left: fieldConfig.fraccionBox.left,
              width: fieldConfig.fraccionBox.width,
              height: fieldConfig.fraccionBox.height,
            }}
          >
            <span
              style={{
                display: 'block',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                fontSize: FIELD_SIZE,
                fontWeight: 800,
                fontFamily: MONO,
                letterSpacing: '0.04em',
                lineHeight: 1,
                color: fraccion ? INK : `${INK}30`,
              }}
            >
              {fraccion ?? '—'}
            </span>
          </div>
        </>
      )}

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
              <p className={cn('text-[7px] font-black uppercase tracking-widest opacity-40', config.text)}>Serie</p>
              <p className={cn('text-xs font-black', config.text)}>{serie ?? '—'}</p>
            </div>
            <div className="h-4 w-[1px] bg-current/10" />
            <div className="text-center">
              <p className={cn('text-[7px] font-black uppercase tracking-widest opacity-40', config.text)}>Fracción</p>
              <p className={cn('text-xs font-black', config.text)}>{fraccion ?? '—'}</p>
            </div>
            <div className="h-4 w-[1px] bg-current/10" />
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
