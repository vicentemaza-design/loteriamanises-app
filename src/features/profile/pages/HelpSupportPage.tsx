import { 
  Mail, 
  ShieldCheck, 
  Trophy, 
  PhoneCall, 
  HelpCircle, 
  Scale, 
  FileText, 
  Users, 
  Ban
} from 'lucide-react';
import adminFacade from '@/assets/images/administracion_manises.webp';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { toast } from 'sonner';

export function HelpSupportPage() {
  const handleItemClick = (label: string) => {
    toast.info(`La sección de "${label}" se abrirá en una vista dedicada próximamente.`);
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-12">
      <ProfileSubHeader title="Ayuda, premios y legal" subtitle="Información y soporte oficial" />
      
      <div className="flex flex-col gap-6 p-5">
        {/* Banner de Confianza / Quiénes Somos */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-manises-blue text-white shadow-[0_20px_60px_rgba(10,25,47,0.25)]">
          <img src={adminFacade} alt="Administración Manises" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,25,47,0.88)_0%,rgba(10,25,47,0.56)_100%)]" />
          <div className="relative flex flex-col gap-2 p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-manises-gold">Administración nº 3</p>
            <h3 className="max-w-[16rem] text-xl font-black leading-tight">
              Tu canal oficial de confianza en Manises
            </h3>
            <p className="max-w-[20rem] text-[12px] font-medium text-white/72">
              Llevamos la suerte a toda España con la garantía oficial de SELAE y un soporte premium para nuestros jugadores.
            </p>
          </div>
        </div>

        {/* BLOQUE 1 — Ayuda e información */}
        <PremiumSectionCard
          eyebrow="Soporte"
          title="Ayuda y premios"
          description="Todo lo que necesitas saber para jugar y cobrar tus premios con seguridad."
        >
          <div className="flex flex-col gap-1">
            <PremiumActionRow 
              icon={Trophy} 
              title="Pago de premios" 
              description="Validación, plazos y fiscalidad" 
              onClick={() => handleItemClick('Pago de premios')}
              tone="gold"
            />
            <PremiumActionRow 
              icon={HelpCircle} 
              title="FAQ" 
              description="Preguntas y respuestas frecuentes" 
              onClick={() => handleItemClick('FAQ')}
            />
            <PremiumActionRow 
              icon={Users} 
              title="Quiénes Somos" 
              description="Historia y equipo de Lotería Manises" 
              onClick={() => handleItemClick('Quiénes Somos')}
            />
            <div className="pt-2 mt-2 border-t border-border/50">
              <PremiumActionRow 
                icon={PhoneCall} 
                title="960 992 556" 
                description="Llamar a atención comercial" 
                onClick={() => window.open('tel:960992556')}
                tone="blue"
              />
              <PremiumActionRow 
                icon={Mail} 
                title="info@loteriamanises.com" 
                description="Soporte técnico y consultas" 
                onClick={() => window.open('mailto:info@loteriamanises.com')}
                tone="blue"
              />
            </div>
          </div>
        </PremiumSectionCard>

        {/* BLOQUE 2 — Juego responsable */}
        <PremiumSectionCard
          eyebrow="Compromiso"
          title="Juego responsable"
          description="Herramientas y guías para mantener el juego siempre como una diversión."
        >
          <div className="flex flex-col gap-1">
            <PremiumActionRow 
              icon={ShieldCheck} 
              title="Juego Responsable" 
              description="Guía de control y ayuda al jugador" 
              onClick={() => handleItemClick('Juego Responsable')}
              tone="emerald"
            />
            <PremiumActionRow 
              icon={Ban} 
              title="Prohibición a menores (+18)" 
              description="Política de acceso restringido" 
              onClick={() => handleItemClick('Prohibición a menores')}
              tone="rose"
            />
            <div className="mt-3 px-3 py-2.5 bg-muted/30 rounded-xl border border-border/50">
              <p className="text-[10px] text-muted-foreground font-medium italic text-center">
                "Juega con responsabilidad y solo si eres mayor de edad."
              </p>
            </div>
          </div>
        </PremiumSectionCard>

        {/* BLOQUE 3 — Legal */}
        <PremiumSectionCard
          eyebrow="Transparencia"
          title="Información legal"
          description="Documentación oficial y términos de servicio de la plataforma."
        >
          <div className="flex flex-col gap-1">
            <PremiumActionRow 
              icon={FileText} 
              title="Condiciones Generales" 
              onClick={() => handleItemClick('Condiciones Generales')}
            />
            <PremiumActionRow 
              icon={FileText} 
              title="Política de Privacidad" 
              onClick={() => handleItemClick('Política de Privacidad')}
            />
            <PremiumActionRow 
              icon={Scale} 
              title="Aviso Legal" 
              onClick={() => handleItemClick('Aviso Legal')}
            />
          </div>
        </PremiumSectionCard>

        {/* Footer info minimal */}
        <div className="text-center pt-4 pb-8 space-y-1 opacity-40">
          <p className="text-[10px] font-bold text-manises-blue uppercase tracking-widest">Lotería Manises</p>
          <p className="text-[9px] font-medium">Receptor Oficial 81980 · Admon. nº 3</p>
        </div>
      </div>
    </div>
  );
}
