import { cn } from '@/shared/lib/utils';

interface BallSelectionProps {
  numbers: number[];
  stars?: number[];
  matchedNumbers?: number[];
  matchedStars?: number[];
  type?: string;
}

/**
 * Visualización de bolas y aciertos para juegos de azar.
 */
export function BallSelection({
  numbers,
  stars,
  matchedNumbers = [],
  matchedStars = [],
  type,
}: BallSelectionProps) {
  const isGordo = type === 'gordo';

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex flex-wrap gap-1.5">
        {numbers.map((n) => (
          <div
            key={n}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold transition-all',
              matchedNumbers.includes(n)
                ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'border-slate-200 bg-white text-slate-600'
            )}
          >
            {n}
          </div>
        ))}
      </div>
      {stars && stars.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-l border-slate-100 pl-2">
          {stars.map((s) => (
            <div
              key={s}
              className={cn(
                'relative flex h-7 w-7 items-center justify-center text-[10px] font-bold transition-all',
                isGordo ? 'rounded-lg border' : 'star-shape',
                matchedStars.includes(s)
                  ? isGordo
                    ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                    : 'text-white drop-shadow-md'
                  : isGordo
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'text-amber-500'
              )}
              style={
                !isGordo && matchedStars.includes(s)
                  ? {
                      clipPath:
                        'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                      backgroundColor: '#f59e0b',
                    }
                  : !isGordo
                    ? {
                        clipPath:
                          'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                        backgroundColor: '#fef3c7',
                      }
                    : {}
              }
            >
              <span className="relative z-10">{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
