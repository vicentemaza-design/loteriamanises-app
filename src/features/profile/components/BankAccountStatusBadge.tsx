import { Clock, CheckCircle2 } from 'lucide-react';
import type { BankAccountVerificationStatus } from '@/features/profile/types/profile.types';

/**
 * Only represents the 2 persistent states (`unverified` / `verified`).
 * Operation outcomes (mismatch/unavailable/error) are transient and shown
 * in BankAccountVerificationPanel instead — they are never a badge on the
 * account itself.
 */
export function BankAccountStatusBadge({ status }: { status: BankAccountVerificationStatus }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 uppercase tracking-wide">
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        Verificada
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 uppercase tracking-wide">
      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
      Pendiente de verificar
    </span>
  );
}
