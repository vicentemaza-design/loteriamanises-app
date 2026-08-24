import { useCallback, useEffect, useState } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import type { BankAccount } from '@/features/profile/types/profile.types';

export interface AddBankAccountFormInput {
  iban: string;
  bank?: string;
  alias?: string;
}

/**
 * useBankAccounts
 * List + add bank accounts through IApiProvider. Verification is a
 * separate concern — see useVerifyBankAccountOwnership.
 */
export function useBankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const client = await createApiClient();
      const list = await client.wallet.bankAccounts.list();
      setAccounts(list);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Resolves the new account, or null if the operation failed. */
  const addAccount = useCallback(async (input: AddBankAccountFormInput): Promise<BankAccount | null> => {
    try {
      const client = await createApiClient();
      const result = await client.wallet.bankAccounts.add(input);
      setAccounts((prev) => [...prev, result.bankAccount]);
      return result.bankAccount;
    } catch {
      return null;
    }
  }, []);

  /** Reflects a verification result (or any other server-confirmed change) into the local list. */
  const updateAccountLocally = useCallback((updated: BankAccount) => {
    setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }, []);

  /** Resolves true on success. On failure, the local list is left untouched — no optimistic removal. */
  const deleteAccount = useCallback(async (bankAccountId: string): Promise<boolean> => {
    try {
      const client = await createApiClient();
      const result = await client.wallet.bankAccounts.delete({ bankAccountId });
      setAccounts(result.accounts);
      return true;
    } catch {
      return false;
    }
  }, []);

  /** Resolves true on success. On failure, the local list is left untouched — no optimistic default flip. */
  const setDefaultAccount = useCallback(async (bankAccountId: string): Promise<boolean> => {
    try {
      const client = await createApiClient();
      const result = await client.wallet.bankAccounts.setDefault({ bankAccountId });
      setAccounts(result.accounts);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { accounts, isLoading, addAccount, updateAccountLocally, deleteAccount, setDefaultAccount, reload: load };
}
