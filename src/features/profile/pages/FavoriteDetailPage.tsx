import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Play, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { Button } from '@/shared/ui/Button';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { useFavoritePlays } from '../hooks/useFavoritePlays';
import type { SubscriptionBet } from '../types/profile.types';

function formatBet(bet: SubscriptionBet) {
  const main = bet.numbers.map((value) => String(value).padStart(2, '0')).join('  ');
  if (bet.stars?.length) {
    const stars = bet.stars.map((value) => String(value).padStart(2, '0')).join('  ');
    return `${main}  ·  ${stars}`;
  }
  return main;
}

export function FavoriteDetailPage() {
  const navigate = useNavigate();
  const { favoriteId = '' } = useParams();
  const { getFavoriteById, renameFavorite, removeFavorite } = useFavoritePlays();
  const favorite = getFavoriteById(favoriteId);
  const [draftName, setDraftName] = useState(favorite?.title ?? '');
  const game = useMemo(() => LOTTERY_GAMES.find((item) => item.id === favorite?.gameId), [favorite?.gameId]);

  if (!favorite) {
    return (
      <div className="flex min-h-full flex-col bg-background">
        <ProfileSubHeader title="Detalle de jugada" subtitle="No encontrada" backTo="/profile/favorites" />
        <div className="p-4">
          <PremiumSectionCard title="Jugada no encontrada" eyebrow="Favoritas" description="Puede que se haya eliminado o aún no exista en esta demo." tone="blue">
            <p className="text-sm font-semibold text-slate-500">Vuelve al listado para revisar tus jugadas guardadas.</p>
          </PremiumSectionCard>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-background pb-20">
      <ProfileSubHeader title="Detalle de jugada" subtitle={game?.name ?? 'Favorita'} backTo="/profile/favorites" />

      <div className="flex flex-col gap-4 p-4">
        <PremiumSectionCard
          title={favorite.title}
          eyebrow={game?.name ?? 'Juego'}
          description={`${favorite.betsCount} ${favorite.betsCount === 1 ? 'apuesta' : 'apuestas'}`}
          tone="blue"
        >
          <div className="space-y-3">
            {favorite.combinations.map((bet, index) => (
              <div key={`${favorite.id}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Apuesta {index + 1}</p>
                <p className="mt-2 font-mono text-sm font-black tracking-[0.18em] text-manises-blue">
                  {formatBet(bet)}
                </p>
              </div>
            ))}
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard title="Cambiar nombre" eyebrow="Identificación rápida" description="Ponle un nombre claro para reconocerla al instante." tone="default">
          <div className="space-y-3">
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-manises-blue outline-none focus:border-manises-blue"
              placeholder="Nombre de la jugada"
            />
            <Button
              variant="outline"
              className="w-full rounded-xl border-slate-200 text-manises-blue"
              onClick={() => {
                const nextName = draftName.trim();
                if (!nextName) {
                  toast.error('Introduce un nombre antes de guardar.');
                  return;
                }
                renameFavorite(favorite.id, nextName);
                toast.success('Nombre actualizado.');
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Guardar nombre
            </Button>
          </div>
        </PremiumSectionCard>

        <div className="space-y-2">
          <Button
            className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => navigate(`/play/${favorite.gameId}`)}
          >
            <Play className="mr-2 h-4 w-4" />
            Volver a jugar
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => {
              removeFavorite(favorite.id);
              toast.success('Favorita eliminada.');
              navigate('/profile/favorites');
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar favorita
          </Button>
        </div>
      </div>
    </div>
  );
}
