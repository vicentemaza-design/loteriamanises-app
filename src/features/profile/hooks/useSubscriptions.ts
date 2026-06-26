import { useEffect, useMemo, useState } from 'react';
import {
  buildReservationFromTemplate,
  getNextReservationForNumber,
  getReservationAmount,
  readSubscriptionsState,
  writeSubscriptionsState,
  type ReservedLotteryNumber,
  type SubscriptionDrawType,
  type SubscriptionReservation,
} from '@/features/profile/data/subscriptionsDemo';

function sortReservations(reservations: SubscriptionReservation[]) {
  return [...reservations].sort((a, b) => a.drawDate.localeCompare(b.drawDate));
}

export function useSubscriptions() {
  const [state, setState] = useState(readSubscriptionsState);

  useEffect(() => {
    writeSubscriptionsState(state);
  }, [state]);

  const reservations = useMemo(() => sortReservations(state.reservations), [state.reservations]);
  const numbers = useMemo(
    () => [...state.numbers].sort((a, b) => a.number.localeCompare(b.number)),
    [state.numbers]
  );

  const pendingCount = reservations.length;

  const groupedReservations = useMemo(() => {
    const groups = new Map<string, {
      id: string;
      drawLabel: string;
      drawDate: string;
      drawType: SubscriptionDrawType;
      lines: SubscriptionReservation[];
    }>();

    reservations.forEach((reservation) => {
      const key = `${reservation.drawLabel}-${reservation.drawDate}`;
      const group = groups.get(key);
      if (group) {
        group.lines.push(reservation);
        return;
      }

      groups.set(key, {
        id: key,
        drawLabel: reservation.drawLabel,
        drawDate: reservation.drawDate,
        drawType: reservation.drawType,
        lines: [reservation],
      });
    });

    return [...groups.values()].map((group) => ({
      ...group,
      lines: group.lines.sort((a, b) => a.number.localeCompare(b.number)),
      total: group.lines.reduce((sum, line) => sum + getReservationAmount(line), 0),
    }));
  }, [reservations]);

  const getNumberById = (subscriptionId: string) => numbers.find((item) => item.id === subscriptionId);

  const getReservationsForNumber = (subscriptionId: string) => (
    reservations.filter((item) => item.subscriptionId === subscriptionId)
  );

  const getUpcomingReservation = (subscriptionId: string) => (
    getNextReservationForNumber(reservations, subscriptionId)
  );

  const markReservationsAsPaid = (reservationIds: string[]) => {
    setState((current) => ({
      ...current,
      reservations: current.reservations.filter((item) => !reservationIds.includes(item.id)),
    }));
  };

  const updateNumber = (subscriptionId: string, updater: (item: ReservedLotteryNumber) => ReservedLotteryNumber) => {
    setState((current) => ({
      ...current,
      numbers: current.numbers.map((item) => item.id === subscriptionId ? updater(item) : item),
    }));
  };

  const saveNumberConfiguration = (
    subscriptionId: string,
    quantity: number,
    drawTypes: SubscriptionDrawType[]
  ) => {
    setState((current) => {
      const subscription = current.numbers.find((item) => item.id === subscriptionId);
      if (!subscription) {
        return current;
      }

      const nextNumbers = current.numbers.map((item) => (
        item.id === subscriptionId
          ? {
              ...item,
              quantity,
              drawTypes,
              status: drawTypes.length > 0 ? 'active' : 'inactive',
            }
          : item
      ));

      let nextReservations = current.reservations
        .filter((item) => item.subscriptionId !== subscriptionId || drawTypes.includes(item.drawType))
        .map((item) => item.subscriptionId === subscriptionId ? { ...item, quantity } : item);

      drawTypes.forEach((drawType) => {
        const hasReservation = nextReservations.some((item) => (
          item.subscriptionId === subscriptionId && item.drawType === drawType
        ));

        if (!hasReservation) {
          const created = buildReservationFromTemplate(
            subscriptionId,
            subscription.number,
            quantity,
            drawType,
            nextReservations
          );
          if (created) {
            nextReservations = [...nextReservations, created];
          }
        }
      });

      return {
        numbers: nextNumbers,
        reservations: nextReservations,
      };
    });
  };

  const cancelSubscription = (subscriptionId: string) => {
    setState((current) => ({
      numbers: current.numbers.map((item) => item.id === subscriptionId ? { ...item, status: 'inactive' } : item),
      reservations: current.reservations.filter((item) => item.subscriptionId !== subscriptionId),
    }));
  };

  const reactivateSubscription = (subscriptionId: string) => {
    setState((current) => {
      const subscription = current.numbers.find((item) => item.id === subscriptionId);
      if (!subscription) {
        return current;
      }

      let nextReservations = [...current.reservations];
      subscription.drawTypes.forEach((drawType) => {
        const created = buildReservationFromTemplate(
          subscriptionId,
          subscription.number,
          subscription.quantity,
          drawType,
          nextReservations
        );
        if (created) {
          nextReservations = [...nextReservations, created];
        }
      });

      return {
        numbers: current.numbers.map((item) => (
          item.id === subscriptionId ? { ...item, status: 'active' } : item
        )),
        reservations: nextReservations,
      };
    });
  };

  return {
    numbers,
    reservations,
    groupedReservations,
    pendingCount,
    getNumberById,
    getReservationsForNumber,
    getUpcomingReservation,
    markReservationsAsPaid,
    saveNumberConfiguration,
    cancelSubscription,
    reactivateSubscription,
    updateNumber,
  };
}
