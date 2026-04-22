import * as React from 'react';
import type { ImgHTMLAttributes } from 'react';
import { MoonStar } from 'lucide-react';
import type { GameType } from '@/shared/types/domain';
import bonolotoBlue from '@/assets/games/bonoloto-blue-simbolo.svg';
import bonolotoWhite from '@/assets/games/bonoloto-white-simbolo.svg';
import euromillonesBlue from '@/assets/games/euromillones-blue-simbolo.svg';
import euromillonesWhite from '@/assets/games/euromillones-white-simbolo.svg';
import elGordoRed from '@/assets/games/elgordo-red-simbolo.svg';
import elGordoWhite from '@/assets/games/elgordo-white-simbolo.svg';
import eurodreamsWhite from '@/assets/games/eurodreams-white-simbolo.svg';
import eurodreamsSymbol from '@/assets/games/lg-eurodreams-svg-simbolo.svg';
import laPrimitivaGreen from '@/assets/games/laprimitiva-green-simbolo.svg';
import laPrimitivaWhite from '@/assets/games/laprimitiva-white-simbolo.svg';
import laQuinielaBlue from '@/assets/games/laquiniela-blue-simbolo.svg';
import laQuinielaWhite from '@/assets/games/laquiniela-white-simbolo.svg';
import loteriaNacionalBlue from '@/assets/games/loteria-nacional-blue-simbolo.svg';
import loteriaNacionalWhite from '@/assets/games/loteria-nacional-white-simbolo.svg';
import { cn } from '@/shared/lib/utils';

export type IconVariant = 'color' | 'white';

const iconMap: Partial<Record<GameType, Record<IconVariant, string>>> = {
  euromillones: {
    color: euromillonesBlue,
    white: euromillonesWhite,
  },
  primitiva: {
    color: laPrimitivaGreen,
    white: laPrimitivaWhite,
  },
  bonoloto: {
    color: bonolotoBlue,
    white: bonolotoWhite,
  },
  gordo: {
    color: elGordoRed,
    white: elGordoWhite,
  },
  'loteria-nacional': {
    color: loteriaNacionalBlue,
    white: loteriaNacionalWhite,
  },
  eurodreams: {
    color: eurodreamsSymbol,
    white: eurodreamsWhite,
  },
  quiniela: {
    color: laQuinielaBlue,
    white: laQuinielaWhite,
  },
  navidad: {
    color: loteriaNacionalBlue,
    white: loteriaNacionalWhite,
  },
  nino: {
    color: loteriaNacionalBlue,
    white: loteriaNacionalWhite,
  },
};

export interface GameIconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  gameType: GameType;
  variant?: IconVariant;
}

/**
 * Icono oficial de juego de Loterías y Apuestas del Estado.
 * Soporta variantes a color y blanco (para fondos oscuros).
 * Cumple con el estándar de componentes Manises.
 */
export const GameIcon = React.forwardRef<HTMLImageElement, GameIconProps>(
  ({ gameType, variant = 'color', className, ...props }, ref) => {
    const asset = iconMap[gameType]?.[variant] ?? iconMap[gameType]?.color;

    if (!asset) {
      return <MoonStar ref={ref as any} className={cn('text-current', className)} aria-hidden="true" />;
    }

    return (
      <img
        ref={ref}
        src={asset}
        alt=""
        aria-hidden="true"
        className={cn('object-contain select-none pointer-events-none', className)}
        {...props}
      />
    );
  }
);

GameIcon.displayName = 'GameIcon';
