import { Button } from '@/shared/ui/Button';
import { GameBadge } from '@/shared/ui/GameBadge';
import { NavArrowLeft, InfoCircle, ShoppingBag } from 'iconoir-react/regular';
import { formatDrawTime } from '@/shared/lib/utils';
import type { LotteryGame } from '@/shared/types/domain';
import { usePlaySession } from '@/features/session/hooks/usePlaySession';

interface GamePlayHeaderProps {
  game: LotteryGame;
  drawTime: string;
  onBack: () => void;
  onInfo: () => void;
}

const NATIONAL_LOTTERY_TYPES = new Set(['loteria-nacional', 'navidad', 'nino']);

export function GamePlayHeader({ game, drawTime, onBack, onInfo }: GamePlayHeaderProps) {
  const { gameDrafts, lotteryDrafts, openGameReview, openLotteryReview } = usePlaySession();
  const isLotteryGame = NATIONAL_LOTTERY_TYPES.has(game.type);
  const count = isLotteryGame ? lotteryDrafts.length : gameDrafts.length;

  const handleCartClick = () => {
    if (isLotteryGame) openLotteryReview();
    else openGameReview();
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 text-white pt-safe shadow-lg h-[calc(env(safe-area-inset-top,0px)+56px)] flex flex-col justify-end"
      style={{ background: `linear-gradient(135deg, ${game.color}, ${game.colorEnd ?? game.color})` }}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/15 w-9 h-9 rounded-xl"
            onClick={onBack}
            aria-label="Volver"
          >
            <NavArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <GameBadge game={game} size="sm" className="w-8 h-8 rounded-lg shadow-none bg-white/10" />
            <div>
              <h1 className="font-bold text-base leading-tight">{game.name}</h1>
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
