import { useMemo } from 'react';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import type { LotteryGame } from '@/shared/types/domain';
import { getCountdown } from '@/shared/lib/utils';

/**
 * Hook: useLotteryGames
 * 
 * ⚠️ BACKEND INTEGRATION POINT:
 * Actualmente retorna datos locales (LOTTERY_GAMES).
 * Para conectar con el backend, reemplazar la lógica por:
 * 
 *   const { data, loading, error } = useQuery('/api/games');
 *   return { games: data, featuredGame: data?.[0], todayGames: ..., upcomingGames: ... }
 * 
 * La interfaz que exporta este hook NO cambia — las páginas no necesitarán modificarse.
 */
export function useLotteryGames() {
  const games = LOTTERY_GAMES;

  const { featuredGame, todayGames, upcomingGames } = useMemo(() => {
    const featured = games.find(g => g.id === 'euromillones') ?? games[0];
    
    const today = games.filter(g => {
      const cd = getCountdown(g.nextDraw);
      return cd.days === 0 && !cd.isPast;
    });

    const upcoming = games.filter(g => {
      const cd = getCountdown(g.nextDraw);
      return cd.days > 0 || (cd.days === 0 && !cd.isPast);
    });

    return { featuredGame: featured, todayGames: today, upcomingGames: upcoming };
  }, [games]);

  return {
    /** Todos los juegos disponibles */
    games,
    /** Juego destacado en el Hero (actualmente Euromillones) */
    featuredGame,
    /** Juegos con sorteo hoy */
    todayGames,
    /** Todos los juegos con sorteo futuro, ordenados por fecha */
    upcomingGames,
  };
}
