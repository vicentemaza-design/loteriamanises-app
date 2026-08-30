import { useLayoutEffect } from 'react';
import { Button } from '@/shared/ui/Button';
import { GameBadge } from '@/shared/ui/GameBadge';
import { NavArrowLeft, InfoCircle, ShoppingBag, ViewGrid } from 'iconoir-react/regular';
import { formatDrawTime } from '@/shared/lib/utils';
import type { LotteryGame } from '@/shared/types/domain';
import { usePlaySession } from '@/features/session/hooks/usePlaySession';

/** Read by PrivateLayout's play-only top surface (see PlayTopSurface there)
 *  so the same gradient painted here continues into the physical iOS status
 *  area, which this element's own fixed/z-40 background cannot reach on its
 *  own (confirmed by physical device QA). Single source of truth: whatever
 *  this component paints itself, nothing duplicated/hardcoded elsewhere. */
const PLAY_HEADER_BACKGROUND_VAR = '--play-header-background';

/** EXPERIMENTO — solo La Primitiva y Navidad: overrides opt-in de la altura
 *  (54px exactos) y el z-index (50) de PlayTopSurface. Sin registrar (todos
 *  los demás juegos), PlayTopSurface usa sus valores por defecto — la altura
 *  y el z-index existentes no cambian para nadie más. */
const PLAY_TOP_SURFACE_HEIGHT_VAR = '--play-top-surface-height';
const PLAY_TOP_SURFACE_Z_VAR = '--play-top-surface-z';

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

/** EXPERIMENTO — solo La Primitiva y Navidad (rama test/ios-root-transparent,
 *  no mergear a main): PlayTopSurface (PrivateLayout.tsx) ya pinta, para
 *  TODOS los juegos y sin cambios, el mismo gradiente a una altura
 *  (safe-area + 64px) que ya excede la altura real de este header (56px) —
 *  solo queda oculta detrás del propio fondo opaco de este componente. Para
 *  estos dos juegos, dejar transparente el fondo propio deja ver esa
 *  superficie ya correcta a través suyo, sin duplicar color/lógica alguna.
 *  El resto de juegos conserva su fondo dinámico exactamente igual. */
const UNIFIED_TOP_SURFACE_TYPES = new Set(['primitiva', 'navidad']);

export function GamePlayHeader({ game, drawTime, onBack, onInfo, titleOverride, exitAriaLabel }: GamePlayHeaderProps) {
  const { gameDrafts, lotteryDrafts, openGameReview, openLotteryReview } = usePlaySession();
  const isLotteryGame = NATIONAL_LOTTERY_TYPES.has(game.type);
  const count = isLotteryGame ? lotteryDrafts.length : gameDrafts.length;

  const handleCartClick = () => {
    if (isLotteryGame) openLotteryReview();
    else openGameReview();
  };

  const background = `linear-gradient(135deg, ${game.color}, ${game.colorEnd ?? game.color})`;
  const useUnifiedTopSurface = UNIFIED_TOP_SURFACE_TYPES.has(game.type);

  // Synchronous (pre-paint) registration — a plain useEffect would let the
  // fallback color show for one frame before the real gradient landed.
  // Saves/restores whatever value was there before, so leaving this game's
  // page (unmount) never leaves a stale gradient behind for the next one.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousBackground = root.style.getPropertyValue(PLAY_HEADER_BACKGROUND_VAR);
    root.style.setProperty(PLAY_HEADER_BACKGROUND_VAR, background);

    let previousHeight = '';
    let previousZ = '';
    if (useUnifiedTopSurface) {
      previousHeight = root.style.getPropertyValue(PLAY_TOP_SURFACE_HEIGHT_VAR);
      previousZ = root.style.getPropertyValue(PLAY_TOP_SURFACE_Z_VAR);
      root.style.setProperty(PLAY_TOP_SURFACE_HEIGHT_VAR, '54px');
      root.style.setProperty(PLAY_TOP_SURFACE_Z_VAR, '50');
    }

    return () => {
      if (previousBackground) {
        root.style.setProperty(PLAY_HEADER_BACKGROUND_VAR, previousBackground);
      } else {
        root.style.removeProperty(PLAY_HEADER_BACKGROUND_VAR);
      }
      if (useUnifiedTopSurface) {
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
      }
    };
  }, [background, useUnifiedTopSurface]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 ${useUnifiedTopSurface ? 'z-60' : 'z-40'} text-white pt-safe shadow-lg h-[calc(env(safe-area-inset-top,0px)+56px)] flex flex-col justify-end`}
      style={{ background: useUnifiedTopSurface ? 'transparent' : background }}
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
