export interface Announcement {
  id: string;
  type: 'news' | 'prize' | 'reminder';
  title: string;
  body: string;
  cta?: { label: string; href: string };
}

// Deja este array vacío para ocultar el banner completamente
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-premio-mar25',
    type: 'prize',
    title: '¡Premio entregado en Manises!',
    body: 'Un décimo vendido en nuestra administración ha ganado 300.000 €.',
    cta: { label: 'Ver historial', href: '/premios-entregados' },
  },
];
