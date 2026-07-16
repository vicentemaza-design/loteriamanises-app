import { useParams, useNavigate } from 'react-router-dom';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { Button } from '@/shared/ui/Button';
import { NationalPlayPage } from './NationalPlayPage';
import { NavidadPlayPage } from './NavidadPlayPage';
import { NinoPlayPage } from './NinoPlayPage';
import { QuinielaPlayPage } from './QuinielaPlayPage';
import { NumericGamePlayPage } from './NumericGamePlayPage';

export function GamePlayPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const game = LOTTERY_GAMES.find((g) => g.id === gameId);

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
        <p className="font-bold text-manises-blue text-lg">Juego no encontrado</p>
        <Button onClick={() => navigate('/games')} className="bg-manises-blue text-white rounded-xl">
          Ver catálogo
        </Button>
      </div>
    );
  }

  const isStructuredGame =
    Boolean(game.selectionRange) ||
    game.type === 'loteria-nacional' ||
    game.type === 'navidad' ||
    game.type === 'nino' ||
    game.id === 'quiniela';

  if (!isStructuredGame) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-background p-8 text-center">
        <div className="rounded-3xl border border-manises-blue/10 bg-white px-6 py-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-manises-gold">Próximamente</p>
          <h1 className="mt-2 text-2xl font-black text-manises-blue">{game.name}</h1>
          <p className="mt-3 max-w-[18rem] text-sm font-medium leading-relaxed text-muted-foreground">
            Esta variante todavía no está preparada en la app demo. El juego sigue visible en catálogo, pero su flujo de compra aún no está habilitado.
          </p>
          <div className="mt-6 flex gap-2">
            <Button onClick={() => navigate('/games')} className="rounded-xl bg-manises-blue text-white">
              Ver otros juegos
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl">
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (game.type === 'navidad') return <NavidadPlayPage game={game} />;
  if (game.type === 'nino') return <NinoPlayPage game={game} />;
  if (game.type === 'loteria-nacional') return <NationalPlayPage game={game} />;
  if (game.id === 'quiniela') return <QuinielaPlayPage game={game} />;
  return <NumericGamePlayPage game={game} />;
}
