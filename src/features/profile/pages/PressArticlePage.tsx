import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, ExternalLink, Quote, Ticket } from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { OutletMark } from '../components/OutletMark';
import { getPressArticle, formatPressDate } from '../data/press-coverage';

/**
 * Detalle de una noticia.
 *
 * Todo el contenido sale de data/press-coverage.ts. Los bloques opcionales
 * —cita, cifras, puntos clave— solo se pintan si la noticia los trae, así
 * que una entrada mínima (titular, entradilla, resumen e imagen) también
 * se ve bien.
 */
export function PressArticlePage() {
  const navigate = useNavigate();
  const { articleId } = useParams<{ articleId: string }>();
  const article = articleId ? getPressArticle(articleId) : undefined;

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <ProfileSubHeader title="En los medios" backTo="/profile/press" />
        <div className="px-5 pt-10 text-center">
          <p className="text-[13px] font-bold text-manises-blue">No encontramos esa noticia</p>
          <p className="mt-1 text-[12px] font-medium text-muted-foreground">
            Puede que se haya retirado del listado.
          </p>
          <button
            type="button"
            onClick={() => navigate('/profile/press')}
            className="mt-5 rounded-full bg-manises-blue px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-white"
          >
            Ver todas las noticias
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <ProfileSubHeader title="En los medios" backTo="/profile/press" />

      <div className="px-5 pt-5 space-y-5">
        {/* ── Medio y fecha ──────────────────────────────────────── */}
        <div className="flex items-baseline justify-between gap-3">
          <OutletMark outlet={article.outlet} logo={article.outletLogo} height={24} />
          <p className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {formatPressDate(article.date)}
          </p>
        </div>

        {/* ── Titular ────────────────────────────────────────────── */}
        <header className="space-y-2">
          <h1 className="text-[21px] font-black leading-tight text-manises-blue">
            {article.headline}
          </h1>
          <p className="text-[13px] font-medium leading-relaxed text-muted-foreground">
            {article.standfirst}
          </p>
        </header>

        <img
          src={article.image}
          alt={article.imageAlt}
          className="h-52 w-full rounded-[1.4rem] object-cover"
          loading="eager"
        />

        {/* ── Resumen ────────────────────────────────────────────── */}
        <div className="space-y-3">
          {article.summary.map(parrafo => (
            <p key={parrafo} className="text-[13px] font-medium leading-relaxed text-slate-600">
              {parrafo}
            </p>
          ))}
        </div>

        {/* ── Cifras ─────────────────────────────────────────────── */}
        {article.figures && article.figures.length > 0 && (
          <div className="rounded-[1.4rem] border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Premios repartidos
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {article.figures.map(figure => (
                <div key={figure.label} className="rounded-xl bg-manises-blue/[0.04] px-2 py-3 text-center">
                  <p className="text-[26px] font-black leading-none text-manises-gold-dark">
                    {figure.value}
                  </p>
                  <p className="mt-1.5 text-[9.5px] font-bold leading-tight text-slate-500">
                    {figure.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Cita ───────────────────────────────────────────────── */}
        {article.quote && (
          <blockquote className="rounded-[1.4rem] border border-manises-blue/10 bg-manises-blue/[0.04] p-4">
            <Quote className="h-4 w-4 text-manises-blue/40" />
            <p className="mt-2 text-[14px] font-bold italic leading-relaxed text-manises-blue">
              «{article.quote.text}»
            </p>
            <footer className="mt-2 text-[11px] font-bold text-slate-500">
              {article.quote.source}
            </footer>
          </blockquote>
        )}

        {/* ── Puntos clave ───────────────────────────────────────── */}
        {article.highlights && article.highlights.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              También recogen
            </p>
            {article.highlights.map(punto => (
              <div key={punto} className="flex items-start gap-2.5">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p className="text-[12.5px] font-medium leading-relaxed text-slate-600">{punto}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Volver a la compra ─────────────────────────────────── */}
        <PremiumTouchInteraction scale={0.98}>
          <button
            type="button"
            onClick={() => navigate('/games')}
            className="flex w-full items-center gap-3 rounded-[1.4rem] border border-manises-gold/25 bg-manises-gold-soft/50 p-4 text-left transition-all"
          >
            <div className="rounded-xl bg-white/70 p-2">
              <Ticket className="h-5 w-5 text-manises-gold-dark" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-black text-manises-blue">¿Buscas tu número?</p>
              <p className="text-[11.5px] font-medium text-slate-500">
                La ilusión también empieza aquí.
              </p>
            </div>
          </button>
        </PremiumTouchInteraction>

        {/* ── Atribución ─────────────────────────────────────────── */}
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3"
        >
          <span className="text-[11px] font-medium text-slate-500">
            Fuente: {article.outlet}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-black text-manises-blue">
            Ver publicación original
            <ExternalLink className="h-3 w-3" />
          </span>
        </a>
      </div>
    </div>
  );
}
