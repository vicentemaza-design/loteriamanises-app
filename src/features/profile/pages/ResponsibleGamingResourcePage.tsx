import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { RESPONSIBLE_GAMING_CONTENT, type ResponsibleGamingSectionId } from '@/shared/data/responsible-gaming-content';

export function ResponsibleGamingResourcePage() {
  const { sectionId = 'play-smart' } = useParams();
  const section = useMemo(
    () => RESPONSIBLE_GAMING_CONTENT[sectionId as ResponsibleGamingSectionId] ?? RESPONSIBLE_GAMING_CONTENT['play-smart'],
    [sectionId]
  );

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
