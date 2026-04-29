import { InfoCircle, CheckCircle } from 'iconoir-react/regular';
import { motion } from 'motion/react';
import { cn } from '@/shared/lib/utils';

interface ReducedModeSummaryProps {
  hasSelection: boolean;
  minNumbers: number;
  maxNumbers: number;
  currentNumbers: number;
  supportedNumbers: number[];
}

export function ReducedModeSummary({
  hasSelection,
  minNumbers,
  maxNumbers,
  currentNumbers,
  supportedNumbers,
}: ReducedModeSummaryProps) {
  const isOutOfRange = currentNumbers > 0 && (currentNumbers < minNumbers || currentNumbers > maxNumbers);
  const isValid = currentNumbers >= minNumbers && currentNumbers <= maxNumbers && supportedNumbers.includes(currentNumbers);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border p-4 shadow-sm transition-colors",
        isValid ? "border-emerald-100 bg-emerald-50/50" : "border-manises-blue/10 bg-slate-50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
          isValid ? "bg-emerald-100 text-emerald-600" : "bg-manises-blue/5 text-manises-blue"
        )}>
          {isValid ? <CheckCircle className="h-5 w-5" /> : <InfoCircle className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              isValid ? "text-emerald-700" : "text-manises-blue"
            )}>
              {isValid ? 'Configuración válida' : 'Instrucciones: Reducida Demo'}
            </h4>
            <span className="text-[10px] font-black text-slate-400">
              {currentNumbers} / {maxNumbers}
            </span>
          </div>

          <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
            {!hasSelection ? (
              <>Selecciona entre <span className="font-black text-manises-blue">{minNumbers} y {maxNumbers} números</span> para habilitar las tablas reducidas demo.</>
            ) : isOutOfRange ? (
              <span className="text-amber-700">
                Tu selección ({currentNumbers}) está fuera del rango permitido para reducidas ({minNumbers}-{maxNumbers}).
              </span>
            ) : !isValid ? (
              <>Te faltan <span className="font-bold text-manises-blue">{minNumbers - currentNumbers} números</span> para alcanzar el mínimo del sistema.</>
            ) : (
              <span className="text-emerald-700">
                Tu pronóstico de {currentNumbers} números es compatible. Selecciona una tabla para optimizar tu jugada.
              </span>
            )}
          </p>
          
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/50">
            <motion.div 
              className={cn(
                "h-full rounded-full transition-all",
                isValid ? "bg-emerald-500" : "bg-manises-blue"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((currentNumbers / maxNumbers) * 100, 100)}%` }}
            />
          </div>

          <p className="mt-3 text-[10px] font-bold text-slate-400 italic">
            * Simulación demo sin valor contractual.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
