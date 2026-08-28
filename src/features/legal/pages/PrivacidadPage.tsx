import { useLocation, useNavigate } from 'react-router-dom';
import { PublicLegalHeader } from '@/features/legal/components/PublicLegalHeader';
import { PrivacidadContent } from '@/features/legal/content/PrivacidadContent';
import { getSafeInternalPath } from '@/shared/lib/safeInternalPath';

/** Public /legal/privacidad — no session required. See PrivacidadContent for the document body. */
export function PrivacidadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => navigate(getSafeInternalPath(location.state?.from, '/'));

  return (
    <div className="min-h-full bg-background">
      <PublicLegalHeader title="Política de Privacidad" subtitle="Lotería Manises, S.L." onBack={handleBack} />
      <PrivacidadContent />
    </div>
  );
}
