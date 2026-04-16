import { BriefcaseBusiness, Building2, Mail, Phone, Users } from 'lucide-react';
import companiesHero from '@/assets/images/loteria de empresas.jpg';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { premiumDemoData } from '@/features/profile/data/premium-demo';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumMetricPill } from '../components/PremiumMetricPill';

export function CompaniesPage() {
  const companyServices = premiumDemoData.companyServices;

  return (
    <div className="flex min-h-full flex-col bg-background">
      <ProfileSubHeader title="Empresas y Colectivos" subtitle="Servicio B2B" />
      <div className="flex flex-col gap-5 p-4">

        {/* B2B Image Section - Refined, less "loud" */}
        <section className="relative overflow-hidden rounded-[2rem] border border-gray-100 shadow-sm surface-neo-soft h-44">
          <img
            src={companiesHero}
            alt="Servicio para empresas"
            className="absolute inset-0 h-full w-full object-cover opacity-50 grayscale blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <div className="relative h-full flex flex-col justify-end p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-manises-blue/40 mb-1">Campaña 2026</p>
            <h2 className="text-xl font-black text-manises-blue leading-tight mb-2">Lotería para Empresas</h2>
            <p className="text-[11px] font-medium text-muted-foreground leading-relaxed max-w-[200px]">
              Soluciones digitales para el reparto de Navidad en tu equipo.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <PremiumMetricPill label="Target" value="B2B / Fallas" tone="violet" icon={<Building2 className="w-3.5 h-3.5" />} />
          <PremiumMetricPill label="Soporte" value="Dedicado" tone="blue" />
        </div>

        <section className="flex flex-col gap-4">
          {companyServices.map((service) => (
            <PremiumSectionCard
              key={service.id}
              eyebrow="Servicio"
              title={service.title}
              description={service.description}
              tone="violet"
            >
              <div className="bg-muted/30 rounded-xl overflow-hidden border border-border/50">
                <PremiumActionRow
                  icon={service.id === 'company-01' ? Building2 : Users}
                  title="Propuesta operativa"
                  description={service.detail}
                  tone={service.id === 'company-01' ? 'violet' : 'blue'}
                  badge="Config."
                />
              </div>
            </PremiumSectionCard>
          ))}
        </section>

        <section className="space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Canales Directos</p>
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border/50">
            <PremiumActionRow
              icon={Mail}
              title="Solicitar presupuesto"
              description="info@loteriamanises.com"
              tone="gold"
              onClick={() => undefined}
            />
            <PremiumActionRow
              icon={Phone}
              title="Atención Comercial"
              description="Atención personalizada 1 a 1"
              tone="blue"
              onClick={() => undefined}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
