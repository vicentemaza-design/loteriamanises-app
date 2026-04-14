import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';

interface ProfileSubHeaderProps {
  title: string;
}

export function ProfileSubHeader({ title }: ProfileSubHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-gray-100 flex items-center px-4 h-14">
      <PremiumTouchInteraction scale={0.9}>
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full flex items-center justify-center -ml-2 text-manises-blue hover:bg-manises-blue/5 transition-colors"
          aria-label="Volver al perfil"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </PremiumTouchInteraction>
      <h2 className="text-sm font-black text-manises-blue uppercase tracking-widest ml-2">
        {title}
      </h2>
    </div>
  );
}
