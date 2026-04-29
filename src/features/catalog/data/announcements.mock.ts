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
    title: 'Premios destacados',
    body: 'Contenido informativo demo con accesos rápidos a premios entregados y avisos de campaña.',
    cta: { label: 'Ver historial', href: '/premios-entregados' },
  },
  {
    id: 'ann-recordatorio-demo',
    type: 'reminder',
    title: 'Aviso demo',
    body: 'Los avisos mostrados en esta sección son informativos y pendientes de integración dinámica.',
  },
];
