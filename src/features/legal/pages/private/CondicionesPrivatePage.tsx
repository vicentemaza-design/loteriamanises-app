import { useLocation, useNavigate } from 'react-router-dom';
import { LegalDocumentHeader } from '@/features/legal/components/LegalDocumentHeader';
import { CondicionesContent } from '@/features/legal/content/CondicionesContent';
import { getSafeInternalPath } from '@/shared/lib/safeInternalPath';

/**
 * Authenticated /profile/legal/condiciones — rendered inside
 * PrivateLayout + RequireAuth, so it gets the general Header, the shared
 * scrollable <main> and the general BottomNav for free from the route
 * tree. See CondicionesContent for the (single-source) document body.
 */
export function CondicionesPrivatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => navigate(getSafeInternalPath(location.state?.from, '/profile'));

  return (
    <div className="min-h-full bg-background">
      <LegalDocumentHeader title="Condiciones Generales" subtitle="Información legal" onBack={handleBack} />
      <CondicionesContent />
    </div>
  );
}
