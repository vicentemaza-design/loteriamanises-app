import { cn } from '@/shared/lib/utils';

interface BallSelectionProps {
  numbers: number[];
  stars?: number[];
  matchedNumbers?: number[];
  matchedStars?: number[];
  type?: string;
  large?: boolean;
}

export function BallSelection({
  numbers,
  stars,
  matchedNumbers = [],
  matchedStars = [],
  type,
  large = false,
}: BallSelectionProps) {
  const isGordo = type === 'gordo';
  const ballSize  = large ? 'h-9 w-9'   : 'h-7 w-7';
  const ballText  = large ? 'text-[13px] font-black' : 'text-[11px] font-bold';
  const gap       = large ? 'gap-2'     : 'gap-1.5';

  return (
    <div className={cn('flex items-center', gap, 'overflow-x-auto')}>
      {/* ── Números ─────────────────────────────────────────────── */}
      {numbers.map((n) => (
        <div
          key={n}
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

      {/* ── Separador + estrellas (Euromillones / El Gordo) ─────── */}
      {stars && stars.length > 0 && (
        <>
          {/* Icono estrella separador */}
          <div className="flex shrink-0 items-center justify-center">
            {isGordo ? (
              <div className={cn(
                'flex shrink-0 items-center justify-center rounded-md border',
                large ? 'h-9 w-9' : 'h-6 w-6',
                'border-amber-200 bg-amber-50',
              )}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={large ? 'h-5 w-5' : 'h-3.5 w-3.5'}
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
              </div>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="#fef3c7"
                stroke="#d97706"
                strokeWidth="1.5"
                strokeLinejoin="round"
                className={large ? 'h-8 w-8' : 'h-6 w-6'}
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            )}
          </div>

          {/* Números de estrellas — círculos ámbar */}
          {stars.map((s) => (
            <div
              key={s}
              className={cn(
                'flex shrink-0 items-center justify-center rounded-full border transition-all',
                ballSize,
                ballText,
                matchedStars.includes(s)
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
