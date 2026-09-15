import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Newspaper, Radio, Tv } from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { OutletMark } from '../components/OutletMark';
import { getPressCoverage, formatPressDate, getPressStats } from '../data/press-coverage';

/**
 * Listado de "En los medios".
 *
 * Sigue el lenguaje visual de "Quiénes somos" y de las tarjetas
 * editoriales del inicio: hero que respira con desvanecido al fondo de
 * página, antetítulo de tracking amplio, firma manuscrita en oro, tira de
 * cifras y una pieza destacada con la imagen a sangre bajo degradado en
 * capas.
 *
 * Sin contenido propio: todo sale de data/press-coverage.ts.
 */
export function PressCoveragePage() {
  const navigate = useNavigate();
  const articles = getPressCoverage();
  const [featured, ...rest] = articles;
  const stats = getPressStats();

  return (
    <div className="flex min-h-full flex-col bg-[#f5f7fa] pb-20">
      <ProfileSubHeader title="En los medios" subtitle="Prensa y televisión" />

      {/* ── TITULAR ────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-1">
        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-manises-blue/40">
          Prensa y televisión
        </p>
        <h1 className="mt-1.5 text-[2rem] font-black leading-none text-manises-blue">
          Hablan de
        </h1>
        <p
          className="font-manuscript"
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1.15,
            color: '#F5C518',
            textShadow: '0 1px 8px rgba(245,197,24,0.18)',
          }}
        >
          la suerte de Manises
        </p>
        <p className="mt-3 text-[13px] font-medium leading-relaxed text-slate-500">
          Televisión, radio y prensa llevan años contando nuestros premios y la historia de una
          administración que se ha convertido en una de las referencias de la Lotería de Navidad
          en España. Aquí está recogido, con enlace a cada publicación original.
        </p>
      </div>

      {/* ── DESTACADA ──────────────────────────────────────────── */}
      {featured && (
        <div className="mx-4 mt-5">
          <PremiumTouchInteraction scale={0.985}>
            <button
              type="button"
              onClick={() => navigate(`/profile/press/${featured.id}`)}
              className="group relative w-full overflow-hidden rounded-[2rem] border border-indigo-400/20 text-left shadow-[0_18px_40px_-12px_rgba(0,0,0,0.32)] transition-all duration-500"
            >
              <div className="absolute inset-0 bg-manises-blue">
                {featured.image && (
                  <img
                    src={featured.image}
                    alt={featured.imageAlt ?? ''}
                    className="h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                  />
                )}
                <div
                  className={
                    featured.image
                      ? 'absolute inset-0 bg-[linear-gradient(135deg,rgba(10,71,146,0.97)_0%,rgba(8,63,132,0.88)_42%,rgba(10,71,146,0.42)_100%)]'
                      : 'absolute inset-0 bg-[linear-gradient(135deg,#062d6b_0%,#0a4792_52%,#0d56b0_100%)]'
                  }
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'radial-gradient(circle at 82% 18%, rgba(99,102,241,0.14) 0%, rgba(255,255,255,0) 45%)' }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_28%,rgba(255,255,255,0.02)_100%)]" />
              </div>

              <div className="relative flex min-h-[230px] flex-col justify-between p-4 xs:p-4.5 md:p-6 text-white">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex h-9 w-[5.5rem] items-center justify-center rounded-xl bg-white/95 px-2.5 py-1.5 shadow-inner">
                      <OutletMark outlet={featured.outlet} logo={featured.outletLogo} fallbackSize={11} />
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/55">
                      {formatPressDate(featured.date)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-[1.2rem] xs:text-[1.35rem] font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-sm line-clamp-3">
                      {featured.headline}
                    </h3>
                    <p className="text-[11px] font-medium leading-relaxed text-white/70 line-clamp-2">
                      {featured.standfirst}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-1">
                  <span className="inline-flex h-9 items-center gap-2 rounded-2xl bg-indigo-500 px-5 text-[12px] font-extrabold text-white shadow-lg transition-all active:scale-95">
                    Ver noticia
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </button>
          </PremiumTouchInteraction>
        </div>
      )}

      {/* ── CIFRAS ─────────────────────────────────────────────── */}
      <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
        {stats.map(stat => {
          const Icon = stat.icon === 'tv' ? Tv : stat.icon === 'radio' ? Radio : Newspaper;
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white px-1 py-3 text-center shadow-sm"
            >
              <Icon className="h-4 w-4 shrink-0" style={{ color: stat.color }} />
              <p className="mt-1 text-base font-black leading-none text-manises-blue">{stat.value}</p>
              <p className="mt-0.5 whitespace-pre-line text-[9px] font-bold leading-tight text-slate-500">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── HEMEROTECA ─────────────────────────────────────────── */}
      <div className="mx-4 mt-7">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Hemeroteca
        </p>
        <h2 className="mt-0.5 mb-3 text-xl font-black text-manises-blue">
          Todo lo que han publicado
        </h2>

        <div className="overflow-hidden rounded-[1.4rem] border border-slate-100 bg-white shadow-sm">
          {rest.map((article, i) => (
            <PremiumTouchInteraction key={article.id} scale={0.99}>
              <button
                type="button"
                onClick={() => navigate(`/profile/press/${article.id}`)}
                className={`flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-slate-50/70 ${
                  i > 0 ? 'border-t border-slate-50' : ''
                }`}
              >
                <div className="flex h-11 w-[4.75rem] shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white p-1.5">
                  <OutletMark outlet={article.outlet} logo={article.outletLogo} fallbackSize={10} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
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
