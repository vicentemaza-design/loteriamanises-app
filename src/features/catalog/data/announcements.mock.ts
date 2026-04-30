export interface Announcement {
  id: string;
  type: 'news' | 'prize' | 'reminder';
  title: string;
  body: string;
  cta?: { label: string; href: string };
}

// Deja este array vacío para ocultar el banner completamente
export const MOCK_ANNOUNCEMENTS: Announcement[] = [];
