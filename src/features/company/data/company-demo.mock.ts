export interface CompanyFeaturedProductDemo {
  gameId: string;
  productName: string;
  productShortLabel: string;
  drawLabel: string;
  protagonistNumber?: string;
  deliveryLabel?: string;
  note: string;
  quantityOptions: number[];
}

export interface CompanyCollectiveDemo {
  code: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  accessLabel: string;
  accentLabel: string;
  memberCountLabel: string;
  featuredProduct: CompanyFeaturedProductDemo;
}

export const COMPANY_DEMO_COLLECTION: CompanyCollectiveDemo[] = [
  {
    code: 'FALLA25',
    slug: 'falla25',
    name: 'Falla Mestre Guillem de Manises',
    shortName: 'FM',
    description: 'Acceso demo para reparto interno de participaciones y seguimiento compacto desde móvil.',
    accessLabel: 'Código demo',
    accentLabel: 'Campaña Fallas',
    memberCountLabel: '148 participantes demo',
    featuredProduct: {
      gameId: 'loteria-navidad',
      productName: 'Participación Navidad equipo',
      productShortLabel: 'Navidad',
      drawLabel: 'Sorteo de diciembre',
      protagonistNumber: '48291',
      deliveryLabel: 'Entrega digital demo',
      note: 'Participación pendiente de integración con reparto interno.',
      quantityOptions: [1, 2, 5, 10],
    },
  },
  {
    code: 'CLUB360',
    slug: 'club360',
    name: 'Club Empresas Manises 360',
    shortName: 'C360',
    description: 'Landing demo para colectivos corporativos con acceso por enlace y selección rápida de cantidad.',
    accessLabel: 'Código demo',
    accentLabel: 'Colectivo empresa',
    memberCountLabel: '92 accesos demo',
    featuredProduct: {
      gameId: 'euromillones',
      productName: 'Bote semanal del colectivo',
      productShortLabel: 'Euromillones',
      drawLabel: 'Próximo sorteo compartido',
      deliveryLabel: 'Resumen interno demo',
      note: 'Demo · participación pendiente de integración.',
      quantityOptions: [1, 3, 5, 10],
    },
  },
];

export function normalizeCompanyCode(value: string): string {
  return value.trim().toUpperCase();
}

export function getCompanyDemoByCode(code: string | undefined): CompanyCollectiveDemo | undefined {
  if (!code) {
    return undefined;
  }

  const normalizedCode = normalizeCompanyCode(code);
  return COMPANY_DEMO_COLLECTION.find((company) => company.code === normalizedCode || company.slug.toUpperCase() === normalizedCode);
}

export const DEFAULT_COMPANY_DEMO = COMPANY_DEMO_COLLECTION[0];
