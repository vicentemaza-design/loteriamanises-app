import { useNavigate } from 'react-router-dom';
import { ChevronRight, Newspaper } from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { OutletMark } from '../components/OutletMark';
import { getPressCoverage, formatPressDate } from '../data/press-coverage';

/**
 * Listado de "En los medios".
 *
 * Sin contenido propio: todo sale de data/press-coverage.ts. La primera
 * noticia va destacada en grande y el resto en tarjetas compactas, que es
 * como se comporta el resto de listados de la app.
 */
export function PressCoveragePage() {
  const navigate = useNavigate();
  const articles = getPressCoverage();
  const [featured, ...rest] = articles;

  return (
    <div className="min-h-screen bg-background pb-28">
      <ProfileSubHeader title="En los medios" subtitle="Prensa y televisión" />

      <div className="px-5 pt-5 space-y-5">
        {/* ── Entradilla ─────────────────────────────────────────── */}
        <header className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="bg-manises-blue/5 p-1.5 rounded-lg">
              <Newspaper className="w-4 h-4 text-manises-blue" />
            </div>
            <h2 className="text-xs font-extrabold text-manises-blue uppercase tracking-[0.16em]">
              Prensa y televisión
            </h2>
          </div>
          <h1 className="text-[22px] font-black leading-tight text-manises-blue">
            La suerte de Manises también es noticia
          </h1>
          <p className="text-[13px] font-medium leading-relaxed text-muted-foreground">
            Grandes medios nacionales llevan años contando nuestros premios y la historia de
            una administración que se ha convertido en una de las referencias de la Lotería
            de Navidad en España.
          </p>
        </header>

        {/* ── Noticia destacada ──────────────────────────────────── */}
        {featured && (
          <PremiumTouchInteraction scale={0.98}>
            <button
              type="button"
              onClick={() => navigate(`/profile/press/${featured.id}`)}
              className="w-full overflow-hidden rounded-[1.6rem] border border-slate-100 bg-white text-left shadow-[0_14px_36px_-16px_rgba(10,71,146,0.28)] transition-all"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={featured.image}
                  alt={featured.imageAlt}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <span className="absolute left-4 top-4 inline-flex items-center rounded-xl bg-white/95 px-3 py-1.5 shadow-sm">
                  <OutletMark outlet={featured.outlet} logo={featured.outletLogo} height={18} />
                </span>
              </div>

              <div className="space-y-2 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  {formatPressDate(featured.date)}
                </p>
                <h3 className="text-[16px] font-black leading-snug text-manises-blue">
                  {featured.headline}
                </h3>
                <p className="text-[12px] font-medium leading-relaxed text-muted-foreground">
                  {featured.standfirst}
                </p>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-manises-blue px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                  Ver noticia
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          </PremiumTouchInteraction>
        )}

        {/* ── Resto de noticias ──────────────────────────────────── */}
        <div className="space-y-2.5">
          {rest.map(article => (
            <PremiumTouchInteraction key={article.id} scale={0.985}>
              <button
                type="button"
                onClick={() => navigate(`/profile/press/${article.id}`)}
                className="flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-slate-100 bg-white p-2.5 text-left shadow-sm transition-all"
              >
                <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50/70 px-2">
                  <OutletMark outlet={article.outlet} logo={article.outletLogo} height={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    {formatPressDate(article.date)}
                  </p>
                  <h3 className="mt-0.5 line-clamp-2 text-[12.5px] font-black leading-snug text-manises-blue">
                    {article.headline}
                  </h3>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </button>
            </PremiumTouchInteraction>
          ))}
        </div>
      </div>
    </div>
  );
}
