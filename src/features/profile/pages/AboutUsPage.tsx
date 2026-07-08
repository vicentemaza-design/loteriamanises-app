import { useNavigate } from 'react-router-dom';
import { Trophy, Star, TrendingUp, CalendarDays, ShieldCheck, Users, Truck, Globe, CheckCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';

import heroImg from '@/assets/images/quienes-somos/vp-1737353.jpg';
import iniciosImg from '@/assets/images/quienes-somos/historia-inicios.jpg';
import internetImg from '@/assets/images/quienes-somos/vp-1737357.jpg';
import gordo2012Img from '@/assets/images/quienes-somos/manises-afortunado.jpg';
import gordo2013Img from '@/assets/images/quienes-somos/historia-digital.jpg';
import gordo2018Img from '@/assets/images/quienes-somos/historia-premios.jpg';
import gordo2022Img from '@/assets/images/gordos/gordo-navidad-2022.jpg';
import gordo2023Img from '@/assets/images/quienes-somos/gordo2023-celebracion.webp';
import interiorHoyImg from '@/assets/images/quienes-somos/vp-1737355.jpg';
import localImg from '@/assets/images/quienes-somos/vp-1737349.jpg';
import equipoImg from '@/assets/images/quienes-somos/rafa-2023.jpg';
import mostradorImg from '@/assets/images/quienes-somos/mostrador.webp';
import clientesImg from '@/assets/images/quienes-somos/vp-1737354.jpg';

interface TimelineEntry {
  year: string;
  title: string;
  desc: string;
  img?: string;
  isGordo?: boolean;
  number?: string;
  imgPosition?: string;
}

const TIMELINE: TimelineEntry[] = [
  {
    year: '2000',
    title: 'Abrimos nuestras puertas',
    desc: 'Lotería Manises nació en un pequeño local de apenas 35 metros. Años ilusionantes que nos enseñaron todo sobre el sector del juego.',
    img: iniciosImg,
    imgPosition: 'center 40%',
  },
  {
    year: '2005',
    title: 'El salto a Internet',
    desc: 'Nos trasladamos al centro de Manises y lanzamos nuestro primer canal de venta online. Los pioneros del sector en la Comunidad Valenciana.',
    img: internetImg,
    imgPosition: 'center 30%',
  },
  {
    year: '2012',
    title: 'Primer Gordo de Navidad',
    desc: 'El número 76058 convirtió Manises en noticia nacional. El primero de una racha sin precedentes en la historia de la Lotería española.',
    img: gordo2012Img,
    isGordo: true,
    number: '76058',
    imgPosition: 'center 30%',
  },
  {
    year: '2013',
    title: '¡Dos años consecutivos!',
    desc: 'El número 62246. Dos Gordos seguidos: algo jamás visto en toda la historia de la Lotería de Navidad. Manises entra en la leyenda.',
    img: gordo2013Img,
    isGordo: true,
    number: '62246',
    imgPosition: 'center 25%',
  },
  {
    year: '2018',
    title: 'Tercer Gordo de Navidad',
    desc: 'El número 03347. Cinco años después, la suerte vuelve. España entera miraba a Manises como el lugar donde vive la fortuna.',
    img: gordo2018Img,
    isGordo: true,
    number: '03347',
    imgPosition: 'center 25%',
  },
  {
    year: '2022',
    title: 'Cuarto Gordo de Navidad',
    desc: 'El número 05490. La euforia vuelve a inundar las calles de Manises. Cuatro Gordos que nos hacen únicos en toda España.',
    img: gordo2022Img,
    isGordo: true,
    number: '05490',
    imgPosition: 'center 20%',
  },
  {
    year: '2023',
    title: 'Quinto Gordo de Navidad',
    desc: 'El número 88008. El quinto confirma lo que todos saben: la suerte vive en Lotería Manises. Somos historia.',
    img: gordo2023Img,
    isGordo: true,
    number: '88008',
    imgPosition: 'center 25%',
  },
  {
    year: 'HOY',
    title: 'Seguimos repartiendo ilusión',
    desc: '3ª Administración en ventas de España. Nº 1 en la Comunidad Valenciana. Más de 350 M€ repartidos. Y queda mucho camino por recorrer.',
    img: interiorHoyImg,
    imgPosition: 'center 30%',
  },
];

interface ValueCard {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const VALUES: ValueCard[] = [
  {
    icon: ShieldCheck,
    title: 'Administración oficial',
    desc: 'Admon. nº 3 con décadas de trayectoria y receptor oficial de apuestas nº 81980.',
  },
  {
    icon: Users,
    title: 'Trato cercano y personal',
    desc: 'Atendemos a cada cliente como si fuera el único, tanto en tienda como online.',
  },
  {
    icon: Truck,
    title: 'Envíos a toda España',
    desc: 'Tu décimo físico llega a cualquier rincón de España con total seguridad.',
  },
  {
    icon: Globe,
    title: 'Especialistas en venta online',
    desc: 'Más de 20 años vendiendo lotería por internet. Los pioneros del sector.',
  },
  {
    icon: Trophy,
    title: 'Historia de premios única',
    desc: '5 Gordos de Navidad, más de 50 grandes premios y 350 M€ repartidos. Sin igual en España.',
  },
];

const ADMIN_PHOTOS = [
  { img: localImg, label: 'Nuestro local' },
  { img: equipoImg, label: 'Nuestro equipo' },
  { img: mostradorImg, label: 'Nuestro mostrador' },
  { img: clientesImg, label: 'Nuestros clientes' },
];

const STATS = [
  { icon: Trophy,      value: '5',     label: 'Gordos de\nNavidad',  color: '#F5C518' },
  { icon: Star,        value: '50+',   label: 'Grandes\npremios',    color: '#0a4792' },
  { icon: TrendingUp,  value: '350M€', label: 'Premios\nrepartidos', color: '#15803d' },
  { icon: CalendarDays, value: 'DESDE', label: '2000',               color: '#b91c1c' },
];

function GordoDesignCard({ number }: { number: string }) {
  return (
    <div
      className="flex h-32 w-full flex-col items-center justify-center gap-1"
      style={{ background: 'linear-gradient(135deg, #062d6b 0%, #0a4792 100%)' }}
    >
      <Trophy className="h-7 w-7" style={{ color: '#F5C518' }} />
      <span
        className="font-black tracking-widest"
        style={{ color: '#F5C518', fontSize: 28, lineHeight: 1 }}
      >
        {number}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
        El Gordo de Navidad
      </span>
    </div>
  );
}

export function AboutUsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col bg-[#f5f7fa] pb-20">
      <ProfileSubHeader title="Quiénes somos" subtitle="Historia y valores" />

      {/* HERO — imagen que respira, sin texto encima */}
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={heroImg}
          alt="Equipo Lotería Manises celebrando un premio"
          className="h-full w-full object-cover"
          style={{ objectPosition: 'center 35%' }}
        />
        {/* Gradiente suave solo en la parte inferior */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(245,247,250,0.95) 100%)' }}
        />
      </div>

      {/* BLOQUE TITULAR EMOCIONAL ──────────────────────────────── */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-manises-blue/40">
          Lotería Manises · Adm. nº 3
        </p>
        <h1 className="mt-1.5 text-[2rem] font-black leading-none text-manises-blue">
          Desde el año 2000
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
          repartiendo ilusión
        </p>
        <p className="mt-3 text-[13px] font-medium leading-relaxed text-slate-500">
          Lo que empezó como una pequeña administración de barrio, hoy se ha convertido en una de las más reconocidas de España gracias a la confianza de miles de jugadores y a un historial de premios único.
        </p>
      </div>

      {/* STATS */}
      <div className="mx-4 mt-4 grid grid-cols-4 gap-2">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white px-1 py-3 text-center shadow-sm"
          >
            <stat.icon className="h-4 w-4 shrink-0" style={{ color: stat.color }} />
            <p className="mt-1 text-base font-black leading-none text-manises-blue">{stat.value}</p>
            <p className="mt-0.5 whitespace-pre-line text-[9px] font-bold leading-tight text-slate-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* TIMELINE */}
      <div className="mx-4 mt-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Nuestra historia
        </p>
        <h2 className="mt-0.5 text-xl font-black text-manises-blue">
          Un camino de ilusión y premios
        </h2>

        <div className="mt-4">
          {TIMELINE.map((entry, index) => (
            <div key={entry.year} className="flex gap-3">
              {/* Año + línea */}
              <div className="flex w-10 shrink-0 flex-col items-center">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md"
                  style={{
                    background: entry.isGordo
                      ? 'linear-gradient(135deg, #b45309, #F5C518)'
                      : entry.year === 'HOY'
                      ? 'linear-gradient(135deg, #15803d, #16a34a)'
                      : 'linear-gradient(135deg, #0a4792, #1565c0)',
                  }}
                >
                  <span
                    className="font-black leading-none text-white"
                    style={{ fontSize: entry.year === 'HOY' ? 8 : 10 }}
                  >
                    {entry.year}
                  </span>
                </div>
                {index < TIMELINE.length - 1 && (
                  <div
                    className="mt-1 w-px flex-1 bg-slate-200"
                    style={{ minHeight: 20, marginBottom: 4 }}
                  />
                )}
              </div>

              {/* Card */}
              <div className="mb-4 min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                {entry.img ? (
                  <img
                    src={entry.img}
                    alt={entry.title}
                    className="h-32 w-full object-cover"
                    style={{ objectPosition: entry.imgPosition ?? 'center' }}
                  />
                ) : (
                  <GordoDesignCard number={entry.number!} />
                )}
                {entry.isGordo && (
                  <div className="flex items-center gap-2 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2">
                    <Trophy className="h-3 w-3 shrink-0 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                      El Gordo de Navidad · Nº {entry.number}
                    </span>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm font-black text-manises-blue">{entry.title}</p>
                  <p className="mt-1 text-[12px] font-semibold leading-relaxed text-slate-500">{entry.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POR QUÉ ELEGIRNOS */}
      <div className="mx-4 mt-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Razones para elegirnos
        </p>
        <h2 className="mt-0.5 text-xl font-black text-manises-blue">
          ¿Por qué Lotería Manises?
        </h2>

        <div className="mt-4 flex flex-col gap-3">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #0a4792, #1565c0)' }}
              >
                <v.icon className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-manises-blue">{v.title}</p>
                <p className="mt-0.5 text-[12px] font-semibold leading-relaxed text-slate-500">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NUESTRA ADMINISTRACIÓN */}
      <div className="mx-4 mt-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Dónde estamos
        </p>
        <h2 className="mt-0.5 text-xl font-black text-manises-blue">
          Nuestra administración
        </h2>
        <p className="mt-1 text-xs font-semibold text-slate-400">
          Avda. dels Tramvies, 12 · 46940 Manises, Valencia
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {ADMIN_PHOTOS.map((photo) => (
            <div key={photo.label} className="overflow-hidden rounded-2xl shadow-sm">
              <img
                src={photo.img}
                alt={photo.label}
                className="h-32 w-full object-cover"
              />
              <div className="py-2 text-center" style={{ background: '#0a4792' }}>
                <span className="text-[10px] font-black uppercase tracking-wider text-white">
                  {photo.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA CIERRE */}
      <div
        className="mx-4 mt-6 overflow-hidden rounded-[1.8rem] p-6 text-center"
        style={{ background: 'linear-gradient(135deg, #062d6b 0%, #0a4792 100%)' }}
      >
        <CheckCircle className="mx-auto h-8 w-8 text-white/30" />
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-white/50">
          Nuestra historia no la escribimos nosotros.
        </p>
        <p
          className="font-manuscript mt-2 text-2xl leading-tight"
          style={{ fontWeight: 700, color: '#F5C518', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
        >
          La escribís vosotros, cada día.
        </p>
        <p className="mt-2 text-sm font-semibold text-white/70">
          Gracias por confiar en Lotería Manises.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-5 w-full rounded-xl py-3.5 text-sm font-black uppercase tracking-wider text-[#062d6b] shadow-lg transition-transform active:scale-95"
          style={{ background: '#F5C518' }}
        >
          Comprar lotería
        </button>
      </div>

    </div>
  );
}
