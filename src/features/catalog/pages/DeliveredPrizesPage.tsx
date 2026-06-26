import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Trophy } from 'lucide-react';
import adminFacade from '@/assets/images/administracion_manises.webp';
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
  const highlightedPrizes = getDeliveredPrizeHighlights(3);
  const [openYear, setOpenYear] = useState<number | null>(2024);

  const groupedByYear = useMemo(() => {
    return MOCK_DELIVERED_PRIZES.reduce<Record<number, typeof MOCK_DELIVERED_PRIZES>>((acc, prize) => {
      acc[prize.year] = acc[prize.year] ? [...acc[prize.year], prize] : [prize];
      return acc;
    }, {});
  }, []);

  const years = Object.keys(groupedByYear).map(Number).sort((left, right) => right - left);

  return (
    <div className="flex min-h-full flex-col bg-background pb-24">
      <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-100 bg-background/80 px-4 backdrop-blur-md">
        <PremiumTouchInteraction scale={0.92}>
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-manises-blue/80 transition-all hover:bg-muted"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </PremiumTouchInteraction>
        <div>
          <h1 className="text-sm font-bold leading-none tracking-tight text-manises-blue">Premios entregados</h1>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground opacity-60">Histórico visible</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4">
        <section className="overflow-hidden rounded-[1.8rem] border border-slate-100 bg-white shadow-sm">
          <img src={adminFacade} alt="Celebración en Lotería Manises" className="h-48 w-full object-cover" />
          <div className="p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Espacio histórico</p>
            <h2 className="mt-2 text-xl font-black text-manises-blue">Un lugar para mostrar los premios repartidos con más contexto y memoria visual</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
              Aquí reunimos campañas destacadas, premios memorables y una vista cronológica de entregas para reforzar la credibilidad de la administración.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[1.35rem] bg-manises-blue px-3 py-4 text-white shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/60">Premios</p>
            <p className="mt-2 text-xl font-black">{MOCK_DELIVERED_PRIZES.length}</p>
          </div>
          <div className="rounded-[1.35rem] border border-slate-100 bg-white px-3 py-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Importe</p>
            <p className="mt-2 text-lg font-black text-manises-blue">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="rounded-[1.35rem] border border-slate-100 bg-white px-3 py-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Campañas</p>
            <p className="mt-2 text-lg font-black text-manises-blue">{years.length}</p>
          </div>
        </div>

        <section className="space-y-3">
          <p className="px-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Destacados</p>
          <div className="space-y-3">
            {highlightedPrizes.map((prize) => (
              <div key={prize.id} className="rounded-[1.45rem] border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-manises-gold">{prize.highlightLabel}</p>
                    <h3 className="mt-2 text-lg font-black text-manises-blue">{prize.game}</h3>
                    <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">{prize.description}</p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-manises-gold/10 text-manises-gold">
                    <Sparkles className="h-4.5 w-4.5" />
                  </span>
                </div>
                <p className="mt-3 text-xl font-black text-emerald-600">{formatCurrency(prize.amount)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <p className="px-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Nuestro histórico</p>
          <div className="space-y-3">
            {years.map((year) => {
              const isOpen = openYear === year;
              const items = groupedByYear[year];
              return (
                <div key={year} className="overflow-hidden rounded-[1.45rem] border border-slate-100 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpenYear(isOpen ? null : year)}
                    className="flex w-full items-center justify-between px-4 py-4 text-left"
                  >
                    <div>
                      <p className="text-lg font-black text-manises-blue">{year}</p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">{items.length} premios visibles</p>
                    </div>
                    <Trophy className="h-4.5 w-4.5 text-manises-gold" />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 border-b border-slate-50 px-4 py-3 last:border-b-0">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-manises-gold/10 text-manises-gold">
                            <Trophy className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-manises-blue">{item.game}</p>
                            <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500">{item.description}</p>
                          </div>
                          <p className="text-sm font-black text-emerald-600">{formatCurrency(item.amount)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
