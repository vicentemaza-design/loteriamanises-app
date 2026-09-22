import { AlertTriangle, WifiOff, XCircle } from 'lucide-react';
import type { FailedVerificationAttempt } from '@/features/profile/types/profile.types';

/**
 * Aviso PERSISTENTE de por qué una cuenta sigue sin verificar.
 *
 * No confundir con BankAccountVerificationPanel: aquél es transitorio y vive
 * durante el intento, dentro del flujo de retirada. Éste se queda en la
 * cuenta, y es el que ve quien vuelve al día siguiente. Sin él, una cuenta
 * que falló la verificación solo mostraba una etiqueta ámbar de "Pendiente
 * de verificar" que no distingue entre "nunca se ha intentado" y "se intentó
 * y el titular no coincidía".
 *
 * Solo se pinta si la cuenta trae `lastFailedVerification`; una cuenta
 * verificada, o una que aún no se ha intentado, no muestra nada.
 */

const COPY: Record<
  FailedVerificationAttempt['outcome'],
  { icon: typeof XCircle; titulo: string; detalle: string; tono: string }
> = {
  mismatch: {
    icon: XCircle,
    titulo: 'No pudimos verificar la titularidad',
    detalle: 'Los datos del titular no coinciden con los de tu cuenta. Revisa el IBAN o añade una cuenta que esté a tu nombre.',
    tono: 'border-red-100 bg-red-50/70 text-red-700',
  },
  unavailable: {
    icon: WifiOff,
    titulo: 'La verificación no llegó a completarse',
    detalle: 'El servicio de verificación no estaba disponible. Puedes volver a intentarlo cuando retires saldo.',
    tono: 'border-amber-100 bg-amber-50/70 text-amber-800',
  },
  error: {
    icon: AlertTriangle,
    titulo: 'La verificación no llegó a completarse',
    detalle: 'Hubo un problema al verificar la cuenta. Puedes volver a intentarlo cuando retires saldo.',
    tono: 'border-amber-100 bg-amber-50/70 text-amber-800',
  },
};

function formatearFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function BankAccountVerificationNotice({ attempt }: { attempt: FailedVerificationAttempt }) {
  const { icon: Icon, titulo, detalle, tono } = COPY[attempt.outcome];
  const fecha = formatearFecha(attempt.at);

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 ${tono}`} role="status">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[11.5px] font-black leading-tight">{titulo}</p>
        <p className="mt-0.5 text-[11px] font-medium leading-relaxed opacity-90">{detalle}</p>
        {fecha && (
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide opacity-60">
            Último intento: {fecha}
          </p>
        )}
      </div>
    </div>
  );
}
