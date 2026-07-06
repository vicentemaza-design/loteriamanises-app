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
  const ballSize = large ? 'h-9 w-9' : 'h-7 w-7';
  const ballText = large ? 'text-[13px] font-black' : 'text-[11px] font-bold';
  const ballGap = large ? 'gap-2' : 'gap-1.5';
  const starSize = large ? 'h-9 w-9' : 'h-7 w-7';
  const starText = large ? 'text-[12px] font-black' : 'text-[10px] font-bold';

  return (
    <div className={cn('flex flex-wrap', large ? 'gap-2' : 'gap-2')}>
      <div className={cn('flex flex-wrap', ballGap)}>
        {numbers.map((n) => (
          <div
            key={n}
            className={cn(
              'flex items-center justify-center rounded-full border transition-all',
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
      </div>
      {stars && stars.length > 0 && (
        <div className={cn('flex flex-wrap border-l border-slate-100 pl-2.5', ballGap)}>
          {stars.map((s) => (
            <div
              key={s}
              className={cn(
                'relative flex items-center justify-center transition-all',
                starSize,
                starText,
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
