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
    id: 'ann-premio-abr26',
    type: 'prize',
    title: 'Premio entregado',
    body: '¡Enhorabuena a nuestros clientes! Consulta los últimos premios repartidos en tu administración de Manises.',
    cta: { label: 'Ver premios', href: '/premios-entregados' },
  },
];
