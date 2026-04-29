import type { NationalCartLine } from '../contracts/national-play.contract';

export const NATIONAL_CART_DEMO_LINES: NationalCartLine[] = [
  {
    number: '69844',
    drawId: 'jueves',
    drawLabel: 'Jueves',
    drawDates: ['2026-05-07T19:00:00.000Z'],
    quantity: 2,
    unitPrice: 3,
    totalPrice: 6,
    deliveryMode: 'custody',
  },
  {
    number: '15432',
    drawId: 'sabado',
    drawLabel: 'Sábado',
    drawDates: ['2026-05-09T11:00:00.000Z', '2026-05-16T11:00:00.000Z'],
    quantity: 1,
    unitPrice: 6,
    totalPrice: 12,
    deliveryMode: 'custody',
  },
];
