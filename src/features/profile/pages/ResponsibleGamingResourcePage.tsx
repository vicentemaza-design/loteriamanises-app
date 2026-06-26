import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { PhoneCall, ShieldAlert, ShieldCheck, Sparkles, Scale } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';

const CONTENT = {
  'play-smart': {
    title: 'Juega con responsabilidad',
    subtitle: 'Uso saludable del juego',
    icon: ShieldCheck,
    blocks: [
      'Recuerda que el objetivo es entretenerte, no recuperar dinero ni depender del resultado para sentir alivio.',
      'Antes de jugar, decide cuánto tiempo y cuánto importe quieres dedicar a la actividad.',
      'Evita jugar bajo los efectos del alcohol o en momentos de estrés intenso.',
    ],
  },
  'important-info': {
    title: 'Información importante',
    subtitle: 'Riesgos y señales de alerta',
    icon: ShieldAlert,
    blocks: [
      'Jugar más de lo previsto, perseguir pérdidas o sentir ansiedad al no participar son señales que conviene vigilar.',
      'Los problemas de juego pueden afectar a la economía personal, las relaciones y la vida laboral.',
      'Si detectas varias de estas señales, utiliza tus límites y pide apoyo profesional cuanto antes.',
    ],
  },
  'need-help': {
    title: '¿Necesitas ayuda?',
    subtitle: 'Recursos de apoyo',
    icon: PhoneCall,
    blocks: [
      'FEJAR — Federación Española de Jugadores de Azar Rehabilitados: 900 200 225.',
      'Plan Nacional sobre Drogas: 900 16 15 15.',
      'Fundación ANAR: 900 20 20 10.',
    ],
  },
  'good-practices': {
    title: 'Normas y buenas prácticas',
    subtitle: 'Compromiso de Lotería Manises',
    icon: Scale,
    blocks: [
      'Promovemos un juego seguro, transparente y dirigido a un público adulto.',
      'La comunicación comercial debe ser prudente y no presentar el juego como solución económica.',
      'Ponemos a disposición herramientas de control y recursos de ayuda cuando el usuario los necesita.',
    ],
  },
} as const;

export function ResponsibleGamingResourcePage() {
  const { sectionId = 'play-smart' } = useParams();
  const section = useMemo(() => CONTENT[sectionId as keyof typeof CONTENT] ?? CONTENT['play-smart'], [sectionId]);

  return (
    <div className="flex min-h-full flex-col bg-background pb-20">
      <ProfileSubHeader title={section.title} subtitle={section.subtitle} backTo="/profile/gaming-control" />

      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-[1.6rem] bg-manises-blue p-5 text-white shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <section.icon className="h-6 w-6 text-manises-gold" />
          </div>
          <h2 className="mt-4 text-xl font-black">{section.title}</h2>
          <p className="mt-2 text-sm font-semibold text-white/75">{section.subtitle}</p>
        </section>

        <PremiumSectionCard title="Contenido" eyebrow="Guía rápida" description="Información pensada para móvil, con lectura clara y directa." tone="blue">
          <div className="space-y-3">
            {section.blocks.map((block) => (
              <div key={block} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                <p className="text-sm font-semibold leading-relaxed text-slate-600">{block}</p>
              </div>
            ))}
          </div>
        </PremiumSectionCard>

        <div className="rounded-[1.45rem] border border-slate-100 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4.5 w-4.5 text-manises-blue" />
            <p className="text-sm font-semibold text-slate-600">
              Si necesitas actuar sobre tu cuenta, vuelve a la pantalla principal de Juego responsable para usar tus límites o la autoexclusión.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
