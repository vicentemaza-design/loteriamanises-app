export type SubscriptionDrawType = 'JUE' | 'SÁB' | 'NAV' | 'NIÑ';

export interface SubscriptionReservation {
  id: string;
  subscriptionId: string;
  drawType: SubscriptionDrawType;
  drawLabel: string;
  drawDate: string;
  number: string;
  quantity: number;
  unitPrice: number;
}

export interface ReservedLotteryNumber {
  id: string;
  number: string;
  quantity: number;
  drawTypes: SubscriptionDrawType[];
  status: 'active' | 'inactive';
}

export interface SubscriptionsState {
  numbers: ReservedLotteryNumber[];
  reservations: SubscriptionReservation[];
}

const STORAGE_KEY = 'manises_subscriptions_demo_v3';

const INITIAL_STATE: SubscriptionsState = {
  numbers: [
    { id: 'sub-49869', number: '49869', quantity: 2, drawTypes: ['JUE', 'SÁB', 'NAV'], status: 'active' },
    { id: 'sub-09269', number: '09269', quantity: 1, drawTypes: ['SÁB', 'NAV'], status: 'active' },
    { id: 'sub-31542', number: '31542', quantity: 3, drawTypes: ['JUE', 'SÁB'], status: 'active' },
    { id: 'sub-90877', number: '90877', quantity: 1, drawTypes: ['NAV'], status: 'inactive' },
  ],
  reservations: [
    { id: 'res-35-49869', subscriptionId: 'sub-49869', drawType: 'JUE', drawLabel: 'SORTEO 35', drawDate: '2026-06-30T21:00:00.000Z', number: '49869', quantity: 2, unitPrice: 3 },
    { id: 'res-35-09269', subscriptionId: 'sub-09269', drawType: 'JUE', drawLabel: 'SORTEO 35', drawDate: '2026-06-30T21:00:00.000Z', number: '09269', quantity: 1, unitPrice: 3 },
    { id: 'res-35-31542', subscriptionId: 'sub-31542', drawType: 'JUE', drawLabel: 'SORTEO 35', drawDate: '2026-06-30T21:00:00.000Z', number: '31542', quantity: 3, unitPrice: 3 },
    { id: 'res-36-49869', subscriptionId: 'sub-49869', drawType: 'SÁB', drawLabel: 'SORTEO 36', drawDate: '2026-07-02T13:00:00.000Z', number: '49869', quantity: 2, unitPrice: 3 },
    { id: 'res-36-09269', subscriptionId: 'sub-09269', drawType: 'SÁB', drawLabel: 'SORTEO 36', drawDate: '2026-07-02T13:00:00.000Z', number: '09269', quantity: 1, unitPrice: 3 },
    { id: 'res-36-31542', subscriptionId: 'sub-31542', drawType: 'SÁB', drawLabel: 'SORTEO 36', drawDate: '2026-07-02T13:00:00.000Z', number: '31542', quantity: 3, unitPrice: 3 },
    { id: 'res-37-49869', subscriptionId: 'sub-49869', drawType: 'JUE', drawLabel: 'SORTEO 37', drawDate: '2026-07-07T21:00:00.000Z', number: '49869', quantity: 2, unitPrice: 3 },
    { id: 'res-37-31542', subscriptionId: 'sub-31542', drawType: 'JUE', drawLabel: 'SORTEO 37', drawDate: '2026-07-07T21:00:00.000Z', number: '31542', quantity: 3, unitPrice: 3 },
    { id: 'res-nav-49869', subscriptionId: 'sub-49869', drawType: 'NAV', drawLabel: 'NAVIDAD', drawDate: '2026-12-22T09:00:00.000Z', number: '49869', quantity: 2, unitPrice: 20 },
    { id: 'res-nav-09269', subscriptionId: 'sub-09269', drawType: 'NAV', drawLabel: 'NAVIDAD', drawDate: '2026-12-22T09:00:00.000Z', number: '09269', quantity: 1, unitPrice: 20 },
  ],
};

const DRAW_TEMPLATES: Record<SubscriptionDrawType, Array<{ drawLabel: string; drawDate: string; unitPrice: number }>> = {
  JUE: [
    { drawLabel: 'SORTEO 38', drawDate: '2026-07-09T21:00:00.000Z', unitPrice: 3 },
    { drawLabel: 'SORTEO 40', drawDate: '2026-07-16T21:00:00.000Z', unitPrice: 3 },
  ],
  'SÁB': [
    { drawLabel: 'SORTEO 39', drawDate: '2026-07-11T13:00:00.000Z', unitPrice: 3 },
    { drawLabel: 'SORTEO 41', drawDate: '2026-07-18T13:00:00.000Z', unitPrice: 3 },
  ],
  NAV: [
    { drawLabel: 'NAVIDAD', drawDate: '2026-12-22T09:00:00.000Z', unitPrice: 20 },
  ],
  'NIÑ': [
    { drawLabel: 'NIÑO', drawDate: '2027-01-06T09:00:00.000Z', unitPrice: 20 },
  ],
};

function cloneState(state: SubscriptionsState): SubscriptionsState {
  return {
    numbers: state.numbers.map((item) => ({ ...item, drawTypes: [...item.drawTypes] })),
    reservations: state.reservations.map((item) => ({ ...item })),
  };
}

export function getReservationAmount(reservation: SubscriptionReservation) {
  return reservation.quantity * reservation.unitPrice;
}

export function getDrawTypeLabel(drawType: SubscriptionDrawType) {
  return drawType;
}

export function readSubscriptionsState(): SubscriptionsState {
  if (typeof window === 'undefined') {
    return cloneState(INITIAL_STATE);
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return cloneState(INITIAL_STATE);
  }

  try {
    const parsed = JSON.parse(stored) as SubscriptionsState;
    return {
      numbers: Array.isArray(parsed.numbers) ? parsed.numbers : cloneState(INITIAL_STATE).numbers,
      reservations: Array.isArray(parsed.reservations) ? parsed.reservations : cloneState(INITIAL_STATE).reservations,
    };
  } catch {
    return cloneState(INITIAL_STATE);
  }
}

export function writeSubscriptionsState(state: SubscriptionsState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getNextReservationForNumber(
  reservations: SubscriptionReservation[],
  subscriptionId: string
) {
  return [...reservations]
    .filter((item) => item.subscriptionId === subscriptionId)
    .sort((a, b) => a.drawDate.localeCompare(b.drawDate))[0];
}

export function buildReservationFromTemplate(
  subscriptionId: string,
  number: string,
  quantity: number,
  drawType: SubscriptionDrawType,
  existingReservations: SubscriptionReservation[]
): SubscriptionReservation | null {
  const template = DRAW_TEMPLATES[drawType].find((item) => (
    !existingReservations.some((reservation) => (
      reservation.subscriptionId === subscriptionId &&
      reservation.drawType === drawType &&
      reservation.drawDate === item.drawDate
    ))
  ));

  if (!template) {
    return null;
  }

  return {
    id: `res-${subscriptionId}-${drawType}-${template.drawDate}`,
    subscriptionId,
    drawType,
    drawLabel: template.drawLabel,
    drawDate: template.drawDate,
    number,
    quantity,
    unitPrice: template.unitPrice,
  };
}
