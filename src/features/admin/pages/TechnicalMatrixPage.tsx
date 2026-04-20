import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, ShieldCheck, Database, Award } from 'lucide-react';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { formatCurrency } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/Button';

export function TechnicalMatrixPage() {
  const navigate = useNavigate();
  const phase1Games = LOTTERY_GAMES.filter(g => g.productionPhase1);

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Matriz Técnica</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Producción · Fase 1</p>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-20">
        {/* Resumen de Estado */}
        <div className="bg-manises-blue rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-manises-gold/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-manises-gold" />
              <span className="text-xs font-black uppercase tracking-widest">Sincronización Activa</span>
            </div>
            <h2 className="text-2xl font-black mb-1 leading-tight">Fuente de Verdad Técnica</h2>
            <p className="text-white/60 text-sm font-medium">Validación de garantías, precios y lógica matemática de la Fase 1.</p>
          </div>
        </div>

        {/* Tabla de Juegos */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Configuración por Juego</h3>
          
          <div className="flex flex-col gap-3">
            {phase1Games.map(game => (
              <div key={game.id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg"
                      style={{ backgroundColor: game.color }}
                    >
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 leading-none mb-1">{game.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{game.technicalMode} · {game.systemFamily}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Fase 1 OK</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Precio Unitario</p>
                    <p className="text-sm font-black text-slate-900">{formatCurrency(game.price)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Garantía</p>
                    <p className="text-sm font-black text-slate-900">
                      {game.guaranteeType === 'direct_full_coverage' ? '100% Directa' : 'Condicional'}
                    </p>
                  </div>
                </div>

                {game.guaranteeCondition && (
                  <div className="mt-4 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <div className="flex gap-2">
                      <Award className="w-3.5 h-3.5 text-manises-gold shrink-0 mt-0.5" />
                      <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">
                        "{game.guaranteeCondition}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Aviso de Auditoría */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-900 uppercase tracking-tight mb-1">Protocolo de Verificación</p>
            <p className="text-[11px] text-amber-800/80 font-medium leading-relaxed">
              Esta matriz se genera dinámicamente a partir del sistema de tipos de la aplicación. Cualquier cambio en la configuración raíz se reflejará aquí automáticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
