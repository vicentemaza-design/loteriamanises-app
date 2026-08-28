import { useLocation, useNavigate } from 'react-router-dom';
import { LegalDocumentHeader } from '@/features/legal/components/LegalDocumentHeader';
import { PrivacidadContent } from '@/features/legal/content/PrivacidadContent';
import { getSafeInternalPath } from '@/shared/lib/safeInternalPath';

/**
 * Authenticated /profile/legal/privacidad — rendered inside
 * PrivateLayout + RequireAuth, so it gets the general Header, the shared
 * scrollable <main> and the general BottomNav for free from the route
 * tree. See PrivacidadContent for the (single-source) document body.
 */
export function PrivacidadPrivatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => navigate(getSafeInternalPath(location.state?.from, '/profile'));

  return (
    <div className="min-h-full bg-background">
      <LegalDocumentHeader title="Política de Privacidad" subtitle="Información legal" onBack={handleBack} />
      <PrivacidadContent />
    </div>
  );
}
