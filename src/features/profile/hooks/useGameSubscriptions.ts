import { useEffect, useMemo, useState } from 'react';
import { MOCK_GAME_SUBSCRIPTIONS } from '@/features/profile/data/profile.mock';
import type { GameSubscription } from '@/features/profile/types/profile.types';

const STORAGE_KEY = 'manises_profile_game_subscriptions_v2';

function readSubscriptions(): GameSubscription[] {
  if (typeof window === 'undefined') {
    return MOCK_GAME_SUBSCRIPTIONS;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return MOCK_GAME_SUBSCRIPTIONS;
  }

  try {
    const parsed = JSON.parse(saved) as GameSubscription[];
    return parsed.length > 0 ? parsed : MOCK_GAME_SUBSCRIPTIONS;
  } catch {
    return MOCK_GAME_SUBSCRIPTIONS;
  }
}

export function useGameSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<GameSubscription[]>(() => readSubscriptions());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  }, [subscriptions]);

  const activeSubscriptions = subscriptions.filter((item) => item.status === 'active');

  const actions = useMemo(() => ({
    getSubscriptionById: (subscriptionId: string) => subscriptions.find((item) => item.id === subscriptionId),
    cancelSubscription: (subscriptionId: string) => {
      setSubscriptions((current) => current.map((item) => (
        item.id === subscriptionId ? { ...item, status: 'pending-cancel' } : item
      )));
    },
  }), [subscriptions]);

  return {
    subscriptions,
    activeCount: activeSubscriptions.length,
    ...actions,
  };
}
