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
      <div className="flex min-h-full flex-col bg-[#f5f7fa]">
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
    <div className="flex min-h-full flex-col bg-[#f5f7fa] pb-20">
      <ProfileSubHeader title="En los medios" backTo="/profile/press" />

      {/* ── HERO ───────────────────────────────────────────────── */}
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={article.image}
          alt={article.imageAlt}
          className="h-full w-full object-cover"
          style={{ objectPosition: 'center 40%' }}
          loading="eager"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 48%, rgba(245,247,250,0.96) 100%)' }}
        />
        <span className="absolute left-5 top-4 inline-flex items-center rounded-xl bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
          <OutletMark outlet={article.outlet} logo={article.outletLogo} height={18} />
        </span>
      </div>

      {/* Crédito de la foto. Va pegado a la imagen, que es donde se espera,
          y solo aparece si la noticia lo trae. */}
      {article.imageCredit && (
        <p className="-mt-2 px-5 text-right text-[9.5px] font-medium text-slate-400">
          Foto: {article.imageCredit}
        </p>
      )}

      <div className="px-5 pt-4 space-y-5">
        {/* ── Titular ────────────────────────────────────────────── */}
        <header className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-manises-blue/40">
            {formatPressDate(article.date)}
          </p>
          <h1 className="text-[1.5rem] font-black leading-[1.12] tracking-tight text-manises-blue">
            {article.headline}
          </h1>
          <p className="text-[13px] font-medium leading-relaxed text-slate-500">
            {article.standfirst}
          </p>
        </header>

        {/* ── Resumen ────────────────────────────────────────────── */}
        <div className="space-y-3">
          {article.summary.map((parrafo, i) => (
            <p
              key={parrafo}
              className={`text-[13.5px] leading-relaxed text-slate-600 ${
                i === 0 ? 'font-semibold text-slate-700' : 'font-medium'
              }`}
            >
              {parrafo}
            </p>
          ))}
        </div>

        {/* ── Cifras ─────────────────────────────────────────────── */}
        {article.figures && article.figures.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Premios repartidos
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {article.figures.map(figure => (
                <div
                  key={figure.label}
                  className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white px-1 py-3 text-center shadow-sm"
                >
                  <p className="text-[1.6rem] font-black leading-none text-manises-gold-dark">
                    {figure.value}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-[9px] font-bold leading-tight text-slate-500">
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
