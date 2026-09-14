import { BriefcaseBusiness, Landmark, Newspaper } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import adminFacade from '@/assets/images/administracion_manises.webp';
import loteriaNacionalHero from '@/assets/images/loteria_nacional.jpg';
import mediosHero from '@/assets/images/quienes-somos/rafa-2023.jpg';

/**
 * Tarjetas de "Servicios Premium" del inicio.
 *
 * Están aquí y no incrustadas en HomePage para poder quitar y poner una
 * sin borrar nada: basta con cambiar `enabled`. El código de la tarjeta
 * retirada se queda intacto y vuelve con una línea el día que haga falta.
 *
 * Si no queda ninguna activa, la sección entera desaparece del inicio.
 */
export interface PremiumService {
  id: string;
  /** Lo que gobierna el quita y pon. No borrar la entrada: ponerlo a false. */
  enabled: boolean;
  badge: string;
  title: string;
  description: string;
  cta: string;
  image: string;
  imageAlt: string;
  icon: LucideIcon;
  accent: 'gold' | 'blue' | 'indigo' | 'emerald';
  stats: string[];
  route: string;
}

export const PREMIUM_SERVICES: PremiumService[] = [
  {
    id: 'empresas',
    // Retirado para la campaña de 2026 a petición del cliente: el módulo de
    // empresas no está desarrollado todavía. No se borra nada — la pantalla
    // y su ruta siguen en pie, solo deja de anunciarse en el inicio.
    enabled: false,
    badge: 'PARA EMPRESAS',
    title: 'Lotería de Navidad para empresas',
    description: 'Gestiona participaciones y reparto interno con una experiencia pensada para equipos.',
    cta: 'Módulo empresas',
    image: adminFacade,
    imageAlt: 'Servicio premium para empresas',
    icon: BriefcaseBusiness,
    accent: 'blue',
    stats: ['Digital', 'Soporte'],
    route: '/profile/companies',
  },
  {
    id: 'medios',
    enabled: true,
    badge: 'EN LOS MEDIOS',
    title: 'Lo que dicen de nosotros',
    description: 'RTVE, Telecinco, ABC, El Español y la Cadena SER llevan años contando la suerte de Manises.',
    cta: 'Ver noticias',
    image: mediosHero,
    imageAlt: 'Lotería Manises en los medios de comunicación',
    icon: Newspaper,
    accent: 'indigo',
    stats: ['Prensa', 'Televisión'],
    route: '/profile/press',
  },
  {
    id: 'abono',
    enabled: true,
    badge: 'Número Fiel',
    title: 'Abónate a tu número',
    description: 'Convierte tu número favorito en un abono estable y olvídate de renovar cada semana.',
    cta: 'Suscribirme',
    image: loteriaNacionalHero,
    imageAlt: 'Abonos a número de lotería',
    icon: Landmark,
    accent: 'gold',
    stats: ['Persistente', 'Semanal'],
    route: '/profile/subscriptions/setup',
  },
];

export function getActivePremiumServices(): PremiumService[] {
  return PREMIUM_SERVICES.filter(service => service.enabled);
}
