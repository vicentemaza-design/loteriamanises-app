import { Button } from '@/shared/ui/Button';
import { RefreshCircle, Spark, Trash } from 'iconoir-react/regular';

interface MulticolumnActionsProps {
  onClearColumn: () => void;
  onClearAll: () => void;
  onRandomColumn: () => void;
  onRandomAll: () => void;
  onRemoveColumn?: () => void;
  canRemoveColumn?: boolean;
  activeColor: string;
}

export function MulticolumnActions({
  onClearColumn,
  onClearAll,
  onRandomColumn,
  onRandomAll,
  onRemoveColumn,
  canRemoveColumn = false,
  activeColor,
}: MulticolumnActionsProps) {
  return (
    <div className="space-y-2">
      {/* Apuesta activa */}
      <div className="flex items-center justify-between">
        <h3 className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Apuesta actual</h3>
        <div className="flex gap-1.5">
          <Button
            variant="ghost" size="sm"
            className="h-7 rounded-lg font-bold text-[9px] uppercase tracking-widest text-slate-400 px-2"
            onClick={onClearColumn}
          >
            Limpiar
          </Button>
          {canRemoveColumn && onRemoveColumn && (
            <Button
              variant="ghost" size="sm"
              aria-label="Eliminar apuesta"
              className="h-7 rounded-lg font-bold text-[9px] uppercase tracking-widest text-rose-400 hover:bg-rose-50 px-2"
              onClick={onRemoveColumn}
            >
              <Trash className="w-3 h-3 mr-1" />
              Eliminar
            </Button>
          )}
          <Button
            variant="outline" size="sm"
            className="h-7 rounded-lg font-bold text-[9px] uppercase tracking-widest bg-slate-50 border-slate-200 px-2"
            style={{ color: activeColor }}
            onClick={onRandomColumn}
          >
            <Spark className="w-3 h-3 mr-1" />
            Aleatorio
          </Button>
        </div>
      </div>

      {/* Boleto completo */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <h3 className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Todo el boleto</h3>
        <div className="flex gap-1.5">
          <Button
            variant="ghost" size="sm"
            className="h-7 rounded-lg font-bold text-[9px] uppercase tracking-widest text-rose-500 hover:bg-rose-50 px-2"
            onClick={onClearAll}
          >
            Borrar todo
          </Button>
          <Button
            variant="outline" size="sm"
            className="h-7 rounded-lg font-bold text-[9px] uppercase tracking-widest text-white shadow-sm px-2"
            style={{ backgroundColor: activeColor, borderColor: activeColor }}
            onClick={onRandomAll}
          >
            <RefreshCircle className="w-3 h-3 mr-1" />
            Rellenar todo
          </Button>
        </div>
      </div>
    </div>
  );
}
