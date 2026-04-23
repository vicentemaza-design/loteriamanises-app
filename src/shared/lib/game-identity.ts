import type { LotteryGame } from '@/shared/types/domain';

export interface GameIdentity {
  shortName: string;
  badgeLabel: string;
  surfaceTint: string;
  chipBackground: string;
  chipText: string;
}

const GAME_IDENTITY_MAP: Record<string, GameIdentity> = {
  euromillones: {
    shortName: 'Euromillones',
    badgeLabel: 'EURO',
    surfaceTint: 'rgba(37,99,235,0.14)',
    chipBackground: 'rgba(191,219,254,0.94)',
    chipText: '#1d4ed8',
  },
  primitiva: {
    shortName: 'Primitiva',
    badgeLabel: 'PRIM',
    surfaceTint: 'rgba(22,163,74,0.15)',
    chipBackground: 'rgba(220,252,231,0.96)',
    chipText: '#166534',
  },
  bonoloto: {
    shortName: 'Bonoloto',
    badgeLabel: 'BONO',
    surfaceTint: 'rgba(8,145,178,0.15)',
    chipBackground: 'rgba(207,250,254,0.96)',
    chipText: '#0f766e',
  },
  gordo: {
    shortName: 'El Gordo',
    badgeLabel: 'GORDO',
    surfaceTint: 'rgba(234,88,12,0.16)',
    chipBackground: 'rgba(255,237,213,0.96)',
    chipText: '#c2410c',
  },
  eurodreams: {
    shortName: 'EuroDreams',
    badgeLabel: 'DREAM',
    surfaceTint: 'rgba(124,58,237,0.14)',
    chipBackground: 'rgba(237,233,254,0.96)',
    chipText: '#6d28d9',
  },
  quiniela: {
    shortName: 'Quiniela',
    badgeLabel: '1X2',
    surfaceTint: 'rgba(220,38,38,0.14)',
    chipBackground: 'rgba(254,226,226,0.96)',
    chipText: '#b91c1c',
  },
  'loteria-nacional-jueves': {
    shortName: 'Lotería Jueves',
    badgeLabel: 'JUE',
    surfaceTint: 'rgba(10,71,146,0.15)',
    chipBackground: 'rgba(219,234,254,0.96)',
    chipText: '#0a4792',
  },
  'loteria-nacional-sabado': {
    shortName: 'Lotería Sábado',
    badgeLabel: 'SAB',
    surfaceTint: 'rgba(21,94,117,0.16)',
    chipBackground: 'rgba(204,251,241,0.96)',
    chipText: '#155e75',
  },
  'loteria-navidad': {
    shortName: 'Navidad',
    badgeLabel: 'NAV',
    surfaceTint: 'rgba(153,27,27,0.16)',
    chipBackground: 'rgba(254,226,226,0.96)',
    chipText: '#991b1b',
  },
  'loteria-nino': {
    shortName: 'Niño',
    badgeLabel: 'NIÑO',
    surfaceTint: 'rgba(30,64,175,0.15)',
    chipBackground: 'rgba(219,234,254,0.96)',
    chipText: '#1d4ed8',
  },
};

const GAME_TYPE_FALLBACKS: Partial<Record<LotteryGame['type'], GameIdentity>> = {
  'loteria-nacional': GAME_IDENTITY_MAP['loteria-nacional-jueves'],
  navidad: GAME_IDENTITY_MAP['loteria-navidad'],
  nino: GAME_IDENTITY_MAP['loteria-nino'],
};

export function getGameIdentity(game: Pick<LotteryGame, 'id' | 'type' | 'name'>): GameIdentity {
  return GAME_IDENTITY_MAP[game.id] ?? GAME_TYPE_FALLBACKS[game.type] ?? {
    shortName: game.name,
    badgeLabel: game.name.slice(0, 4).toUpperCase(),
    surfaceTint: 'rgba(15,23,42,0.08)',
    chipBackground: 'rgba(241,245,249,0.96)',
    chipText: '#0f172a',
  };
}
