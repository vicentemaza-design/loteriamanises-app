import * as React from 'react';
import { Landmark } from 'lucide-react';
import type { BankAccount } from '@/features/profile/types/profile.types';
import { BankAccountStatusBadge } from './BankAccountStatusBadge';

export interface BankAccountCardProps {
  account: BankAccount;
  selected: boolean;
  onSelect: () => void;
}

export const BankAccountCard = React.forwardRef<HTMLButtonElement, BankAccountCardProps>(
  ({ account, selected, onSelect }, ref) => {
    const title = account.alias || account.bank || 'Cuenta bancaria';

    return (
      <button
        ref={ref}
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manises-blue/40 ${
          selected ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-100 bg-white'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${selected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            <Landmark className="w-4.5 h-4.5" aria-hidden="true" />
          </div>
          <div className="text-left min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className={`text-sm font-bold truncate ${selected ? 'text-emerald-800' : 'text-slate-700'}`}>{title}</p>
              {account.isDefault && (
                <span className="text-[9px] font-black text-manises-blue/60 uppercase tracking-wide bg-manises-blue/5 border border-manises-blue/10 rounded-full px-1.5 py-0.5 shrink-0">
                  Predeterminada
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[11px] text-slate-500 font-mono font-semibold tracking-tight" aria-label={`Terminada en ${account.ibanMasked.slice(-4)}`}>
                {account.ibanMasked}
              </p>
              <BankAccountStatusBadge status={account.verificationStatus} />
            </div>
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? 'border-emerald-500' : 'border-slate-300'}`}>
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
        </div>
      </button>
    );
  }
);
BankAccountCard.displayName = 'BankAccountCard';
