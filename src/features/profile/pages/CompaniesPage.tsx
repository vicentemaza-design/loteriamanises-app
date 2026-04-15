import { BriefcaseBusiness, Building2, MailPlus, Users } from 'lucide-react';
import winnersImage from '@/assets/images/header_winner.jpg';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { premiumDemoData } from '@/features/profile/data/premium-demo';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumMetricPill } from '../components/PremiumMetricPill';

export function CompaniesPage() {
  const companyServices = premiumDemoData.companyServices;

  return (
    <div className="flex min-h-full flex-col bg-background pb-nav-safe">
      <ProfileSubHeader title="Empresas y Colectivos" />
      <div className="flex flex-col gap-4 p-5">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_20px_60px_rgba(10,25,47,0.18)]">
          <img src={winnersImage} alt="Servicio para empresas" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,25,47,0.88)_0%,rgba(10,25,47,0.48)_100%)]" />
          <div className="relative flex flex-col gap-3 p-6 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-manises-gold">B2B</p>
            <h3 className="max-w-[14rem] text-2xl font-black leading-tight">
              Loteria de Navidad para empresas
            </h3>
            <p className="max-w-[18rem] text-[12px] font-medium text-white/74">
              Base demo lista para presupuestos, participaciones y reparto digital.
            </p>
          </div>
        </div>

        <PremiumSectionCard
          eyebrow="Oportunidad"
          title="Linea premium de negocio"
          description="La web ya la comunica. La app necesita su modulo propio para no perder ese canal."
        >
          <div className="grid grid-cols-2 gap-3">
            <PremiumMetricPill label="Campana" value="Navidad y Nino" tone="gold" />
            <PremiumMetricPill label="Target" value="Empresas y asociaciones" tone="blue" />
          </div>
        </PremiumSectionCard>

        {companyServices.map((service) => (
          <PremiumSectionCard
            key={service.id}
            eyebrow="Servicio"
            title={service.title}
            description={service.description}
          >
            <PremiumActionRow
              icon={service.id === 'company-01' ? Building2 : Users}
              title="Propuesta operativa"
              description={service.detail}
            />
          </PremiumSectionCard>
        ))}

        <PremiumSectionCard
          eyebrow="Backend"
          title="Modelo recomendado"
          description="company_campaign, participant, ticket_allocation, payment_status, batch_send_log"
        >
          <div className="flex flex-col gap-3">
            <PremiumActionRow icon={BriefcaseBusiness} title="Panel de gestion" description="Crear campanas, cargas CSV, reparto y seguimiento de cobros." />
            <PremiumActionRow icon={MailPlus} title="Envio de participaciones" description="Email, PDF, WhatsApp y trazabilidad de entrega por participante." />
          </div>
        </PremiumSectionCard>
      </div>
    </div>
  );
}
