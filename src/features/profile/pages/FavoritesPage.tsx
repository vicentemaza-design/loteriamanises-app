import { useNavigate } from 'react-router-dom';
import { Play, Pencil } from 'lucide-react';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { Button } from '@/shared/ui/Button';
import { useFavoritePlays } from '../hooks/useFavoritePlays';
import { BallSelection } from '@/features/tickets/components/BallSelection';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites } = useFavoritePlays();

  return (
    <div className="flex min-h-full flex-col bg-background pb-20">
      <ProfileSubHeader title="Jugadas favoritas" subtitle={`${favorites.length} guardadas`} />

      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-[1.6rem] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Reutiliza tus combinaciones</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
            Guarda jugadas esporádicas para volver a cargarlas cuando quieras, sin convertirlas en abono.
          </p>
        </section>

        <div className="space-y-3">
          {favorites.map((favorite) => {
            const game = LOTTERY_GAMES.find((item) => item.id === favorite.gameId);
            const firstBet = favorite.combinations[0];
            const extraBets = favorite.combinations.length - 1;
            return (
              <PremiumSectionCard
                key={favorite.id}
                title={favorite.title}
                eyebrow={game?.name ?? 'Juego'}
                description={`${favorite.betsCount} ${favorite.betsCount === 1 ? 'apuesta' : 'apuestas'}`}
                tone="blue"
              >
                <div className="space-y-3">
                  {/* Bolas de la primera apuesta */}
                  {firstBet && (
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <BallSelection
                        numbers={firstBet.numbers}
                        stars={firstBet.stars}
                        type={favorite.gameId}
                      />
                      {extraBets > 0 && (
                        <p className="mt-2 text-[10px] font-semibold text-slate-400">
                          + {extraBets} {extraBets === 1 ? 'apuesta' : 'apuestas'} más
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => navigate(`/play/${favorite.gameId}`)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Volver a jugar
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl border-slate-200 text-manises-blue"
                      onClick={() => navigate(`/profile/favorites/${favorite.id}`)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Gestionar
                    </Button>
                  </div>
                </div>
              </PremiumSectionCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
