import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';

interface ProfileSubHeaderProps {
  title: string;
  subtitle?: string;
}

export function ProfileSubHeader({ title, subtitle }: ProfileSubHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md flex items-center gap-4 px-4 h-14 border-b border-gray-100">
      <PremiumTouchInteraction scale={0.92}>
        <button
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-lg flex items-center justify-center -ml-1 text-manises-blue/80 hover:bg-muted active:scale-95 transition-all"
          aria-label="Volver al perfil"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </PremiumTouchInteraction>
      
      <div className="flex flex-col">
        <h1 className="text-sm font-bold tracking-tight text-manises-blue leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[10px] font-medium text-muted-foreground mt-0.5 uppercase tracking-widest opacity-60">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
