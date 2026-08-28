import { useLocation, useNavigate } from 'react-router-dom';
import { PublicLegalHeader } from '@/features/legal/components/PublicLegalHeader';
import { JuegoResponsableContent } from '@/features/legal/content/JuegoResponsableContent';
import { getSafeInternalPath } from '@/shared/lib/safeInternalPath';

/**
 * Public "Juego responsable" information page — no session required.
 * Reachable from LoginPage/RegisterPage's footer link, which must work
 * without a signed-in user. See JuegoResponsableContent for the document
 * body (same text as the authenticated /profile/legal/juego-responsable
 * variant and ResponsibleGamingResourcePage.tsx).
 *
 * Personal controls (spending limit, self-exclusion) are NOT here — those
 * stay at /profile/gaming-control (behind RequireAuth), since they need a
 * real account and, eventually, real backend enforcement.
 */
export function JuegoResponsablePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => navigate(getSafeInternalPath(location.state?.from, '/'));

  return (
    <div className="flex min-h-full flex-col bg-background pb-10">
      <PublicLegalHeader title="Juego responsable" subtitle="Información y recursos" onBack={handleBack} />
      <JuegoResponsableContent />
    </div>
  );
}
