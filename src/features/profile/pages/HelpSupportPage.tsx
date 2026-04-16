import { CircleHelp, Mail, ShieldCheck, Trophy, PhoneCall } from 'lucide-react';
import adminFacade from '@/assets/images/administracion_manises.webp';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { premiumDemoData } from '@/features/profile/data/premium-demo';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';

export function HelpSupportPage() {
  const topics = premiumDemoData.helpTopics;

  return (
    <div className="flex min-h-full flex-col bg-background">
      <ProfileSubHeader title="Ayuda y Garantias" />
      <div className="flex flex-col gap-4 p-5">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-manises-blue text-white shadow-[0_20px_60px_rgba(10,25,47,0.25)]">
          <img src={adminFacade} alt="Administracion Manises" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,25,47,0.88)_0%,rgba(10,25,47,0.56)_100%)]" />
          <div className="relative flex flex-col gap-2 p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-manises-gold">Confianza</p>
            <h3 className="max-w-[16rem] text-xl font-black leading-tight">
              Centro premium de soporte, pagos y juego responsable
            </h3>
            <p className="max-w-[20rem] text-[12px] font-medium text-white/72">
              Estructura preparada para FAQ, contacto, pagos, premios entregados y documentacion legal.
            </p>
          </div>
        </div>

        <PremiumSectionCard
          eyebrow="Contenidos"
          title="Bloques que ya deberian existir en app"
          description="Es lo que la web publica comunica y aqui deberia vivir como experiencia movil nativa."
        >
          <div className="flex flex-col gap-3">
            {topics.map((topic) => (
              <PremiumActionRow
                key={topic.id}
                icon={topic.id === 'help-01' ? Trophy : topic.id === 'help-02' ? ShieldCheck : CircleHelp}
                title={topic.title}
                description={`${topic.description} · ${topic.ctaLabel}`}
              />
            ))}
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard
          eyebrow="Contacto"
          title="Canales visibles"
          description="Soporte y confianza tienen que estar un toque por encima de una simple pantalla de ajustes."
        >
          <div className="flex flex-col gap-3">
            <PremiumActionRow icon={PhoneCall} title="960 992 556" description="Atencion comercial y soporte de jugadas" />
            <PremiumActionRow icon={Mail} title="info@loteriamanises.com" description="Incidencias de cuenta, cobro o empresas" />
          </div>
        </PremiumSectionCard>
      </div>
    </div>
  );
}
