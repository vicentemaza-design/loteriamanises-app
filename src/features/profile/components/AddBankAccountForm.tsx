import { useState } from 'react';
import type { FormEvent } from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import type { BankAccount } from '@/features/profile/types/profile.types';
import type { AddBankAccountFormInput } from '@/features/profile/hooks/useBankAccounts';
import {
  formatIbanForDisplay,
  normalizeIban,
  isValidSpanishIbanFormat,
  isValidIbanChecksum,
} from '@/features/profile/lib/ibanValidation';

type FormStatus = 'idle' | 'validating' | 'saving' | 'success' | 'error';

interface AddBankAccountFormProps {
  onAdd: (input: AddBankAccountFormInput) => Promise<BankAccount | null>;
  onSuccess: (account: BankAccount) => void;
  onCancel: () => void;
}

export function AddBankAccountForm({ onAdd, onSuccess, onCancel }: AddBankAccountFormProps) {
  const [iban, setIban] = useState('');
  const [bank, setBank] = useState('');
  const [alias, setAlias] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const isSaving = status === 'saving' || status === 'validating';

  const handleIbanChange = (raw: string) => {
    setIban(formatIbanForDisplay(raw));
    if (status === 'error') {
      setStatus('idle');
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('validating');
    setError(null);

    const clean = normalizeIban(iban);

    if (!isValidSpanishIbanFormat(clean)) {
      setStatus('error');
      setError('El IBAN debe ser español (empezar por ES seguido de 22 dígitos).');
      return;
    }
    if (!isValidIbanChecksum(clean)) {
      setStatus('error');
      setError('El IBAN no es válido (dígito de control incorrecto). Revísalo.');
      return;
    }

    setStatus('saving');
    const account = await onAdd({ iban: clean, bank: bank.trim() || undefined, alias: alias.trim() || undefined });

    if (account) {
      setStatus('success');
      onSuccess(account);
    } else {
      setStatus('error');
      setError('No se ha podido añadir la cuenta. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h4 className="text-[11px] font-black text-manises-blue uppercase tracking-wider">Añadir cuenta bancaria</h4>
        <button type="button" onClick={onCancel} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-[11px] font-semibold text-amber-800 leading-snug">
          La cuenta bancaria debe estar a tu nombre.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div className="flex flex-col gap-1">
          <label htmlFor="new-bank-iban" className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">
            IBAN (España)
          </label>
          <input
            id="new-bank-iban"
            type="text"
            inputMode="text"
            placeholder="ES00 0000 0000 0000 0000 0000"
            autoComplete="off"
            value={iban}
            onChange={(e) => handleIbanChange(e.target.value)}
            aria-invalid={status === 'error'}
            aria-describedby={status === 'error' ? 'new-bank-iban-error' : undefined}
            disabled={isSaving}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-mono font-bold outline-none focus:border-manises-blue disabled:opacity-60"
          />
          <p className="text-[9px] text-slate-400 font-medium pl-0.5">Validamos el formato y el dígito de control en tu navegador. El banco confirmará el resto.</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="new-bank-name" className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Entidad bancaria (opcional)</label>
            <input
              id="new-bank-name"
              type="text"
              placeholder="Ej. BBVA"
              autoComplete="off"
              value={bank}
              disabled={isSaving}
              onChange={(e) => setBank(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-manises-blue disabled:opacity-60"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="new-bank-alias" className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Alias (opcional)</label>
            <input
              id="new-bank-alias"
              type="text"
              placeholder="Ej. Cuenta Ahorro"
              autoComplete="off"
              value={alias}
              disabled={isSaving}
              onChange={(e) => setAlias(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-manises-blue disabled:opacity-60"
            />
          </div>
        </div>

        {status === 'error' && error && (
          <div id="new-bank-iban-error" role="alert" aria-live="polite" className="flex items-center gap-1 px-0.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" aria-hidden="true" />
            <p className="text-[10px] font-bold text-red-500">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSaving}
          className="w-full h-11 rounded-xl bg-manises-blue text-white text-xs font-black uppercase tracking-wider disabled:opacity-60"
        >
          {status === 'saving' ? 'Guardando...' : 'Añadir cuenta'}
        </Button>
      </form>
    </div>
  );
}
