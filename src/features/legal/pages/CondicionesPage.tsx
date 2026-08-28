import { useLocation, useNavigate } from 'react-router-dom';
import { PublicLegalHeader } from '@/features/legal/components/PublicLegalHeader';
import { CondicionesContent } from '@/features/legal/content/CondicionesContent';
import { getSafeInternalPath } from '@/shared/lib/safeInternalPath';

/** Public /legal/condiciones — no session required. See CondicionesContent for the document body. */
export function CondicionesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => navigate(getSafeInternalPath(location.state?.from, '/'));

  return (
    <div className="min-h-full bg-background">
      <PublicLegalHeader title="Condiciones Generales" subtitle="Lotería Manises, S.L." onBack={handleBack} />
      <CondicionesContent />
    </div>
  );
}
