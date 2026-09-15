import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, ExternalLink, Ticket, Trophy } from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { OutletMark } from '../components/OutletMark';
import { getPressArticle, formatPressDate } from '../data/press-coverage';

/** Cómo se nombra el soporte cuando la ficha va sin foto. */
const MEDIUM_LABEL: Record<string, string> = {
  prensa: 'Prensa escrita',
  television: 'Televisión',
  radio: 'Radio',
};

/**
 * Detalle de una noticia.
 *
 * Todo el contenido sale de data/press-coverage.ts. Los bloques opcionales
 * —foto, cita, cifras, puntos clave— solo se pintan si la noticia los
 * trae, así que una entrada mínima (titular, entradilla y resumen)
 * también se ve bien.
 *
 * El orden es el de una nota de prensa, no el de una landing: primero lo
 * que publicó el medio, después el enlace al original, y solo al final la
 * llamada a comprar. Vender antes de acreditar la fuente deja la noticia
 * en excusa comercial.
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
      {/* Con foto propia manda la foto. Sin ella, cabecera de marca con
          el logotipo grande: no se rellena con material del medio. */}
      <div className="relative h-56 w-full overflow-hidden">
        {article.image ? (
          <>
            <img
              src={article.image}
              alt={article.imageAlt ?? ''}
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
          </>
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #062d6b 0%, #0a4792 52%, #0d56b0 100%)' }}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: 'radial-gradient(circle at 78% 22%, rgba(245,197,24,0.16) 0%, rgba(255,255,255,0) 50%)' }}
            />
            <div className="relative flex h-full flex-col items-center justify-center gap-3 px-8 pb-6">
              <span className="inline-flex h-16 w-40 items-center justify-center rounded-2xl bg-white px-5 py-3 shadow-lg">
                <OutletMark outlet={article.outlet} logo={article.outletLogo} fallbackSize={18} />
              </span>
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/50">
                {MEDIUM_LABEL[article.medium]}
              </p>
            </div>
            <div
              className="absolute inset-x-0 bottom-0 h-16"
              style={{ background: 'linear-gradient(to bottom, rgba(245,247,250,0) 0%, rgba(245,247,250,0.96) 100%)' }}
            />
          </>
        )}
      </div>

      {/* Crédito de la foto. Va pegado a la imagen, que es donde se espera. */}
      {article.image && article.imageCredit && (
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
        {/* Lo que sigue lo escribimos nosotros. Sin este rótulo, bajo el
            logotipo del medio, se lee como si lo firmara el medio. */}
        <div className="space-y-3">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
            Nuestro resumen de lo publicado por {article.outlet}
          </p>
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
        {/* Dos registros distintos, y conviene que se noten. Si quien
            habla es una persona, va en manuscrita dorada: es el gesto que
            la app reserva para la voz propia. Si lo que se cita es prosa
            del propio medio, va en redonda y firmado con su logotipo,
            porque poner al medio a hablar con nuestra letra de firma
            parece que nos avala con nuestras propias palabras. */}
        {article.quote && (() => {
          const esDelMedio = article.quote.source === article.outlet;
          return (
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

              {esDelMedio ? (
                <blockquote className="relative text-[14px] font-semibold leading-relaxed text-white/90">
                  {article.quote.text}
                </blockquote>
              ) : (
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
              )}

              <figcaption className="relative mt-3.5 flex items-center gap-2.5">
                <span className="h-px w-6" style={{ backgroundColor: 'rgba(245,197,24,0.55)' }} />
                {esDelMedio ? (
                  <span className="inline-flex h-7 w-[4.25rem] items-center justify-center rounded-lg bg-white/95 px-2 py-1">
                    <OutletMark outlet={article.outlet} logo={article.outletLogo} fallbackSize={9} />
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/65">
                    {article.quote.source}
                  </span>
                )}
              </figcaption>
            </figure>
          );
        })()}

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

        {/* ── Atribución ─────────────────────────────────────────── */}
        {/* Va ANTES de la llamada a comprar: primero se acredita a quien
            publicó la noticia y se ofrece leerla entera, y después ya se
            propone jugar. Al revés, la noticia parece el envoltorio. */}
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-[1.4rem] border border-slate-100 bg-white px-3.5 py-3 shadow-sm transition-colors hover:bg-slate-50/70"
        >
          <span className="flex h-11 w-[4.75rem] shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white p-1.5">
            <OutletMark outlet={article.outlet} logo={article.outletLogo} fallbackSize={10} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
              Publicado por {article.outlet}
            </span>
            <span className="mt-0.5 block text-[12.5px] font-black leading-snug text-manises-blue">
              Leer la noticia completa
            </span>
          </span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-300" />
        </a>

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

      </div>
    </div>
  );
}
