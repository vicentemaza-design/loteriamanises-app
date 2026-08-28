import { useLocation, useNavigate } from 'react-router-dom';
import { PublicLegalHeader } from '@/features/legal/components/PublicLegalHeader';
import { AvisoLegalContent } from '@/features/legal/content/AvisoLegalContent';
import { getSafeInternalPath } from '@/shared/lib/safeInternalPath';

/** Public /legal/aviso — no session required. See AvisoLegalContent for the document body. */
export function AvisoLegalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => navigate(getSafeInternalPath(location.state?.from, '/'));

  return (
    <div className="min-h-full bg-background">
      <PublicLegalHeader title="Aviso Legal" subtitle="Lotería Manises, S.L." onBack={handleBack} />
      <AvisoLegalContent />
    </div>
  );
}
