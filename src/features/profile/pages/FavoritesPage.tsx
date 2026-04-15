import { useNavigate } from 'react-router-dom';
import { Heart, Play, Sparkles } from 'lucide-react';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { premiumDemoData } from '@/features/profile/data/premium-demo';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumMetricPill } from '../components/PremiumMetricPill';

export function FavoritesPage() {
  const navigate = useNavigate();
  const favorites = premiumDemoData.favoritePlays;

  return (
    <div className="flex min-h-full flex-col bg-background pb-nav-safe">
      <ProfileSubHeader title="Jugadas Favoritas" />
      <div className="flex flex-col gap-4 p-5">
        <PremiumSectionCard
          eyebrow="Retencion"
          title="Tus jugadas mas repetidas"
          description="Estructura demo lista para conectarse a un backend de favoritos y re-jugada rapida."
        >
          <div className="grid grid-cols-2 gap-3">
            <PremiumMetricPill label="Favoritos" value={`${favorites.length} guardados`} tone="gold" />
            <PremiumMetricPill label="Gasto medio" value="11,00 EUR/sem" tone="blue" />
          </div>
        </PremiumSectionCard>

        <div className="flex flex-col gap-3">
          {favorites.map((favorite) => {
            const game = LOTTERY_GAMES.find((item) => item.id === favorite.gameId);
            return (
              <PremiumSectionCard
                key={favorite.id}
                eyebrow={game?.name ?? 'Juego'}
                title={favorite.title}
                description={favorite.numbersLabel}
              >
                <div className="grid grid-cols-2 gap-3">
                  <PremiumMetricPill label="Frecuencia" value={favorite.frequency} />
                  <PremiumMetricPill label="Presupuesto" value={favorite.budgetLabel} tone="gold" />
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  <PremiumActionRow
                    icon={Play}
                    title="Jugar de nuevo"
                    description="Reusar combinacion y abrir el flujo de compra desde el juego."
                    onClick={() => navigate(`/play/${favorite.gameId}`)}
                  />
                  <PremiumActionRow
                    icon={Sparkles}
                    title="Convertir en abono"
                    description="Base lista para conectar favoritos con suscripcion recurrente."
                  />
                </div>
              </PremiumSectionCard>
            );
          })}
        </div>

        <PremiumSectionCard
          eyebrow="Producto"
          title="Que deberia resolver backend"
          description="Relacion favorita-juego, repeticion de numeros, presupuesto y ultima ejecucion."
        >
          <PremiumActionRow
            icon={Heart}
            title="Modelo recomendado"
            description="favorite_play { userId, gameId, picks, stars, cadence, budget, lastPlayedAt }"
          />
        </PremiumSectionCard>
      </div>
    </div>
  );
}
