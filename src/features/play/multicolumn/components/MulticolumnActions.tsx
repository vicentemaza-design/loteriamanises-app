import { RefreshCircle, Spark } from 'iconoir-react/regular';

interface MulticolumnActionsProps {
  onClearColumn: () => void;
  onRandomColumn: () => void;
  activeColor: string;
}

export function MulticolumnActions({
  onClearColumn,
  onRandomColumn,
  activeColor,
}: MulticolumnActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={onClearColumn}
        className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all active:scale-[0.97] hover:border-slate-300"
      >
        <RefreshCircle className="h-3.5 w-3.5" />
        Limpiar
      </button>
      <button
        type="button"
        onClick={onRandomColumn}
        className="flex items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all active:scale-[0.97]"
        style={{ backgroundColor: activeColor, borderColor: activeColor }}
      >
        <Spark className="h-3.5 w-3.5" />
        Aleatorio
      </button>
    </div>
  );
}
