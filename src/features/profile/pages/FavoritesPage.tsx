import type { ElementType } from 'react';
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
      <ProfileSubHeader title="Jugadas Favoritas" subtitle={`${favorites.length} guardados`} />
      <div className="flex flex-col gap-5 p-4">
        
        {/* Intro Section - Subtle */}
        <div className="px-1 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mis combinaciones</p>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            Tus jugadas guardadas y frecuencia para re-jugar rápidamente.
          </p>
        </div>

        {/* Individual favorites list */}
        <div className="flex flex-col gap-4">
          {favorites.map((favorite) => {
            const game = LOTTERY_GAMES.find((item) => item.id === favorite.gameId);
            return (
              <PremiumSectionCard
                key={favorite.id}
                eyebrow={game?.name ?? 'Juego'}
                title={favorite.title}
                description={favorite.numbersLabel}
                tone="rose"
              >
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <PremiumMetricPill label="Frecuencia" value={favorite.frequency} tone="rose" />
                  <PremiumMetricPill label="Presupuesto" value={favorite.budgetLabel} tone="gold" />
                </div>
                
                <div className="flex flex-col bg-muted/30 rounded-xl overflow-hidden border border-border/50">
                  <PremiumActionRow
                    icon={Play}
                    title="Jugar de nuevo"
                    description="Carga esta combinación en el juego"
                    onClick={() => navigate(`/play/${favorite.gameId}`)}
                    tone="rose"
                    badge="Directo"
                  />
                  <div className="h-px bg-border/40 mx-3" />
                  <PremiumActionRow
                    icon={Sparkles}
                    title="Convertir en abono"
                    description="Suscribirse automáticamente"
                    tone="gold"
                    onClick={() => undefined}
                    badge="Premium"
                  />
                </div>
              </PremiumSectionCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
