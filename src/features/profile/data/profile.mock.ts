import type {
  ProfileMovement,
  GameSubscription,
  FavoritePlay,
  PaymentCard,
  BankAccount,
  BiometricSettings,
  NotificationPreferences,
  ResponsibleGamingSettings,
  DeliveredPrize,
} from '../types/profile.types';

// ── MOVIMIENTOS ECONÓMICOS ───────────────────────────────────────────
export const MOCK_PROFILE_MOVEMENTS: ProfileMovement[] = [
  {
    id: 'tx-101',
    createdAt: new Date().toISOString(),
    type: 'prize',
    amount: 15.00,
    balanceAfter: 47.50,
    description: 'Premio Bonoloto',
    orderId: 'LN-983120',
    details: {
      gameId: 'bonoloto',
      gameLabel: 'Bonoloto',
      combinations: ['03 14 22 35 44 49'],
    }
  },
  {
    id: 'tx-102',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), // Hace 3 horas
    type: 'bet',
    amount: -6.00,
    balanceAfter: 32.50,
    description: 'Compra Lotería Nacional Jueves',
    orderId: 'LN-983055',
    details: {
      gameId: 'loteria-nacional',
      gameLabel: 'Lotería Nacional',
      number: '31425',
      quantity: 2,
      deliveryMode: 'custody',
    }
  },
  {
    id: 'tx-103',
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(), // Hace 1.5 días
    type: 'withdrawal',
    amount: -128.00,
    balanceAfter: 38.50,
    description: 'Retirada de saldo por transferencia',
    orderId: 'WD-00912',
    details: {
      iban: 'ES12 **** **** **** 7890',
      bankName: 'Banco Sabadell',
      recipientName: 'Juan Pérez Demo',
    }
  },
  {
    id: 'tx-104',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // Hace 3 días
    type: 'deposit',
    amount: 50.00,
    balanceAfter: 166.50,
    description: 'Recarga Apple Pay',
  },
  {
    id: 'tx-105',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // Hace 5 días
    type: 'bet',
    amount: -11.00,
    balanceAfter: 116.50,
    description: 'Compra Lotería Nacional Sábado',
    orderId: 'LN-981022',
    details: {
      gameId: 'loteria-nacional',
      gameLabel: 'Lotería Nacional',
      number: '15432',
      quantity: 1,
      shippingCost: 5.00,
      deliveryMode: 'shipping',
    }
  },
  {
    id: 'tx-106',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    type: 'bet',
    amount: -2.50,
    balanceAfter: 127.50,
    description: 'Apuesta Euromillones',
    orderId: 'LN-980011',
    details: {
      gameId: 'euromillones',
      gameLabel: 'Euromillones',
      combinations: ['07 18 29 40 48 + 02 09'],
    }
  }
];

// ── ABONOS DE JUEGOS AUTOMÁTICOS (NO LOTERÍA NACIONAL) ─────────────────
export const MOCK_GAME_SUBSCRIPTIONS: GameSubscription[] = [
  {
    id: 'sub-game-01',
    gameId: 'euromillones',
    gameName: 'Euromillones',
    betsCount: 1,
    nextChargeDate: new Date(Date.now() + 86400000 * 2).toISOString(), // En 2 días
    amount: 2.50,
    status: 'active',
    combinations: [
      { numbers: [7, 14, 23, 38, 47], stars: [3, 9] }
    ]
  },
  {
    id: 'sub-game-02',
    gameId: 'primitiva',
    gameName: 'La Primitiva',
    betsCount: 2,
    nextChargeDate: new Date(Date.now() + 86400000 * 4).toISOString(), // En 4 días
    amount: 2.00,
    status: 'active',
    combinations: [
      { numbers: [5, 12, 21, 30, 44, 49] },
      { numbers: [2, 18, 25, 33, 40, 47] }
    ]
  }
];

// ── JUGADAS FAVORITAS ────────────────────────────────────────────────
export const MOCK_FAVORITE_PLAYS: FavoritePlay[] = [
  {
    id: 'fav-game-01',
    gameId: 'euromillones',
    title: 'Bote Europeo',
    numbersLabel: '07 · 14 · 23 · 38 · 47 + 03 · 09',
    frequency: 'Cada Martes y Viernes',
    budgetLabel: '2,50 EUR por sorteo',
    betsCount: 1,
    combinations: [
      { numbers: [7, 14, 23, 38, 47], stars: [3, 9] }
    ]
  },
  {
    id: 'fav-game-02',
    gameId: 'primitiva',
    title: 'Mis Números Familiares',
    numbersLabel: '05 · 12 · 21 · 30 · 44 · 49',
    frequency: 'Cada Jueves y Sábado',
    budgetLabel: '1,00 EUR por sorteo',
    betsCount: 1,
    combinations: [
      { numbers: [5, 12, 21, 30, 44, 49] }
    ]
  }
];

// ── MÉTODOS DE PAGO ──────────────────────────────────────────────────
export const MOCK_PAYMENT_CARDS: PaymentCard[] = [
  { id: 'card-1', brand: 'Visa', last4: '4242', expires: '12/28', isDefault: true },
  { id: 'card-2', brand: 'Mastercard', last4: '5511', expires: '09/25', isDefault: false },
];

export const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  { id: 'bank-1', iban: 'ES12 **** **** **** 7890', bank: 'Banco Sabadell', alias: 'Cuenta Principal', holderName: 'Juan Pérez Demo', isDefault: true },
];

// ── BIOMETRÍA ────────────────────────────────────────────────────────
export const MOCK_BIOMETRIC_SETTINGS: BiometricSettings = {
  available: true,
  enabled: false,
};

// ── PREFERENCIAS DE NOTIFICACIÓN ─────────────────────────────────────
export const MOCK_NOTIFICATION_PREFS: NotificationPreferences = {
  push: {
    account: true,
    results: true,
    jackpots: false,
  },
  email: {
    account: true,
    marketing: true,
  },
  games: {
    'bonoloto': true,
    'primitiva': true,
    'euromillones': true,
    'gordo': false,
    'loteria-nacional': true,
    'navidad-nino': true,
  }
};

// ── JUEGO RESPONSABLE ────────────────────────────────────────────────
export const MOCK_RESPONSIBLE_GAMING: ResponsibleGamingSettings = {
  monthlyPlayLimit: 600,
  selfExclusion: {
    enabled: false,
    optionKey: 'no',
  }
};

// ── PREMIOS ENTREGADOS HISTÓRICOS ────────────────────────────────────
export const MOCK_DELIVERED_PRIZES: DeliveredPrize[] = [
  {
    id: 'prize-1',
    createdAt: '2025-12-22T12:00:00.000Z',
    gameName: 'Lotería de Navidad',
    prizeAmount: 4000000,
    location: 'Manises (Valencia)',
    description: 'El Gordo de Navidad vendido íntegramente en nuestra administración.',
  },
  {
    id: 'prize-2',
    createdAt: '2025-05-18T21:00:00.000Z',
    gameName: 'Euromillones',
    prizeAmount: 145000000,
    description: 'Un único acertante de Primera Categoría validado en Manises.',
  },
  {
    id: 'prize-3',
    createdAt: '2024-10-12T13:00:00.000Z',
    gameName: 'Lotería Nacional Sábado',
    prizeAmount: 60000,
    location: 'Manises (Valencia)',
    description: 'Primer Premio del Sorteo Especial de Octubre.',
  },
  {
    id: 'prize-4',
    createdAt: '2024-03-15T21:30:00.000Z',
    gameName: 'La Primitiva',
    prizeAmount: 1200000,
    description: 'Premio de Primera Categoría (6 aciertos) validado por la web.',
  }
];
