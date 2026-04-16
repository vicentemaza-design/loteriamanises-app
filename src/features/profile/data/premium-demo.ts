import type { PremiumDemoData } from '@/features/profile/types/premium.types';

export const premiumDemoData: PremiumDemoData = {
  favoritePlays: [
    {
      id: 'fav-euro-01',
      gameId: 'euromillones',
      title: 'Bote Europeo',
      numbersLabel: '07 · 14 · 23 · 38 · 47 + 03 · 09',
      frequency: 'Mar y Vie',
      budgetLabel: '5,00 EUR por semana',
    },
    {
      id: 'fav-primi-01',
      gameId: 'primitiva',
      title: 'Clasica Familiar',
      numbersLabel: '05 · 12 · 21 · 30 · 44 · 49',
      frequency: 'Jue y Sab',
      budgetLabel: '2,00 EUR por semana',
    },
    {
      id: 'fav-nacional-01',
      gameId: 'loteria-nacional',
      title: 'Numero persistente',
      numbersLabel: '69844 · 2 decimos',
      frequency: 'Jueves y Sabados',
      budgetLabel: '18,00 EUR por semana',
    },
  ],
  subscriptions: [
    {
      id: 'sub-euro-01',
      gameId: 'euromillones',
      title: 'Abono Euromillones Premium',
      cadence: 'Renovacion semanal automatica',
      nextChargeLabel: 'Viernes 18 abril',
      amountLabel: '10,00 EUR',
      status: 'active',
    },
    {
      id: 'sub-nacional-01',
      gameId: 'loteria-nacional',
      title: 'Abono Numero 69844',
      cadence: 'Decimo fijo para cada sorteo',
      nextChargeLabel: 'Sabado 20 abril',
      amountLabel: '12,00 EUR',
      status: 'paused',
    },
  ],
  walletMovements: [
    {
      id: 'mov-01',
      userId: 'demo-user',
      type: 'deposit',
      amount: 50,
      description: 'Recarga Apple Pay',
      createdAt: '2026-04-12T09:30:00.000Z',
    },
    {
      id: 'mov-02',
      userId: 'demo-user',
      type: 'bet',
      amount: -10,
      description: 'Abono semanal Euromillones',
      createdAt: '2026-04-12T10:10:00.000Z',
    },
    {
      id: 'mov-03',
      userId: 'demo-user',
      type: 'prize',
      amount: 128,
      description: 'Premio Quiniela',
      createdAt: '2026-04-10T18:45:00.000Z',
    },
    {
      id: 'mov-04',
      userId: 'demo-user',
      type: 'bet',
      amount: -6,
      description: 'Decimo Loteria Nacional',
      createdAt: '2026-04-09T12:15:00.000Z',
    },
  ],
  withdrawals: [
    {
      id: 'wd-01',
      amountLabel: '128,00 EUR',
      methodLabel: 'Transferencia a ES12 3456 7890',
      status: 'ready',
      note: 'Disponible para solicitar hoy. Liquidacion estimada en menos de 24h.',
    },
    {
      id: 'wd-02',
      amountLabel: '2.450,00 EUR',
      methodLabel: 'Revision documental',
      status: 'pending-review',
      note: 'Falta subir DNI/NIE y confirmar titularidad bancaria.',
    },
  ],
  helpTopics: [
    {
      id: 'help-01',
      title: 'Premios y pagos',
      description: 'Como se valida un premio, plazos de pago y fiscalidad aplicada.',
      ctaLabel: 'Ver condiciones',
    },
    {
      id: 'help-02',
      title: 'Juego responsable',
      description: 'Limites, autoexclusion y herramientas de control personal.',
      ctaLabel: 'Abrir guia',
    },
    {
      id: 'help-03',
      title: 'Soporte 24h',
      description: 'Canales directos para incidencias de compra, cobro o acceso.',
      ctaLabel: 'Contactar',
    },
  ],
  companyServices: [
    {
      id: 'company-01',
      title: 'Gestion de loteria para empresas',
      description: 'Campañas de Navidad y El Niño con reparto por equipos o departamentos.',
      detail: 'Panel de participaciones, control de cobros y soporte dedicado.',
    },
    {
      id: 'company-02',
      title: 'Participaciones digitales',
      description: 'Entrega de resguardos y participaciones por email o WhatsApp.',
      detail: 'Ideal para asociaciones, fallas, clubs y comercios locales.',
    },
  ],
};
