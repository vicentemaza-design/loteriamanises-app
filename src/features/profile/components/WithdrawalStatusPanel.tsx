import { Loader2, Clock, Hourglass, CheckCircle2, XCircle, AlertTriangle, WifiOff } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { formatCurrency } from '@/shared/lib/utils';
import type { CreateWithdrawalStatus } from '@/features/profile/hooks/useCreateWithdrawal';
import type { WithdrawalDto } from '@/services/api/contracts/withdrawals.contracts';

interface WithdrawalStatusPanelProps {
  createStatus: CreateWithdrawalStatus;
  withdrawal: WithdrawalDto | null;
  errorMessage: string | null;
  onRetry: () => void;
  onGoToBalance: () => void;
  onNewWithdrawal: () => void;
}

/**
 * Renders the result of createWithdrawal(). `createStatus` is the UI state
 * of the CREATE call itself; `withdrawal.status` (pending/processing/
 * completed/rejected/failed) is the separate domain state of the request —
 * see withdrawals.contracts.ts. This phase never polls for status changes:
 * whatever status the create call returned synchronously is what's shown.
 */
export function WithdrawalStatusPanel({ createStatus, withdrawal, errorMessage, onRetry, onGoToBalance, onNewWithdrawal }: WithdrawalStatusPanelProps) {
  if (createStatus === 'submitting') {
    return (
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 text-center py-8">
        <Loader2 className="w-10 h-10 text-manises-blue animate-spin" aria-hidden="true" />
        <p className="text-sm font-bold text-manises-blue">Enviando solicitud...</p>
      </div>
    );
  }

  if (createStatus === 'error' || createStatus === 'rate_limited' || createStatus === 'service_unavailable') {
    const Icon = createStatus === 'rate_limited' ? Clock : createStatus === 'service_unavailable' ? WifiOff : AlertTriangle;
    return (
      <div role="alert" aria-live="polite" className="space-y-5 py-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <Icon className="w-8 h-8 text-red-500" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-black text-manises-blue">No se ha podido enviar la solicitud</h3>
            <p className="text-[12px] font-medium text-muted-foreground mt-1">{errorMessage}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-2xl border-slate-200 font-bold text-manises-blue" onClick={onGoToBalance}>
            Volver a mi saldo
          </Button>
          <Button onClick={onRetry} className="flex-1 h-12 rounded-2xl bg-manises-blue text-white font-black border-none">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (createStatus !== 'success' || !withdrawal) return null;

  const dateLabel = new Date(withdrawal.updatedAt ?? withdrawal.createdAt).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const CONTENT = {
    pending: {
      icon: <Clock className="w-8 h-8 text-amber-600" aria-hidden="true" />,
      iconWrap: 'bg-amber-50 border-amber-100',
      title: 'Solicitud de retirada recibida',
      description: 'Tu solicitud está pendiente de revisión. Te avisaremos cuando cambie de estado.',
    },
    processing: {
      icon: <Hourglass className="w-8 h-8 text-manises-blue" aria-hidden="true" />,
      iconWrap: 'bg-manises-blue/5 border-manises-blue/10',
      title: 'Retirada en proceso',
      description: 'Estamos procesando tu solicitud.',
    },
    completed: {
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" aria-hidden="true" />,
      iconWrap: 'bg-emerald-50 border-emerald-100',
      title: 'Solicitud de retirada procesada',
      description: 'Tu banco ha confirmado la transferencia. El importe puede tardar en reflejarse en tu cuenta.',
    },
    rejected: {
      icon: <XCircle className="w-8 h-8 text-red-500" aria-hidden="true" />,
      iconWrap: 'bg-red-50 border-red-100',
      title: 'Retirada rechazada',
      description: withdrawal.safeReasonMessage ?? 'La solicitud no ha podido aceptarse.',
    },
    failed: {
      icon: <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />,
      iconWrap: 'bg-red-50 border-red-100',
      title: 'No se ha podido procesar la retirada',
      description: 'Ha ocurrido un problema técnico al procesar tu solicitud. Puedes intentarlo de nuevo.',
    },
  };

  const content = CONTENT[withdrawal.status];

  return (
    <div role="status" aria-live="polite" className="space-y-6 py-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className={`w-20 h-20 rounded-full border flex items-center justify-center ${content.iconWrap}`}>
          {content.icon}
        </div>
        <div>
          <h3 className="text-xl font-black text-manises-blue">{content.title}</h3>
          <p className="text-2xl font-black text-manises-blue mt-1 tabular-nums">{formatCurrency(withdrawal.amount)}</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">{content.description}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground">Cuenta de destino</span>
          <span className="text-[12px] font-black text-manises-blue font-mono">{withdrawal.bankAccountMasked}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
          <span className="text-[11px] font-semibold text-muted-foreground">Fecha</span>
          <span className="text-[12px] font-black text-manises-blue">{dateLabel}</span>
        </div>
      </div>

      {(withdrawal.status === 'rejected' || withdrawal.status === 'failed') && (
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-2xl border-slate-200 font-bold text-manises-blue" onClick={onGoToBalance}>
            Volver a mi saldo
          </Button>
          <Button onClick={onNewWithdrawal} className="flex-1 h-12 rounded-2xl bg-manises-blue text-white font-black border-none">
            Elegir otra cuenta
          </Button>
        </div>
      )}

      {(withdrawal.status === 'pending' || withdrawal.status === 'processing' || withdrawal.status === 'completed') && (
        <div className="flex flex-col gap-3">
          <Button onClick={onGoToBalance} className="w-full h-12 rounded-2xl bg-manises-blue text-white font-black border-none">
            Volver a mi saldo
          </Button>
          <Button variant="ghost" onClick={onNewWithdrawal} className="text-[11px] font-bold text-muted-foreground">
            Realizar otra retirada
          </Button>
        </div>
      )}
    </div>
  );
}
