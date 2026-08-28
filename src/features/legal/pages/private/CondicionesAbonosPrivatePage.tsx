import { useLocation, useNavigate } from 'react-router-dom';
import { LegalDocumentHeader } from '@/features/legal/components/LegalDocumentHeader';
import { CondicionesAbonosContent } from '@/features/legal/content/CondicionesAbonosContent';
import { getSafeInternalPath } from '@/shared/lib/safeInternalPath';

/**
 * Authenticated /profile/legal/condiciones-abonos — rendered inside
 * PrivateLayout + RequireAuth, so it gets the general Header, the shared
 * scrollable <main> and the general BottomNav for free from the route
 * tree. See CondicionesAbonosContent for the (single-source) document body.
 */
export function CondicionesAbonosPrivatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => navigate(getSafeInternalPath(location.state?.from, '/profile'));

  return (
    <div className="min-h-full bg-background">
      <LegalDocumentHeader title="Condiciones de Abonos" subtitle="Información legal" onBack={handleBack} />
      <CondicionesAbonosContent />
    </div>
  );
}
