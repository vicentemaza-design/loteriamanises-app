import { useLayoutEffect } from 'react';
import { Button } from '@/shared/ui/Button';
import { GameBadge } from '@/shared/ui/GameBadge';
import { NavArrowLeft, InfoCircle, ShoppingBag, ViewGrid } from 'iconoir-react/regular';
import { formatDrawTime } from '@/shared/lib/utils';
import type { LotteryGame } from '@/shared/types/domain';
import { usePlaySession } from '@/features/session/hooks/usePlaySession';
// Mismos assets que src/features/catalog/pages/GamesPage.tsx (imageMap de
// GameCardRow) — reutilizados tal cual, no duplicados como nuevo arte.
import joySecondary from '@/assets/images/joy_secondary.png';
import primitivaJoy from '@/assets/images/primitiva_joy.png';
import loteriaNacionalHero from '@/assets/images/loteria_nacional.jpg';
import loteriaJuevesLuck from '@/assets/images/loteria_jueves_luck.jpg';
import loteriaNavidadHero from '@/assets/images/loteria_navidad_hero.jpg';
import headerWinner from '@/assets/images/header_winner.jpg';
import primitivaJoyV2 from '@/assets/images/primitiva_joy_v2.jpg';

/** Read by PrivateLayout's play-only top surface (see PlayTopSurface there)
 *  so the same gradient painted here continues into the physical iOS status
 *  area, which this element's own fixed/z-40 background cannot reach on its
 *  own (confirmed by physical device QA). Single source of truth: whatever
 *  this component paints itself, nothing duplicated/hardcoded elsewhere. */
const PLAY_HEADER_BACKGROUND_VAR = '--play-header-background';

/** Altura (54px exactos) y z-index (1) de PlayTopSurface, para todos los
 *  juegos que usan GamePlayHeader — ver PrivateLayout.tsx. */
const PLAY_TOP_SURFACE_HEIGHT_VAR = '--play-top-surface-height';
const PLAY_TOP_SURFACE_Z_VAR = '--play-top-surface-z';

/** Activa en PlayTopSurface el mismo arte del juego que ya usa el catálogo
 *  (imagen + tinte multiply + velo direccional, misma fuente que GameCardRow
 *  en GamesPage.tsx), para todos los juegos que usan GamePlayHeader. */
const PLAY_TOP_SURFACE_ARTWORK_VAR = '--play-top-surface-artwork';
const PLAY_TOP_SURFACE_IMAGE_VAR = '--play-top-surface-image';

/** Mismas claves/valores que imageMap en GamesPage.tsx — no se inventa
 *  ninguna imagen nueva. Cualquier juego sin entrada específica (p. ej.
 *  Euromillones, EuroDreams) cae al mismo fallback que usa el catálogo. */
const PLAY_TOP_SURFACE_IMAGE_MAP: Record<string, string> = {
  primitiva: primitivaJoy,
  bonoloto: joySecondary,
  gordo: primitivaJoyV2,
  quiniela: headerWinner,
  'loteria-nacional-jueves': loteriaJuevesLuck,
  'loteria-nacional-sabado': loteriaNacionalHero,
  'loteria-navidad': loteriaNavidadHero,
  'loteria-nino': loteriaNavidadHero,
};

interface GamePlayHeaderProps {
  game: LotteryGame;
  drawTime: string;
  onBack: () => void;
  onInfo: () => void;
  titleOverride?: string;
  /**
   * When set, replaces the default back arrow with a grid/catalog icon
   * (same size/position, no visible text) using this string as its
   * aria-label — e.g. "Ir al catálogo de juegos". Left undefined, the
   * header renders exactly as before (plain back arrow). Piloted on
   * Bonoloto only; every other caller omits this prop.
   */
  exitAriaLabel?: string;
}

const NATIONAL_LOTTERY_TYPES = new Set(['loteria-nacional', 'navidad', 'nino']);

export function GamePlayHeader({ game, drawTime, onBack, onInfo, titleOverride, exitAriaLabel }: GamePlayHeaderProps) {
  const { gameDrafts, lotteryDrafts, openGameReview, openLotteryReview } = usePlaySession();
  const isLotteryGame = NATIONAL_LOTTERY_TYPES.has(game.type);
  const count = isLotteryGame ? lotteryDrafts.length : gameDrafts.length;

  const handleCartClick = () => {
    if (isLotteryGame) openLotteryReview();
    else openGameReview();
  };

  const background = `linear-gradient(135deg, ${game.color}, ${game.colorEnd ?? game.color})`;

  // Synchronous (pre-paint) registration — a plain useEffect would let the
  // fallback color show for one frame before the real gradient landed.
  // Saves/restores whatever value was there before, so leaving this game's
  // page (unmount) never leaves a stale gradient behind for the next one.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousBackground = root.style.getPropertyValue(PLAY_HEADER_BACKGROUND_VAR);
    root.style.setProperty(PLAY_HEADER_BACKGROUND_VAR, background);

    const image = PLAY_TOP_SURFACE_IMAGE_MAP[game.id] ?? joySecondary;
    const previousHeight = root.style.getPropertyValue(PLAY_TOP_SURFACE_HEIGHT_VAR);
    const previousZ = root.style.getPropertyValue(PLAY_TOP_SURFACE_Z_VAR);
    const previousArtwork = root.style.getPropertyValue(PLAY_TOP_SURFACE_ARTWORK_VAR);
    const previousImage = root.style.getPropertyValue(PLAY_TOP_SURFACE_IMAGE_VAR);
    root.style.setProperty(PLAY_TOP_SURFACE_HEIGHT_VAR, '54px');
    root.style.setProperty(PLAY_TOP_SURFACE_Z_VAR, '1');
    root.style.setProperty(PLAY_TOP_SURFACE_ARTWORK_VAR, '1');
    root.style.setProperty(PLAY_TOP_SURFACE_IMAGE_VAR, `url(${image})`);

    return () => {
      if (previousBackground) {
        root.style.setProperty(PLAY_HEADER_BACKGROUND_VAR, previousBackground);
      } else {
        root.style.removeProperty(PLAY_HEADER_BACKGROUND_VAR);
      }
      if (previousHeight) {
        root.style.setProperty(PLAY_TOP_SURFACE_HEIGHT_VAR, previousHeight);
      } else {
        root.style.removeProperty(PLAY_TOP_SURFACE_HEIGHT_VAR);
      }
      if (previousZ) {
        root.style.setProperty(PLAY_TOP_SURFACE_Z_VAR, previousZ);
      } else {
        root.style.removeProperty(PLAY_TOP_SURFACE_Z_VAR);
      }
      if (previousArtwork) {
        root.style.setProperty(PLAY_TOP_SURFACE_ARTWORK_VAR, previousArtwork);
      } else {
        root.style.removeProperty(PLAY_TOP_SURFACE_ARTWORK_VAR);
      }
      if (previousImage) {
        root.style.setProperty(PLAY_TOP_SURFACE_IMAGE_VAR, previousImage);
      } else {
        root.style.removeProperty(PLAY_TOP_SURFACE_IMAGE_VAR);
      }
    };
  }, [background, game.id]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-60 text-white pt-safe shadow-lg h-[calc(env(safe-area-inset-top,0px)+56px)] flex flex-col justify-end"
      style={{ background: 'transparent' }}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1">
          {exitAriaLabel ? (
            <button
              type="button"
              onClick={onBack}
              aria-label={exitAriaLabel}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/90 transition-all hover:bg-white/15 hover:text-white active:scale-95"
            >
              <ViewGrid className="h-5 w-5" />
            </button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/15 w-9 h-9 rounded-xl"
              onClick={onBack}
              aria-label="Volver"
            >
              <NavArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <GameBadge game={game} size="sm" className="w-8 h-8 rounded-lg shadow-none bg-white/10" />
            <div>
              <h1 className="font-bold text-base leading-tight">{titleOverride ?? game.name}</h1>
              <p className="text-[10px] text-white/60 font-medium">
                {formatDrawTime(drawTime)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {count > 0 && (
            <button
              type="button"
              onClick={handleCartClick}
              aria-label={`Ver cesta — ${count} ${count === 1 ? 'artículo' : 'artículos'}`}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white transition-all hover:bg-white/25 active:scale-95"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-manises-gold text-[9px] font-black text-manises-blue shadow">
                {count > 9 ? '9+' : count}
              </span>
            </button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/15 w-9 h-9 rounded-xl"
            onClick={onInfo}
            aria-label="Información del juego"
          >
            <InfoCircle className="w-4.5 h-4.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
