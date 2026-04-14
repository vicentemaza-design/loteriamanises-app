import type { LotteryGame } from '@/shared/types/domain';

function withAlpha(hex: string, alpha: string) {
  return `${hex}${alpha}`;
}

export function getGameTheme(game: LotteryGame) {
  return {
    gradient: `linear-gradient(135deg, ${game.color}, ${game.colorEnd ?? game.color})`,
    surface: {
      backgroundColor: withAlpha(game.color, '08'),
      borderColor: withAlpha(game.color, '18'),
    },
    surfaceStrong: {
      backgroundColor: withAlpha(game.color, '12'),
      borderColor: withAlpha(game.color, '28'),
    },
    chip: {
      backgroundColor: withAlpha(game.color, '16'),
      color: game.color,
      borderColor: withAlpha(game.color, '26'),
    },
    title: {
      color: game.color,
    },
    subtleText: {
      color: withAlpha(game.color, 'cc'),
    },
    selectedNumber: {
      backgroundColor: game.color,
      borderColor: game.color,
      color: '#ffffff',
    },
    selectedAccent: {
      backgroundColor: game.color,
      color: '#ffffff',
      boxShadow: `0 10px 24px ${withAlpha(game.color, '33')}`,
    },
    cta: {
      backgroundColor: game.color,
      color: '#ffffff',
      boxShadow: `0 10px 24px ${withAlpha(game.color, '30')}`,
    },
  };
}
