import { cn } from '@/shared/lib/utils';

interface ReceiptQuinielaTableProps {
  picks: string[]; // ['1', 'X', '2', '1X', '12', 'X2', '1X2', ...]
  className?: string;
}

export function ReceiptQuinielaTable({ picks, className }: ReceiptQuinielaTableProps) {
  // Ensure we have 15 rows, even if picks are shorter
  const rows = Array.from({ length: 15 }, (_, i) => ({
    index: i + 1,
    pick: picks[i] || null,
  }));

  return (
    <div className={cn('overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      <table className="w-full text-[10px] font-mono leading-none">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="py-2 px-3 text-left font-black text-slate-400">#</th>
            <th className="py-2 px-3 text-left font-black text-slate-400">PARTIDO</th>
            <th className="py-2 px-3 text-center font-black text-slate-400">1</th>
            <th className="py-2 px-3 text-center font-black text-slate-400">X</th>
            <th className="py-2 px-3 text-center font-black text-slate-400">2</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.index} className="hover:bg-slate-50/50">
              <td className="py-2 px-3 text-slate-400 font-bold">{row.index}</td>
              <td className="py-2 px-3 text-manises-blue font-bold whitespace-nowrap">
                {row.index === 15 ? 'Pleno al 15' : `Partido ${row.index}`}
              </td>
              <td className="py-2 px-3 text-center">
                <div className={cn(
                  'mx-auto w-4 h-4 flex items-center justify-center rounded-sm border transition-colors',
                  row.pick?.includes('1') ? 'bg-slate-900 border-slate-900 text-white font-black' : 'border-slate-200 text-transparent'
                )}>
                  {row.pick?.includes('1') ? '1' : '.'}
                </div>
              </td>
              <td className="py-2 px-3 text-center">
                <div className={cn(
                  'mx-auto w-4 h-4 flex items-center justify-center rounded-sm border transition-colors',
                  row.pick?.includes('X') ? 'bg-slate-900 border-slate-900 text-white font-black' : 'border-slate-200 text-transparent'
                )}>
                  {row.pick?.includes('X') ? 'X' : '.'}
                </div>
              </td>
              <td className="py-2 px-3 text-center">
                <div className={cn(
                  'mx-auto w-4 h-4 flex items-center justify-center rounded-sm border transition-colors',
                  row.pick?.includes('2') ? 'bg-slate-900 border-slate-900 text-white font-black' : 'border-slate-200 text-transparent'
                )}>
                  {row.pick?.includes('2') ? '2' : '.'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
