import { useLocation, useNavigate } from 'react-router-dom';
import { LegalDocumentHeader } from '@/features/legal/components/LegalDocumentHeader';
import { AvisoLegalContent } from '@/features/legal/content/AvisoLegalContent';
import { getSafeInternalPath } from '@/shared/lib/safeInternalPath';

/**
 * Authenticated /profile/legal/aviso — rendered inside PrivateLayout +
 * RequireAuth, so it gets the general Header, the shared scrollable
 * <main> and the general BottomNav for free from the route tree. See
 * AvisoLegalContent for the (single-source) document body.
 */
export function AvisoLegalPrivatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => navigate(getSafeInternalPath(location.state?.from, '/profile'));

  return (
    <div className="min-h-full bg-background">
      <LegalDocumentHeader title="Aviso Legal" subtitle="Información legal" onBack={handleBack} />
      <AvisoLegalContent />
    </div>
  );
}
