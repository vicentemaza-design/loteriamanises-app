import { ArrowRight, BadgeCheck, Hash, Package2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { GameBadge } from '@/shared/ui/GameBadge';
import type { CompanyCollectiveDemo } from '../data/company-demo.mock';

interface CompanyFeaturedProductProps {
  company: CompanyCollectiveDemo;
  selectedQuantity: number;
  onSelectQuantity: (quantity: number) => void;
  onParticipateDemo: () => void;
  onOpenGame: () => void;
}

export function CompanyFeaturedProduct({
  company,
  selectedQuantity,
  onSelectQuantity,
  onParticipateDemo,
  onOpenGame,
}: CompanyFeaturedProductProps) {
  const featuredGame = LOTTERY_GAMES.find((game) => game.id === company.featuredProduct.gameId);

  return (
    <section className="overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-center gap-3">
          {featuredGame ? (
            <GameBadge game={featuredGame} size="sm" className="shadow-none" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-manises-blue/8 text-manises-blue">
              <Package2 className="h-5 w-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
              Producto destacado
            </p>
            <h2 className="mt-1 text-[1rem] font-black leading-tight tracking-tight text-manises-blue">
              {company.featuredProduct.productName}
            </h2>
            <p className="mt-1 text-[12px] font-medium text-slate-500">
              {company.featuredProduct.drawLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {company.featuredProduct.protagonistNumber ? (
            <div className="rounded-2xl border border-manises-blue/10 bg-manises-blue/[0.03] p-3">
              <div className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-manises-blue/55" />
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Número protagonista
                </p>
              </div>
              <p className="mt-2 font-mono text-[1.2rem] font-black tracking-[0.2em] text-manises-blue">
                {company.featuredProduct.protagonistNumber}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                Juego protagonista
              </p>
              <p className="mt-2 text-[13px] font-black text-manises-blue">
                {company.featuredProduct.productShortLabel}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-manises-blue/55" />
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                Entrega
              </p>
            </div>
            <p className="mt-2 text-[13px] font-black leading-tight text-manises-blue">
              {company.featuredProduct.deliveryLabel ?? 'Acceso colectivo demo'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
            Cantidad
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {company.featuredProduct.quantityOptions.map((quantity) => {
              const isActive = quantity === selectedQuantity;
              return (
                <button
                  key={quantity}
                  type="button"
                  onClick={() => onSelectQuantity(quantity)}
                  className={[
                    'min-w-[48px] rounded-xl border px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition-all',
                    isActive
                      ? 'border-manises-blue bg-manises-blue text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
                  ].join(' ')}
                >
                  x{quantity}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-800">
            Demo · participación pendiente de integración
          </p>
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-emerald-700">
            {company.featuredProduct.note}
          </p>
          <p className="mt-2 text-[11px] font-medium leading-relaxed text-emerald-700">
            No se realizará ninguna compra{' '}
            <span className="font-black">real</span>.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onParticipateDemo}
            className="h-11 flex-1 rounded-2xl bg-manises-blue text-[10px] font-black uppercase tracking-[0.14em] text-white"
          >
            Participar demo
          </Button>
          <Button
            variant="outline"
            onClick={onOpenGame}
            className="h-11 rounded-2xl border-slate-200 px-4 text-[10px] font-black uppercase tracking-[0.12em] text-manises-blue"
          >
            Ver juego
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
