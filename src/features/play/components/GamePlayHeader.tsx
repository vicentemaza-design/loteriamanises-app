import { Button } from '@/shared/ui/Button';
import { GameBadge } from '@/shared/ui/GameBadge';
import { NavArrowLeft, InfoCircle } from 'iconoir-react/regular';
import { formatDrawTime } from '@/shared/lib/utils';
import type { LotteryGame } from '@/shared/types/domain';

interface GamePlayHeaderProps {
  game: LotteryGame;
  drawTime: string;
  onBack: () => void;
  onInfo: () => void;
}

export function GamePlayHeader({ game, drawTime, onBack, onInfo }: GamePlayHeaderProps) {
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
