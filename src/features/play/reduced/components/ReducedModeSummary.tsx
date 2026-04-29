import { InfoCircle } from 'iconoir-react/regular';
import { motion } from 'motion/react';

interface ReducedModeSummaryProps {
  hasSelection: boolean;
  minNumbers: number;
  currentNumbers: number;
}

export function ReducedModeSummary({
  hasSelection,
  minNumbers,
  currentNumbers,
}: ReducedModeSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-manises-blue/10 bg-slate-50 p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-manises-blue/5 text-manises-blue">
          <InfoCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-manises-blue">
            Modo Reducida Demo
          </h4>
          <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
            {!hasSelection ? (
              <>Primero elige al menos <span className="font-bold text-manises-blue">{minNumbers} números</span> para ver qué tablas reducidas demo son compatibles con tu selección.</>
            ) : currentNumbers < minNumbers ? (
              <>Te faltan <span className="font-bold text-manises-blue">{minNumbers - currentNumbers} números</span> para alcanzar el mínimo requerido por el sistema reducido.</>
            ) : (
              <>Selección compatible. Elige una de las tablas reducidas demo disponibles para optimizar tu jugada.</>
            )}
          </p>
          <p className="mt-2 text-[10px] font-bold text-slate-400 italic">
            * Las garantías son orientativas según simulación demo.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
