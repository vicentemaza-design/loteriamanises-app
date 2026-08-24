import * as React from 'react';
import { useState } from 'react';
import { Landmark, Plus, Star, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { AddBankAccountForm } from '../components/AddBankAccountForm';
import { BankAccountStatusBadge } from '../components/BankAccountStatusBadge';
import { Button } from '@/shared/ui/Button';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { useBankAccounts } from '../hooks/useBankAccounts';
import type { BankAccount } from '../types/profile.types';

// ── Fila de gestión (predeterminada / eliminar) ─────────────────────────────
// Reutiliza el mismo lenguaje visual que BankAccountCard (icono, alias/banco,
// IBAN enmascarado, badge de verificación) pero sin el círculo de selección:
// aquí las acciones son marcar predeterminada y eliminar, no elegir cuenta
// de destino para una retirada.

interface BankAccountManageRowProps {
  account: BankAccount;
  isDeleting: boolean;
  confirmingDelete: boolean;
  onSetDefault: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

const BankAccountManageRow: React.FC<BankAccountManageRowProps> = ({
  account,
  isDeleting,
  confirmingDelete,
  onSetDefault,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}) => {
  const title = account.alias || account.bank || 'Cuenta bancaria';

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-white">
      <div className="flex items-center justify-between gap-3 p-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${account.isDefault ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            <Landmark className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="text-left min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-bold truncate text-slate-700">{title}</p>
              {account.isDefault && (
                <span className="text-[9px] font-black text-manises-blue/60 uppercase tracking-wide bg-manises-blue/5 border border-manises-blue/10 rounded-full px-1.5 py-0.5 shrink-0">
                  Predeterminada
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-mono font-semibold tracking-tight" aria-label={`Terminada en ${account.ibanMasked.slice(-4)}`}>
              {account.ibanMasked}
            </p>
            <div className="mt-0.5">
              <BankAccountStatusBadge status={account.verificationStatus} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!account.isDefault && (
            <PremiumTouchInteraction scale={0.94}>
              <button
                type="button"
                onClick={onSetDefault}
                aria-label="Marcar como predeterminada"
                title="Marcar como predeterminada"
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-manises-gold hover:bg-manises-gold/10 transition-colors"
              >
                <Star className="w-4 h-4" />
              </button>
            </PremiumTouchInteraction>
          )}
          <PremiumTouchInteraction scale={0.94}>
            <button
              type="button"
              onClick={onRequestDelete}
              disabled={isDeleting}
              aria-label="Eliminar cuenta"
              title="Eliminar cuenta"
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </PremiumTouchInteraction>
        </div>
      </div>

      <AnimatePresence>
        {confirmingDelete && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-red-100 bg-red-50"
          >
            <div className="flex items-center gap-2.5 p-3.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />
              <p className="flex-1 text-[11px] font-semibold text-red-700">¿Eliminar esta cuenta?</p>
              <button
                type="button"
                onClick={onCancelDelete}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirmDelete}
                disabled={isDeleting}
                className="text-[10px] font-black uppercase tracking-wide text-white bg-red-500 hover:bg-red-600 rounded-lg px-3 py-1.5 disabled:opacity-60"
              >
                {isDeleting ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function BankAccountsPage() {
  const { accounts, isLoading, addAccount, deleteAccount, setDefaultAccount } = useBankAccounts();
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleSetDefault = async (id: string) => {
    setPendingId(id);
    const ok = await setDefaultAccount(id);
    setPendingId(null);
    if (ok) toast.success('Cuenta predeterminada actualizada.');
    else toast.error('No se ha podido actualizar la cuenta predeterminada.');
  };

  const handleConfirmDelete = async (id: string) => {
    setPendingId(id);
    const ok = await deleteAccount(id);
    setPendingId(null);
    setConfirmDeleteId(null);
    if (ok) toast.success('Cuenta eliminada.');
    else toast.error('No se ha podido eliminar la cuenta.');
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-20">
      <ProfileSubHeader title="Mis cuentas bancarias" subtitle="Gestiona tus cuentas de cobro" />

      <div className="flex flex-col gap-3 p-4">
        {isLoading ? (
          <div className="py-10 text-center">
            <p className="text-xs font-semibold text-slate-400">Cargando cuentas…</p>
          </div>
        ) : accounts.length === 0 && !isAdding ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600">Todavía no tienes cuentas bancarias</p>
              <p className="mt-1 text-[11px] font-medium text-slate-400">Añade una cuenta para poder cobrar tus premios.</p>
            </div>
            <Button
              onClick={() => setIsAdding(true)}
              className="h-11 px-5 rounded-xl bg-manises-blue text-white text-xs font-black uppercase tracking-wider"
            >
              Añadir cuenta
            </Button>
          </div>
        ) : (
          <>
            {accounts.map((acc: BankAccount) => (
              <BankAccountManageRow
                key={acc.id}
                account={acc}
                isDeleting={pendingId === acc.id}
                confirmingDelete={confirmDeleteId === acc.id}
                onSetDefault={() => { handleSetDefault(acc.id); }}
                onRequestDelete={() => setConfirmDeleteId(acc.id)}
                onConfirmDelete={() => { handleConfirmDelete(acc.id); }}
                onCancelDelete={() => setConfirmDeleteId(null)}
              />
            ))}

            {!isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all"
              >
                <div className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                  <Plus className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-slate-500">Añadir nueva cuenta</p>
              </button>
            )}
          </>
        )}

        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AddBankAccountForm
                onAdd={addAccount}
                onSuccess={() => setIsAdding(false)}
                onCancel={() => setIsAdding(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
