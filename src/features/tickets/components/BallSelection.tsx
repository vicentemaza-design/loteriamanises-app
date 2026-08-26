import { cn } from '@/shared/lib/utils';

interface BallSelectionProps {
  numbers: number[];
  stars?: number[];
  matchedNumbers?: number[];
  matchedStars?: number[];
  type?: string;
  large?: boolean;
  medium?: boolean;
  compact?: boolean;
}

export function BallSelection({
  numbers,
  stars,
  matchedNumbers = [],
  matchedStars = [],
  type,
  large = false,
  medium = false,
  compact = false,
}: BallSelectionProps) {
  const isGordo  = type === 'gordo';
  const isDream  = type === 'eurodreams';
  const isPrimitiva = type === 'primitiva';
  // Cualquier juego con "número especial" (estrellas/sueño — Gordo no entra
  // aquí: su Clave se muestra como texto fuera de esta fila, ver
  // TicketDetailPage) necesita más ancho que una fila de solo números. La
  // fila vive dentro de una tarjeta que también reserva sitio para el índice
  // de apuesta ("1", "2"...), así que el ancho real disponible es bastante
  // menor de lo que parece a simple vista — medido con
  // `.overflow-x-auto`.scrollWidth/clientWidth, no con el viewport de página.
  // Euromillones (5 números + 2 estrellas) y EuroDreams (6 números + sueño)
  // necesitan tres escalones de tamaño (no solo uno por debajo de 375px) para
  // caber sin ocultar ningún valor en 320/375/390/430.
  const hasSpecial = !isGordo && !!stars && stars.length > 0;
  const narrowSpecial = large && hasSpecial && !isPrimitiva && !isDream;
  // Primitiva en "large" es la fila más ancha de todas: 6 números + badge de
  // reintegro (Euromillones reparte solo 5 números + 2 estrellas en el mismo
  // hueco). Un escalón menos de tamaño en las bolas de número (mismo tamaño
  // que "medium") es suficiente a partir de 375px; por debajo (320px, el
  // ancho de tarjeta ya es más estrecho) hace falta un escalón más para que
  // la fila quepa entera sin recortar el badge de reintegro al final.
  const ballSize  = large
    ? (isPrimitiva ? 'h-7 w-7 min-[375px]:h-8 min-[375px]:w-8'
      : isDream ? 'h-6 w-6 min-[375px]:h-7 min-[375px]:w-7 min-[430px]:h-9 min-[430px]:w-9'
      : narrowSpecial ? 'h-6 w-6 min-[375px]:h-8 min-[375px]:w-8 min-[430px]:h-9 min-[430px]:w-9'
      : 'h-9 w-9')
    : medium ? 'h-8 w-8' : compact ? 'h-[22px] w-[22px]' : 'h-7 w-7';
  const ballText  = large
    ? (isPrimitiva ? 'text-[11px] font-black min-[375px]:text-[12px]'
      : isDream ? 'text-[9px] font-black min-[375px]:text-[10px] min-[430px]:text-[13px]'
      : narrowSpecial ? 'text-[9px] font-black min-[375px]:text-[11px] min-[430px]:text-[13px]'
      : 'text-[13px] font-black')
    : medium ? 'text-[12px] font-bold' : compact ? 'text-[10px] font-extrabold' : 'text-[11px] font-bold';
  const gap       = large ? 'gap-2' : medium ? 'gap-1.5' : compact ? 'gap-1' : 'gap-1.5';
  // Bola del "número especial" (estrella/sueño): mismo criterio de tres
  // escalones, calculado para caber junto al icono decorativo y el resto de
  // números en el ancho real medido de cada franja.
  const specialBallSize = isDream && large
    ? 'h-6 w-6 min-[375px]:h-7 min-[375px]:w-7 min-[430px]:h-8 min-[430px]:w-8'
    : narrowSpecial ? 'h-6 w-6 min-[375px]:h-8 min-[375px]:w-8 min-[430px]:h-9 min-[430px]:w-9' : ballSize;
  const specialBallText = isDream && large
    ? 'text-[9px] font-black min-[375px]:text-[10px] min-[430px]:text-[12px]'
    : narrowSpecial ? 'text-[9px] font-black min-[375px]:text-[11px] min-[430px]:text-[13px]' : ballText;
  // Mismo caso: un poco menos de separación entre elementos (no su tamaño)
  // para que la fila entera respire sin recortarse. Primitiva (large) tiene
  // el mismo problema de sitio: 6 números + badge de reintegro es la fila
  // más ancha de todas (Euromillones reparte solo 5 números + 2 estrellas y
  // EuroDreams 6 números + 1 sueño en el mismo hueco).
  const rowGap = isPrimitiva && large ? 'gap-0 min-[375px]:gap-0.5'
    : isDream && large ? 'gap-0.5 min-[375px]:gap-1'
    : narrowSpecial ? 'gap-0.5 min-[375px]:gap-1 min-[430px]:gap-1.5'
    : gap;

  return (
    <div className={cn('flex items-center', rowGap, 'overflow-x-auto')}>
      {/* ── Números ─────────────────────────────────────────────── */}
      {numbers.map((n, i) => (
        <div
          key={`n-${i}`}
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full border transition-all',
            ballSize,
            ballText,
            matchedNumbers.includes(n)
              ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'border-slate-200 bg-white text-slate-600'
          )}
        >
          {n}
        </div>
      ))}

      {/* Reintegro (Primitiva): a diferencia de estrellas/sueño/clave, no es
          un "número especial" temático — es una única cifra de referencia.
          Antes cae por defecto en la rama de estrella dorada (pensada para
          Euromillones): icono + bola grande adicionales que la fila de 390px
          no tiene sitio para acomodar junto a los 6 números, recortando el
          valor. Badge compacto, igual de ancho lo necesite el propio texto. */}
      {isPrimitiva && stars && stars.length > 0 && (
        <div className={cn(
          'flex shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 font-black text-slate-600',
          large ? 'h-7 px-0.5 text-[11px] min-[375px]:h-8 min-[375px]:px-1 min-[375px]:text-[12px]' : medium ? 'h-8 px-1.5 text-[11px]' : compact ? 'h-[22px] px-1 text-[9px]' : 'h-7 px-1.5 text-[10px]'
        )}>
          R:{stars[0]}
        </div>
      )}

      {/* ── Separador + número especial (Euromillones estrellas / EuroDreams sueño / El Gordo) ── */}
      {!isPrimitiva && stars && stars.length > 0 && (
        <>
          {/* Icono separador según juego */}
          <div className="flex shrink-0 items-center justify-center">
            {isGordo ? (
              <div className={cn(
                'flex shrink-0 items-center justify-center rounded-md border',
                large ? 'h-9 w-9' : medium ? 'h-7 w-7' : compact ? 'h-[18px] w-[18px]' : 'h-6 w-6',
                'border-amber-200 bg-amber-50',
              )}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={large ? 'h-5 w-5' : medium ? 'h-4 w-4' : compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
              </div>
            ) : isDream ? (
              /* Nube violeta para EuroDreams — un punto más pequeña en
                 "large" para que quepa junto a la bola del sueño sin
                 apretarse (ver specialBallSize más arriba); un escalón más
                 por debajo de 375px, igual que el resto de la fila. */
              <svg viewBox="0 0 24 24" fill="#7c3aed" opacity="0.25"
                className={large ? 'h-5 w-5 min-[375px]:h-6 min-[375px]:w-6 min-[430px]:h-7 min-[430px]:w-7' : medium ? 'h-7 w-7' : compact ? 'h-4 w-4' : 'h-6 w-6'}>
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
              </svg>
            ) : (
              /* Estrella dorada para Euromillones — un escalón menos por
                 debajo de 375px, igual que las bolas de la fila. */
              <svg viewBox="0 0 24 24" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round"
                className={large ? 'h-5 w-5 min-[375px]:h-6 min-[375px]:w-6 min-[430px]:h-8 min-[430px]:w-8' : medium ? 'h-7 w-7' : compact ? 'h-4 w-4' : 'h-6 w-6'}>
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            )}
          </div>

          {/* Bola del número especial */}
          {stars.map((s, i) => (
            <div
              key={`s-${i}`}
              className={cn(
                'flex shrink-0 items-center justify-center rounded-full border transition-all',
                specialBallSize,
                specialBallText,
                isDream
                  ? matchedStars.includes(s)
                    ? 'border-violet-600 bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                    : 'border-violet-300 bg-violet-50 text-violet-700'
                  : matchedStars.includes(s)
                    ? 'border-amber-500 bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                    : 'border-amber-300 bg-amber-50 text-amber-700'
              )}
            >
              {s}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
