import { Button } from '@/shared/ui/Button';
import { RefreshCircle, Spark } from 'iconoir-react/regular';

interface MulticolumnActionsProps {
  onClearColumn: () => void;
  onClearAll: () => void;
  onRandomColumn: () => void;
  onRandomAll: () => void;
  activeColor: string;
}

/**
 * Acciones rápidas para el flujo multi-columna.
 * Permite gestionar la columna activa o el boleto completo.
 */
export function MulticolumnActions({
  onClearColumn,
  onClearAll,
  onRandomColumn,
  onRandomAll,
  activeColor,
}: MulticolumnActionsProps) {
  return (
    <div className="space-y-4">
      {/* Acciones Columna Activa */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
          Bloque actual
        </h3>
        <div className="flex gap-2">
          <Button
            variant="ghost" size="sm"
            className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest text-slate-400"
            onClick={onClearColumn}
          >
            Limpiar
          </Button>
          <Button
            variant="outline" size="sm"
            className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest bg-slate-50 border-slate-200"
            style={{ color: activeColor }}
            onClick={onRandomColumn}
          >
            <Spark className="w-3 h-3 mr-1" />
            Aleatorio
          </Button>
        </div>
      </div>

      {/* Acciones Globales */}
      <div className="flex items-center justify-between px-1 pt-2 border-t border-slate-100">
        <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
          Todo el boleto
        </h3>
        <div className="flex gap-2">
          <Button
            variant="ghost" size="sm"
            className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest text-rose-500 hover:bg-rose-50"
            onClick={onClearAll}
          >
            Borrar todo
          </Button>
          <Button
            variant="outline" size="sm"
            className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest text-white shadow-sm"
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
