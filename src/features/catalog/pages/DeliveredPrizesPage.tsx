import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Trophy, ShieldCheck } from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { formatCurrency } from '@/shared/lib/utils';
import {
  getDeliveredPrizeHighlights,
  getDeliveredPrizesTotalAmount,
  MOCK_DELIVERED_PRIZES,
} from '../data/delivered-prizes.mock';

export function DeliveredPrizesPage() {
  const navigate = useNavigate();
  const totalAmount = getDeliveredPrizesTotalAmount();
  const highlightedPrizes = getDeliveredPrizeHighlights(2);
  const yearsCovered = new Set(MOCK_DELIVERED_PRIZES.map((prize) => prize.year)).size;

  return (
    <div className="flex min-h-full flex-col bg-background pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md flex items-center gap-4 px-4 h-14 border-b border-gray-100">
        <PremiumTouchInteraction scale={0.92}>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center -ml-1 text-manises-blue/80 hover:bg-muted transition-all"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </PremiumTouchInteraction>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-manises-blue leading-none">
            Premios entregados
          </h1>
          <p className="text-[10px] font-medium text-muted-foreground mt-0.5 uppercase tracking-widest opacity-60">
            Contenido informativo demo
          </p>
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-5">
        <div className="rounded-[1.9rem] bg-[linear-gradient(135deg,#0a4792_0%,#133b73_62%,#1f2937_100%)] text-white p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
              Premios destacados
            </p>
            <p className="text-3xl font-black tracking-tight mt-1">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-[10px] font-semibold opacity-50 mt-1">
              {MOCK_DELIVERED_PRIZES.length} registros demo · {yearsCovered} campañas
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-manises-gold" />
          </div>
        </div>

        <section className="space-y-3">
          <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest px-1">
            Resumen visible en home
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {highlightedPrizes.map((prize) => (
              <div key={prize.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                      {prize.highlightLabel}
                    </p>
                    <h2 className="mt-1 truncate text-[15px] font-black text-manises-blue">
                      {prize.game}
                    </h2>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-manises-gold/10">
                    <Sparkles className="h-4.5 w-4.5 text-manises-gold" />
                  </div>
                </div>
                <p className="mt-3 text-[12px] font-black text-emerald-600">
                  {formatCurrency(prize.amount)}
                </p>
                <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-500">
                  {prize.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest px-1">
            Historial visible
          </p>
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border/50">
            {MOCK_DELIVERED_PRIZES.map((prize) => (
              <div key={prize.id} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-manises-gold/10 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-manises-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-manises-blue truncate">{prize.game}</p>
                  <p className="text-[10px] text-muted-foreground font-medium line-clamp-2">
                    {prize.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-emerald-600 tabular-nums">
                    {formatCurrency(prize.amount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{prize.year}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-2xl border border-border p-4 flex gap-3 bg-slate-50">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
            Este módulo muestra contenido informativo demo y premios destacados para pruebas de UX. Los importes y descripciones se usan solo como apoyo visual y siguen pendientes de integración dinámica.
          </p>
        </div>
      </div>
    </div>
  );
}
