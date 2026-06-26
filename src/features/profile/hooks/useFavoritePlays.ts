import { useEffect, useMemo, useState } from 'react';
import { MOCK_FAVORITE_PLAYS } from '@/features/profile/data/profile.mock';
import type { FavoritePlay } from '@/features/profile/types/profile.types';

const STORAGE_KEY = 'manises_profile_favorite_plays_v1';

function readFavorites(): FavoritePlay[] {
  if (typeof window === 'undefined') {
    return MOCK_FAVORITE_PLAYS;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return MOCK_FAVORITE_PLAYS;
  }

  try {
    const parsed = JSON.parse(saved) as FavoritePlay[];
    return parsed.length > 0 ? parsed : MOCK_FAVORITE_PLAYS;
  } catch {
    return MOCK_FAVORITE_PLAYS;
  }
}

export function useFavoritePlays() {
  const [favorites, setFavorites] = useState<FavoritePlay[]>(() => readFavorites());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const favoriteCount = favorites.length;

  const actions = useMemo(() => ({
    renameFavorite: (favoriteId: string, title: string) => {
      setFavorites((current) => current.map((item) => (
        item.id === favoriteId ? { ...item, title } : item
      )));
    },
    removeFavorite: (favoriteId: string) => {
      setFavorites((current) => current.filter((item) => item.id !== favoriteId));
    },
    getFavoriteById: (favoriteId: string) => favorites.find((item) => item.id === favoriteId),
  }), [favorites]);

  return {
    favorites,
    favoriteCount,
    ...actions,
  };
}
