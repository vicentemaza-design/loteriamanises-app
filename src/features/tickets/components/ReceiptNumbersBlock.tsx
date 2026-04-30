import { cn } from '@/shared/lib/utils';

interface ReceiptNumbersBlockProps {
  label: string;
  numbers: number[];
  variant?: 'circle' | 'square';
  className?: string;
}

export function ReceiptNumbersBlock({ 
  label, 
  numbers, 
  variant = 'square',
  className 
}: ReceiptNumbersBlockProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {numbers.map((n, i) => (
          <div 
            key={i}
            className={cn(
              'flex items-center justify-center font-mono font-bold text-sm border-2 border-slate-900 text-slate-900',
              variant === 'circle' ? 'w-8 h-8 rounded-full' : 'w-8 h-8 rounded-md'
            )}
          >
            {n.toString().padStart(2, '0')}
          </div>
        ))}
      </div>
    </div>
  );
}
