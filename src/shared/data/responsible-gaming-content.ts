import { PhoneCall, ShieldAlert, ShieldCheck, Scale } from 'lucide-react';
import type { ComponentType } from 'react';

export interface ResponsibleGamingSection {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  blocks: readonly string[];
}

/**
 * Shared informational content — reused by the authenticated resource page
 * (ResponsibleGamingResourcePage.tsx, under /profile/gaming-control/:sectionId)
 * and the public page (JuegoResponsablePage.tsx, under /legal/juego-responsable)
 * so the same text only exists once. Purely informational (no account data),
 * safe to show without a session.
 */
export const RESPONSIBLE_GAMING_CONTENT = {
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
} as const satisfies Record<string, ResponsibleGamingSection>;

export type ResponsibleGamingSectionId = keyof typeof RESPONSIBLE_GAMING_CONTENT;
