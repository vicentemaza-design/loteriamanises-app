import { Loader2, CheckCircle2, XCircle, WifiOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import type { VerifyBankAccountStatus } from '@/features/profile/hooks/useVerifyBankAccountOwnership';

interface BankAccountVerificationPanelProps {
  status: VerifyBankAccountStatus;
  onRetry: () => void;
  onChooseAnother: () => void;
  onAddAnother: () => void;
  onDismiss: () => void;
}

/**
 * Renders the transient OUTCOME of a single verifyOwnership() attempt.
 * These 4 outcomes are never persisted on the account — only 'verified'
 * ever updates the account's persistent verificationStatus (done by the
 * caller after this resolves). The FE only represents what the provider
 * returned; no titularity comparison happens here.
 */
export function BankAccountVerificationPanel({ status, onRetry, onChooseAnother, onAddAnother, onDismiss }: BankAccountVerificationPanelProps) {
  if (status === 'idle') return null;

  if (status === 'verifying') {
    return (
      <div role="status" aria-live="polite" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-manises-blue animate-spin shrink-0" aria-hidden="true" />
        <p className="text-[12px] font-bold text-manises-blue">Verificando cuenta...</p>
      </div>
    );
  }

  if (status === 'verified') {
    return (
      <div role="status" aria-live="polite" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 space-y-2">
          <p className="text-[12px] font-black text-emerald-800">Cuenta verificada</p>
          <Button
            type="button"
            onClick={onDismiss}
            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black"
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'mismatch') {
    return (
      <div role="alert" aria-live="polite" className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 space-y-2">
          <p className="text-[12px] font-black text-red-700">Cuenta no válida</p>
          <p className="text-[11px] font-medium text-red-600">Los datos del titular no coinciden.</p>
          <div className="flex gap-2 pt-1">
            <Button type="button" onClick={onAddAnother} variant="outline" className="h-9 px-3 rounded-xl border-red-200 text-red-700 text-[11px] font-bold">
              Añadir otra cuenta
            </Button>
            <Button type="button" onClick={onChooseAnother} variant="outline" className="h-9 px-3 rounded-xl border-slate-200 text-slate-600 text-[11px] font-bold">
              Elegir otra cuenta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unavailable') {
    return (
      <div role="alert" aria-live="polite" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <WifiOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 space-y-2">
          <p className="text-[12px] font-black text-amber-800">No podemos verificar ahora</p>
          <p className="text-[11px] font-medium text-amber-700">Inténtalo de nuevo más tarde.</p>
          <div className="flex gap-2 pt-1">
            <Button type="button" onClick={onRetry} className="h-9 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black">
              Reintentar
            </Button>
            <Button type="button" onClick={onChooseAnother} variant="outline" className="h-9 px-3 rounded-xl border-slate-200 text-slate-600 text-[11px] font-bold">
              Elegir otra cuenta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // status === 'error'
  return (
    <div role="alert" aria-live="polite" className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 space-y-2">
        <p className="text-[12px] font-black text-red-700">Ha ocurrido un problema al verificar la cuenta</p>
        <p className="text-[11px] font-medium text-red-600">Inténtalo de nuevo en unos minutos.</p>
        <div className="flex gap-2 pt-1">
          <Button type="button" onClick={onRetry} className="h-9 px-3 rounded-xl bg-manises-blue text-white text-[11px] font-black">
            Reintentar
          </Button>
          <Button type="button" onClick={onChooseAnother} variant="outline" className="h-9 px-3 rounded-xl border-slate-200 text-slate-600 text-[11px] font-bold">
            Elegir otra cuenta
          </Button>
        </div>
      </div>
    </div>
  );
}
