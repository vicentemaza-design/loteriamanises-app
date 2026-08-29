import { useLocation, useNavigate } from 'react-router-dom';
import { PublicLegalHeader } from '@/features/legal/components/PublicLegalHeader';
import { CondicionesContent } from '@/features/legal/content/CondicionesContent';
import { getSafeInternalPath } from '@/shared/lib/safeInternalPath';

/** Public /legal/condiciones — no session required. See CondicionesContent for the document body. */
export function CondicionesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => {
    const safeFrom = getSafeInternalPath(location.state?.from, '/');
    // Si se llegó aquí desde /register, volver con navigate(-1) (POP a la
    // MISMA entrada de historial) en vez de un push nuevo — RegisterPage
    // guarda un snapshot local ligado a su location.key exacta para
    // restaurar el formulario, y solo lo hace si el retorno es esa misma
    // entrada. Cualquier otro origen (login, entrada directa, etc.)
    // conserva el comportamiento existente sin cambios.
    if (safeFrom === '/register') {
      navigate(-1);
      return;
    }
    navigate(safeFrom);
  };

  return (
    <div className="min-h-full bg-background">
      <PublicLegalHeader title="Condiciones Generales" subtitle="Lotería Manises, S.L." onBack={handleBack} />
      <CondicionesContent />
    </div>
  );
}
