import { useLocation, useNavigate } from 'react-router-dom';
import { LegalDocumentHeader } from '@/features/legal/components/LegalDocumentHeader';
import { JuegoResponsableContent } from '@/features/legal/content/JuegoResponsableContent';
import { getSafeInternalPath } from '@/shared/lib/safeInternalPath';

/**
 * Authenticated /profile/legal/juego-responsable — rendered inside
 * PrivateLayout + RequireAuth, so it gets the general Header, the shared
 * scrollable <main> and the general BottomNav for free from the route
 * tree. See JuegoResponsableContent for the (single-source) document body.
 */
export function JuegoResponsablePrivatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => navigate(getSafeInternalPath(location.state?.from, '/profile'));

  return (
    <div className="flex min-h-full flex-col bg-background pb-10">
      <LegalDocumentHeader title="Juego responsable" subtitle="Información legal" onBack={handleBack} />
      <JuegoResponsableContent />
    </div>
  );
}
