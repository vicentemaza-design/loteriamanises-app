import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, ExternalLink, Ticket, Trophy } from 'lucide-react';
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
        <span className="absolute left-5 top-4 inline-flex h-10 w-[6rem] items-center justify-center rounded-xl bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
          <OutletMark outlet={article.outlet} logo={article.outletLogo} fallbackSize={12} />
        </span>
      </div>

      {/* Crédito de la foto. Va pegado a la imagen, que es donde se espera,
          y solo aparece si la noticia lo trae. */}
      {article.imageCredit && (
        <p className="px-5 pt-2 text-right text-[9.5px] font-medium text-slate-400">
          Foto: {article.imageCredit}
        </p>
      )}

      <div className="px-5 pt-3 space-y-5">
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
        {/* Son premios, así que llevan el tratamiento con el que la app
            presenta los premios: cifra en oro sobre azul de marca, igual
            que las tarjetas de Gordo de "Quiénes somos". */}
        {article.figures && article.figures.length > 0 && (
          <div
            className="overflow-hidden rounded-[1.4rem] shadow-[0_14px_32px_-14px_rgba(10,71,146,0.45)]"
            style={{ background: 'linear-gradient(135deg, #062d6b 0%, #0a4792 100%)' }}
          >
            <div className="flex items-center gap-2 px-4 pt-3.5">
              <Trophy className="h-3.5 w-3.5" style={{ color: '#F5C518' }} />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/55">
                Premios repartidos
              </p>
            </div>
            <div className="flex px-2 pb-4 pt-2">
              {article.figures.map((figure, i) => (
                <div
                  key={figure.label}
                  className={`flex-1 px-1 text-center ${i > 0 ? 'border-l border-white/10' : ''}`}
                >
                  <p
                    className="font-black leading-none"
                    style={{ color: '#F5C518', fontSize: '1.9rem' }}
                  >
                    {figure.value}
                  </p>
                  <p className="mt-1.5 text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-white/55">
                    {figure.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Cita ───────────────────────────────────────────────── */}
        {/* La manuscrita en oro es el gesto que la app reserva para las
            frases con voz propia. Una cita del lotero es justo eso, así
            que aquí sí toca, sobre fondo oscuro para que el oro se lea. */}
        {article.quote && (
          <figure
            className="relative overflow-hidden rounded-[1.4rem] px-5 py-6 shadow-[0_14px_32px_-14px_rgba(10,71,146,0.45)]"
            style={{ background: 'linear-gradient(135deg, #062d6b 0%, #0d56b0 100%)' }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-2 -top-6 select-none font-manuscript leading-none"
              style={{ fontSize: '9rem', color: 'rgba(245,197,24,0.10)' }}
            >
              &rdquo;
            </span>

            <blockquote
              className="relative font-manuscript"
              style={{
                fontWeight: 700,
                fontSize: 'clamp(1.1rem, 4.6vw, 1.35rem)',
                lineHeight: 1.35,
                color: '#F5C518',
                textShadow: '0 1px 10px rgba(245,197,24,0.18)',
              }}
            >
              {article.quote.text}
            </blockquote>

            <figcaption className="relative mt-3.5 flex items-center gap-2">
              <span className="h-px w-6" style={{ backgroundColor: 'rgba(245,197,24,0.55)' }} />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/65">
                {article.quote.source}
              </span>
            </figcaption>
          </figure>
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

        {/* ── Llamada a la compra ────────────────────────────────── */}
        {/* Lleva a Lotería de Navidad, que es el juego del que hablan
            todas estas noticias, no al catálogo general. */}
        <PremiumTouchInteraction scale={0.98}>
          <button
            type="button"
            onClick={() => navigate('/play/loteria-navidad')}
            className="group relative w-full overflow-hidden rounded-[1.4rem] text-left shadow-[0_14px_32px_-14px_rgba(212,160,23,0.5)]"
            style={{ background: 'linear-gradient(135deg, #F5C518 0%, #D4A017 100%)' }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(circle at 88% 15%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 52%)' }}
            />
            <div className="relative flex items-center gap-3.5 px-4 py-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/35 shadow-inner backdrop-blur-sm">
                <Ticket className="h-5 w-5 text-manises-blue" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-manises-blue/55">
                  Lotería de Navidad
                </p>
                <p className="mt-0.5 text-[15px] font-black leading-tight text-manises-blue">
                  Busca tu número de Manises
                </p>
                <p className="mt-0.5 text-[11px] font-semibold leading-snug text-manises-blue/65">
                  La ilusión también empieza aquí.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-manises-blue transition-transform group-hover:translate-x-0.5" />
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
