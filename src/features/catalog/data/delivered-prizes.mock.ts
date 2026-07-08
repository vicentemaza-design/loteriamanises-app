export type PrizeGameType =
  | 'bonoloto'
  | 'euromillones'
  | 'primitiva'
  | 'navidad'
  | 'nino'
  | 'loteria-nacional'
  | 'quiniela';

export interface GordoNavidad {
  year: number;
  ticketNumber: string;
}

export interface DeliveredPrize {
  id: string;
  gameType: PrizeGameType;
  gameName: string;
  date: string;
  category: string;
  amount: number;
  prizeRank?: string;
  isNew?: boolean;
}

// Números reales de los gordos según https://www.loteriamanises.com/Web_2_0/premios-entregados/
export const GORDOS_NAVIDAD: GordoNavidad[] = [
  { year: 2012, ticketNumber: '76058' },
  { year: 2013, ticketNumber: '62246' },
  { year: 2018, ticketNumber: '03347' },
  { year: 2022, ticketNumber: '05490' },
  { year: 2023, ticketNumber: '88008' },
];

export const MANISES_GORDO_YEARS = [1971, 1986, 2012, 2013, 2018, 2022, 2023];
export const MANISES_OWN_GORDOS = new Set([2012, 2013, 2018, 2022, 2023]);

// Datos reales de https://www.loteriamanises.com/Web_2_0/premios-entregados/
export const MOCK_DELIVERED_PRIZES: DeliveredPrize[] = [
  // 2024
  {
    id: 'p-2024-ln-11',
    gameType: 'loteria-nacional',
    gameName: 'Lotería Nacional',
    date: '2024-11-07',
    category: '2º Premio · Nº 65772',
    amount: 60_000,
    prizeRank: '2º PREMIO',
    isNew: true,
  },
  {
    id: 'p-2024-ln-07',
    gameType: 'loteria-nacional',
    gameName: 'Lotería Nacional',
    date: '2024-07-04',
    category: '1er Premio · Nº 02344',
    amount: 300_000,
    prizeRank: '1er PREMIO',
    isNew: true,
  },
  {
    id: 'p-2024-nino',
    gameType: 'nino',
    gameName: 'El Niño',
    date: '2024-01-06',
    category: '3er Premio · Nº 57033',
    amount: 250_000,
    prizeRank: '3er PREMIO',
    isNew: true,
  },
  // 2023
  {
    id: 'p-2023-nav-gordo',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2023-12-22',
    category: '1er Premio (El Gordo) · Nº 88008',
    amount: 4_000_000,
    prizeRank: 'EL GORDO',
  },
  {
    id: 'p-2023-nav-2',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2023-12-22',
    category: '2º Premio · Nº 58303',
    amount: 1_250_000,
    prizeRank: '2º PREMIO',
  },
  {
    id: 'p-2023-nav-5a',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2023-12-22',
    category: '5º Premio · Nº 57421',
    amount: 60_000,
    prizeRank: '5º PREMIO',
  },
  {
    id: 'p-2023-nav-5b',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2023-12-22',
    category: '5º Premio · Nº 86007',
    amount: 60_000,
    prizeRank: '5º PREMIO',
  },
  {
    id: 'p-2023-nav-5c',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2023-12-22',
    category: '5º Premio · Nº 01568',
    amount: 60_000,
    prizeRank: '5º PREMIO',
  },
  {
    id: 'p-2023-nav-5d',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2023-12-22',
    category: '5º Premio · Nº 88979',
    amount: 60_000,
    prizeRank: '5º PREMIO',
  },
  {
    id: 'p-2023-nav-5e',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2023-12-22',
    category: '5º Premio · Nº 45353',
    amount: 60_000,
    prizeRank: '5º PREMIO',
  },
  // 2022
  {
    id: 'p-2022-nav-gordo',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2022-12-22',
    category: '1er Premio (El Gordo) · Nº 05490',
    amount: 4_000_000,
    prizeRank: 'EL GORDO',
  },
  {
    id: 'p-2022-nav-4',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2022-12-22',
    category: '4º Premio · Nº 25296',
    amount: 200_000,
    prizeRank: '4º PREMIO',
  },
  {
    id: 'p-2022-nav-5a',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2022-12-22',
    category: '5º Premio · Nº 36142',
    amount: 60_000,
    prizeRank: '5º PREMIO',
  },
  {
    id: 'p-2022-nav-5b',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2022-12-22',
    category: '5º Premio · Nº 38454',
    amount: 60_000,
    prizeRank: '5º PREMIO',
  },
  {
    id: 'p-2022-nav-5c',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2022-12-22',
    category: '5º Premio · Nº 88508',
    amount: 60_000,
    prizeRank: '5º PREMIO',
  },
  {
    id: 'p-2022-ln-93',
    gameType: 'loteria-nacional',
    gameName: 'Lotería Nacional',
    date: '2022-10-20',
    category: '1er Premio · Nº 00575',
    amount: 300_000,
    prizeRank: '1er PREMIO',
  },
  {
    id: 'p-2022-ln-89',
    gameType: 'loteria-nacional',
    gameName: 'Lotería Nacional',
    date: '2022-09-08',
    category: '1er Premio · Nº 18052',
    amount: 300_000,
    prizeRank: '1er PREMIO',
  },
  {
    id: 'p-2022-pri-44',
    gameType: 'primitiva',
    gameName: 'La Primitiva',
    date: '2022-05-14',
    category: '5 aciertos + Complementario',
    amount: 75_013,
  },
  // 2021
  {
    id: 'p-2021-nino-gordo',
    gameType: 'nino',
    gameName: 'El Niño',
    date: '2021-01-06',
    category: '1er Premio (El Gordo) · Nº 19570',
    amount: 2_000_000,
    prizeRank: 'EL GORDO',
  },
  {
    id: 'p-2021-nino-2',
    gameType: 'nino',
    gameName: 'El Niño',
    date: '2021-01-06',
    category: '2º Premio · Nº 03436',
    amount: 750_000,
    prizeRank: '2º PREMIO',
  },
  {
    id: 'p-2021-bon-3',
    gameType: 'bonoloto',
    gameName: 'Bonoloto',
    date: '2021-01-20',
    category: '5 aciertos + Complementario',
    amount: 593_765,
  },
  {
    id: 'p-2021-bon-7',
    gameType: 'bonoloto',
    gameName: 'Bonoloto',
    date: '2021-02-16',
    category: '5 aciertos + Complementario',
    amount: 37_076,
  },
  {
    id: 'p-2021-ln-79',
    gameType: 'loteria-nacional',
    gameName: 'Lotería Nacional',
    date: '2021-09-25',
    category: '1er Premio · Nº 09269',
    amount: 300_000,
    prizeRank: '1er PREMIO',
  },
  {
    id: 'p-2021-ln-64',
    gameType: 'loteria-nacional',
    gameName: 'Lotería Nacional',
    date: '2021-08-05',
    category: '2º Premio · Nº 46930',
    amount: 120_000,
    prizeRank: '2º PREMIO',
  },
  {
    id: 'p-2021-nav-4',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2021-12-22',
    category: '4º Premio · Nº 42833',
    amount: 200_000,
    prizeRank: '4º PREMIO',
  },
  {
    id: 'p-2021-nav-5a',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2021-12-22',
    category: '5º Premio · Nº 26711',
    amount: 60_000,
    prizeRank: '5º PREMIO',
  },
  {
    id: 'p-2021-nav-5b',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2021-12-22',
    category: '5º Premio · Nº 70316',
    amount: 60_000,
    prizeRank: '5º PREMIO',
  },
  // 2020
  {
    id: 'p-2020-nino-2',
    gameType: 'nino',
    gameName: 'El Niño',
    date: '2020-01-06',
    category: '2º Premio · Nº 21816',
    amount: 750_000,
    prizeRank: '2º PREMIO',
  },
  {
    id: 'p-2020-nav-2',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2020-12-22',
    category: '2º Premio · Nº 06095',
    amount: 1_250_000,
    prizeRank: '2º PREMIO',
  },
  {
    id: 'p-2020-nav-4a',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2020-12-22',
    category: '4º Premio · Nº 38341',
    amount: 200_000,
    prizeRank: '4º PREMIO',
  },
  {
    id: 'p-2020-nav-4b',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2020-12-22',
    category: '4º Premio · Nº 75981',
    amount: 200_000,
    prizeRank: '4º PREMIO',
  },
  // 2019
  {
    id: 'p-2019-nav-3',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2019-12-22',
    category: '3er Premio · Nº 00750',
    amount: 500_000,
    prizeRank: '3er PREMIO',
  },
  // 2018
  {
    id: 'p-2018-nav-gordo',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2018-12-22',
    category: '1er Premio (El Gordo) · Nº 03347',
    amount: 4_000_000,
    prizeRank: 'EL GORDO',
  },
  {
    id: 'p-2018-nav-3',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2018-12-22',
    category: '3er Premio · Nº 04211',
    amount: 500_000,
    prizeRank: '3er PREMIO',
  },
  {
    id: 'p-2018-ln-06',
    gameType: 'loteria-nacional',
    gameName: 'Lotería Nacional',
    date: '2018-06-15',
    category: '2º Premio · Nº 01248',
    amount: 250_000,
    prizeRank: '2º PREMIO',
  },
  // 2016
  {
    id: 'p-2016-bon-4',
    gameType: 'bonoloto',
    gameName: 'Bonoloto',
    date: '2016-04-20',
    category: '5 aciertos + Complementario',
    amount: 178_920,
  },
  {
    id: 'p-2016-qui-04',
    gameType: 'quiniela',
    gameName: 'La Quiniela',
    date: '2016-04-10',
    category: '13 Aciertos',
    amount: 34_230,
  },
  // 2015
  {
    id: 'p-2015-ln-06',
    gameType: 'loteria-nacional',
    gameName: 'Lotería Nacional',
    date: '2015-06-15',
    category: '2º Premio · Nº 60710',
    amount: 2_500_000,
    prizeRank: '2º PREMIO',
  },
  {
    id: 'p-2015-nav-4',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2015-12-22',
    category: '4º Premio · Nº 71119',
    amount: 200_000,
    prizeRank: '4º PREMIO',
  },
  // 2013
  {
    id: 'p-2013-nav-gordo',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2013-12-22',
    category: '1er Premio (El Gordo) · Nº 62246',
    amount: 4_000_000,
    prizeRank: 'EL GORDO',
  },
  {
    id: 'p-2013-nav-4',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2013-12-22',
    category: '4º Premio · Nº 79800',
    amount: 200_000,
    prizeRank: '4º PREMIO',
  },
  {
    id: 'p-2013-eur-01',
    gameType: 'euromillones',
    gameName: 'Euromillones',
    date: '2013-01-22',
    category: '5 aciertos + 0 estrellas',
    amount: 71_766,
  },
  // 2012
  {
    id: 'p-2012-nav-gordo',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2012-12-22',
    category: '1er Premio (El Gordo) · Nº 76058',
    amount: 4_000_000,
    prizeRank: 'EL GORDO',
  },
  {
    id: 'p-2012-eur-05',
    gameType: 'euromillones',
    gameName: 'Euromillones',
    date: '2012-05-15',
    category: '5 aciertos + 1 estrella',
    amount: 458_062,
  },
  {
    id: 'p-2012-qui-02',
    gameType: 'quiniela',
    gameName: 'La Quiniela',
    date: '2012-02-10',
    category: '15 Aciertos — Pleno al 15',
    amount: 60_123,
  },
  // 2011
  {
    id: 'p-2011-eur-08',
    gameType: 'euromillones',
    gameName: 'Euromillones',
    date: '2011-08-15',
    category: '5 aciertos + 1 estrella',
    amount: 365_547,
  },
  {
    id: 'p-2011-pri-06',
    gameType: 'primitiva',
    gameName: 'La Primitiva',
    date: '2011-06-15',
    category: '6 aciertos',
    amount: 1_348_910,
  },
  {
    id: 'p-2011-nav-2',
    gameType: 'navidad',
    gameName: 'Lotería de Navidad',
    date: '2011-12-22',
    category: '2º Premio · Nº 53404',
    amount: 1_250_000,
    prizeRank: '2º PREMIO',
  },
  // 2009
  {
    id: 'p-2009-qui-11',
    gameType: 'quiniela',
    gameName: 'La Quiniela',
    date: '2009-11-15',
    category: '15 Aciertos — Pleno al 15',
    amount: 946_195,
  },
  // 2008
  {
    id: 'p-2008-bon-08',
    gameType: 'bonoloto',
    gameName: 'Bonoloto',
    date: '2008-08-15',
    category: '6 aciertos',
    amount: 666_973,
  },
  // 2005
  {
    id: 'p-2005-qui-05',
    gameType: 'quiniela',
    gameName: 'La Quiniela',
    date: '2005-05-15',
    category: '15 Aciertos — Pleno al 15',
    amount: 629_712,
  },
  // 2002
  {
    id: 'p-2002-bon-04',
    gameType: 'bonoloto',
    gameName: 'Bonoloto',
    date: '2002-04-15',
    category: '5 aciertos + Complementario',
    amount: 68_221,
  },
];

export function getDeliveredPrizesTotalAmount(): number {
  return MOCK_DELIVERED_PRIZES.reduce((sum, prize) => sum + prize.amount, 0);
}

export function getDeliveredPrizeHighlights(limit = 3): DeliveredPrize[] {
  return [...MOCK_DELIVERED_PRIZES]
    .sort((left, right) => right.amount - left.amount)
    .slice(0, limit);
}
