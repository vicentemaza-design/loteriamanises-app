import {
  Ban,
  ExternalLink,
  FileText,
  HelpCircle,
  Mail,
  MapPin,
  PhoneCall,
  Scale,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react';
import adminFacade from '@/assets/images/administracion_manises.webp';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';

const officialLinks = {
  whoWeAre: 'https://www.loteriamanises.com/Web_2_0/quienes-somos/',
  prizes: 'https://www.loteriamanises.com/Web_2_0/premios-y-pagos/',
  faq: 'https://www.loteriamanises.com/Web_2_0/faqs/',
  responsibleGaming: 'https://www.loteriamanises.com/Web_2_0/juego-responsable/',
  legalNotice: 'https://www.loteriamanises.com/Web_2_0/aviso-legal/',
  privacy: 'https://www.loteriamanises.com/Web_2_0/Web/General/General_PoliticaPrivacidad.aspx',
  conditions: 'https://www.loteriamanises.com/Web_2_0/Web/General/General_Condiciones_Generales.aspx',
  maps: 'https://maps.google.com/?q=Avda.%20dels%20Tramvies%2012%2046940%20Manises%20Valencia',
} as const;

const faqItems = [
  {
    question: '¿Tengo que registrarme para jugar?',
    answer:
      'Sí. La web oficial indica que el registro y los datos correctos son necesarios para validar jugadas y poder cobrar premios sin incidencias.',
  },
  {
    question: '¿Dónde veo mis jugadas y el certificado?',
    answer:
      'Desde tu cuenta, en “Mis jugadas”. En el detalle de cada pedido puedes descargar el certificado y revisar números, estado y justificante.',
  },
  {
    question: '¿Cómo sé si he obtenido premio?',
    answer:
      'Tras cada sorteo hacen el escrutinio, te avisan por email y reflejan el resultado en tu cuenta. Si el premio es importante, también contactan por teléfono.',
  },
  {
    question: '¿Es seguro pagar en Lotería Manises?',
    answer:
      'Sí. La web trabaja con comercio electrónico seguro para tarjeta y también permite recargar saldo por transferencia a la cuenta virtual del usuario.',
  },
  {
    question: '¿Por qué puede fallar el pago con tarjeta?',
    answer:
      'La causa habitual es no tener activado el sistema CES o la compra por internet en tu banco. La FAQ oficial lo vincula a Verified by Visa o Mastercard SecureCode.',
  },
  {
    question: '¿Los décimos electrónicos se envían o se recogen?',
    answer:
      'No se envían físicamente ni hace falta recogerlos. La prueba de custodia queda en tu cuenta y, si hay premio, se gestiona el abono a la cuenta indicada.',
  },
] as const;

const contactActions = [
  {
    icon: PhoneCall,
    title: 'Llamar ahora',
    description: 'Atención comercial y soporte',
    onClick: () => window.open('tel:960992556'),
    tone: 'blue' as const,
  },
  {
    icon: Mail,
    title: 'Enviar email',
    description: 'info@loteriamanises.com',
    onClick: () => window.open('mailto:info@loteriamanises.com'),
    tone: 'blue' as const,
  },
  {
    icon: MapPin,
    title: 'Abrir en mapas',
    description: 'Avda. dels Tramvies, 12 · Manises',
    onClick: () => window.open(officialLinks.maps, '_blank', 'noopener,noreferrer'),
    tone: 'blue' as const,
  },
] as const;

export function HelpSupportPage() {
  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-12">
      <ProfileSubHeader title="Ayuda, premios y legal" subtitle="Información y soporte oficial" />

      <div className="flex flex-col gap-6 p-5">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-manises-blue text-white shadow-[0_20px_60px_rgba(10,25,47,0.25)]">
          <img src={adminFacade} alt="Administración Manises" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,25,47,0.88)_0%,rgba(10,25,47,0.56)_100%)]" />
          <div className="relative flex flex-col gap-2 p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-manises-gold">Administración nº 3</p>
            <h3 className="max-w-[17rem] text-xl font-black leading-tight">
              Información oficial, clara y útil para jugar con tranquilidad
            </h3>
            <p className="max-w-[20rem] text-[12px] font-medium text-white/72">
              Resumen adaptado desde la web de Lotería Manises para consultar trayectoria, premios, ayuda, contacto y documentación legal sin bloques interminables.
            </p>
          </div>
        </div>

        <PremiumSectionCard
          eyebrow="Quiénes somos"
          title="Lotería Manises, referencia en ventas y premios"
          description="Versión corta y escaneable de la trayectoria que la propia administración destaca en su web."
          tone="gold"
        >
          <div className="flex flex-col gap-4">
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Según su sección oficial “Quiénes somos”, Lotería Manises acumula más de dos décadas de trayectoria, se ha consolidado como una administración de referencia y vincula su nombre a algunos de los grandes hitos de la Lotería de Navidad.
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl border border-border/60 bg-muted/20 px-3 py-3 text-center">
                <p className="text-lg font-black text-manises-blue">20+</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">años</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 px-3 py-3 text-center">
                <p className="text-lg font-black text-manises-blue">3ª</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">ventas España</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 px-3 py-3 text-center">
                <p className="text-lg font-black text-manises-blue">1ª</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Com. Valenciana</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
              <ul className="space-y-2 text-[12px] leading-relaxed text-muted-foreground">
                <li>La web oficial destaca más de 350 millones de euros repartidos en premios.</li>
                <li>Manises figura allí como la población que más veces ha repartido el Gordo de Navidad: 1971, 1986, 2012, 2013, 2018, 2022 y 2023.</li>
                <li>La evolución del negocio pasa de un local pequeño a una operativa digital con miles de apuestas gestionadas semanalmente.</li>
              </ul>
            </div>

            <PremiumActionRow
              icon={Users}
              title="Ver historia completa"
              description="Abrir la sección oficial “Quiénes somos”"
              onClick={() => openExternal(officialLinks.whoWeAre)}
              tone="gold"
              badge="Oficial"
            />
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard
          eyebrow="Cobro"
          title="Pago de premios"
          description="Resumen práctico de validación, abono, plazos y fiscalidad basado en la página oficial “Pagos y premios”."
          tone="blue"
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-manises-blue/70">Cómo se validan y abonan</p>
              <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-muted-foreground">
                <li>Tras cada sorteo realizan el escrutinio y asignan el premio al saldo virtual del usuario.</li>
                <li>Ese saldo puede reutilizarse para nuevas compras o retirarse a la cuenta bancaria indicada en la cuenta del cliente.</li>
                <li>La web indica que las retiradas nacionales no tienen coste de transferencia.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-manises-blue/70">Si el premio es mayor</p>
              <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-muted-foreground">
                <li>Para importes superiores a 2.000 € pueden solicitar NIF, NIE o pasaporte y certificado de titularidad bancaria.</li>
                <li>La página también informa de documentación notarial de representación para gestionar determinados cobros.</li>
                <li>Los premios de más de 40.000 € aparecen sujetos al gravamen del 20% sobre el tramo que excede el mínimo exento.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3">
              <p className="text-[11px] font-semibold leading-relaxed text-amber-900">
                Si recargas saldo por transferencia, el abono puede tardar hasta 72 horas en reflejarse en la cuenta virtual.
              </p>
            </div>

            <PremiumActionRow
              icon={Trophy}
              title="Ver texto oficial de premios y pagos"
              description="Formas de pago, saldo virtual y cobro de premios"
              onClick={() => openExternal(officialLinks.prizes)}
              tone="blue"
              badge="Oficial"
            />
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard
          eyebrow="FAQ"
          title="Preguntas frecuentes"
          description="Selección breve de dudas reales publicadas por Lotería Manises, adaptadas a lectura móvil."
        >
          <div className="flex flex-col gap-2">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-border/60 bg-muted/20 px-4 py-3"
              >
                <summary className="cursor-pointer list-none pr-6 text-[13px] font-semibold leading-relaxed text-manises-blue marker:hidden">
                  {item.question}
                </summary>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{item.answer}</p>
              </details>
            ))}
            <PremiumActionRow
              icon={HelpCircle}
              title="Abrir FAQ completa"
              description="Más preguntas sobre cuenta, pagos, jugadas y envíos"
              onClick={() => openExternal(officialLinks.faq)}
              badge="Oficial"
            />
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard
          eyebrow="Compromiso"
          title="Juego responsable"
          description="Consejos claros y directos basados en la guía de juego responsable de la web oficial."
          tone="emerald"
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3">
              <div className="flex items-start gap-3">
                <Ban className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" />
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.18em] text-rose-700">+18 · Prohibido a menores</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-rose-900">
                    El juego debe ser entretenimiento. Si deja de serlo, toca parar.
                  </p>
                </div>
              </div>
            </div>

            <ul className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 px-4 py-4 text-[12px] leading-relaxed text-muted-foreground">
              <li>No gastes más dinero del que te puedes permitir.</li>
              <li>Márcate un presupuesto antes de jugar y respétalo.</li>
              <li>No intentes recuperar pérdidas volviendo a jugar.</li>
              <li>No pidas dinero a otras personas para destinarlo al juego.</li>
              <li>Si te genera ansiedad, estrés o problemas familiares, deja de jugar y busca ayuda.</li>
            </ul>

            <PremiumActionRow
              icon={ShieldCheck}
              title="Leer guía oficial de juego responsable"
              description="Consejos completos publicados por Lotería Manises"
              onClick={() => openExternal(officialLinks.responsibleGaming)}
              tone="emerald"
              badge="Oficial"
            />
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard
          eyebrow="Contacto"
          title="Cómo hablar con Lotería Manises"
          description="Datos visibles en el footer oficial y accesos directos pensados para móvil."
          tone="blue"
        >
          <div className="flex flex-col gap-4">
            <div className="grid gap-2.5">
              <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Dirección</p>
                <p className="mt-1 text-[13px] font-semibold text-manises-blue">Avda. dels Tramvies, 12</p>
                <p className="text-[12px] text-muted-foreground">46940 Manises, Valencia</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Teléfono</p>
                <p className="mt-1 text-[13px] font-semibold text-manises-blue">960 992 556</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Email</p>
                <p className="mt-1 text-[13px] font-semibold text-manises-blue">info@loteriamanises.com</p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {contactActions.map((action) => (
                <PremiumActionRow
                  key={action.title}
                  icon={action.icon}
                  title={action.title}
                  description={action.description}
                  onClick={action.onClick}
                  tone={action.tone}
                />
              ))}
            </div>
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard
          eyebrow="Transparencia"
          title="Aviso legal, privacidad y condiciones"
          description="Resumen corto para leer en la app y acceso al texto completo oficial cuando necesites el detalle jurídico."
        >
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[13px] font-black text-manises-blue">Aviso legal</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    El titular identificado en la web es <span className="font-semibold text-manises-blue">LOTERÍA MANISES, S.L.</span>, punto oficial de venta de SELAE.
                  </p>
                </div>
                <Scale className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
              <ul className="mt-3 space-y-1.5 text-[12px] leading-relaxed text-muted-foreground">
                <li>CIF: B98483522.</li>
                <li>Administración 461630003 · Receptor 81980.</li>
                <li>Regula acceso, navegación y uso del sitio web.</li>
              </ul>
              <PremiumActionRow
                icon={ExternalLink}
                title="Ver texto completo"
                onClick={() => openExternal(officialLinks.legalNotice)}
                className="mt-2 px-0"
              />
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[13px] font-black text-manises-blue">Política de privacidad</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    La política se apoya en el RGPD y explica cómo tratan datos para gestionar solicitudes, jugadas, premios y comunicaciones del servicio.
                  </p>
                </div>
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
              <ul className="mt-3 space-y-1.5 text-[12px] leading-relaxed text-muted-foreground">
                <li>Finalidades: atención al usuario, relación contractual y seguridad del ciclo de vida de las jugadas.</li>
                <li>Derechos: acceso, rectificación, supresión, limitación, oposición y portabilidad.</li>
                <li>Incluye referencia a conservación, base legal y comunicación de datos cuando proceda.</li>
              </ul>
              <PremiumActionRow
                icon={ExternalLink}
                title="Ver texto completo"
                onClick={() => openExternal(officialLinks.privacy)}
                className="mt-2 px-0"
              />
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[13px] font-black text-manises-blue">Condiciones generales</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    La web define la relación con el cliente como una gestión comercial privada para tramitar jugadas oficiales, equivalente a la compra en administración física.
                  </p>
                </div>
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
              <ul className="mt-3 space-y-1.5 text-[12px] leading-relaxed text-muted-foreground">
                <li>No se presenta como juego virtual, sino como canal de gestión de jugadas oficiales.</li>
                <li>Todos los formatos oficiales vendidos por la administración son válidos.</li>
                <li>Las compras online mantienen consecuencias jurídicas equivalentes a las del punto de venta físico.</li>
              </ul>
              <PremiumActionRow
                icon={ExternalLink}
                title="Ver texto completo"
                onClick={() => openExternal(officialLinks.conditions)}
                className="mt-2 px-0"
              />
            </div>
          </div>
        </PremiumSectionCard>

        <div className="space-y-1 pb-8 pt-4 text-center opacity-40">
          <p className="text-[10px] font-bold uppercase tracking-widest text-manises-blue">Lotería Manises</p>
          <p className="text-[9px] font-medium">Receptor Oficial 81980 · Admon. nº 3</p>
        </div>
      </div>
    </div>
  );
}
