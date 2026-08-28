import { useLocation, useNavigate } from 'react-router-dom';
import { PublicLegalHeader } from '@/features/legal/components/PublicLegalHeader';
import { CondicionesAbonosContent } from '@/features/legal/content/CondicionesAbonosContent';
import { getSafeInternalPath } from '@/shared/lib/safeInternalPath';

/** Public /legal/condiciones-abonos — no session required. See CondicionesAbonosContent for the document body. */
export function CondicionesAbonosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => navigate(getSafeInternalPath(location.state?.from, '/'));

  return (
    <div className="min-h-full bg-background">
      <PublicLegalHeader title="Condiciones de Abonos" subtitle="Servicio de abono de Lotería Nacional" onBack={handleBack} />
      <CondicionesAbonosContent />
    </div>
  );
}
