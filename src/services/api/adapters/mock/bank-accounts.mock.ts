import { DEMO_ALIAS_OUTCOMES } from '@/features/profile/data/bankVerificationDemo';
import type {
  AddBankAccountInput,
  AddBankAccountResult,
  BankAccountDto,
  VerifyBankAccountInput,
  VerifyBankAccountResult,
  BankAccountVerificationOutcome,
  DeleteBankAccountInput,
  DeleteBankAccountResult,
  SetDefaultBankAccountInput,
  SetDefaultBankAccountResult,
} from '../../contracts/bank-accounts.contracts';

/**
 * MockAdapter — bank accounts.
 *
 * Demo-only persistence: only the MASKED representation and non-sensitive
 * fields are ever written to localStorage — the full IBAN typed in the
 * "add account" form is used once (to compute the mask + run the checksum)
 * and discarded; it never reaches this storage layer.
 *
 * No real ownership verification happens here — see
 * verifyBankAccountOwnershipMock below for the isolated, explicit demo
 * outcomes. No titularity string-matching, no security logic.
 */

const STORAGE_KEY = 'manises_bank_accounts';

const DEFAULT_ACCOUNTS: BankAccountDto[] = [
  {
    id: 'bank-1',
    ibanMasked: 'ES12 **** **** **** 7890',
    bank: 'Banco Sabadell',
    alias: 'Cuenta Principal',
    isDefault: true,
    verificationStatus: 'unverified',
  },
];

function normalizeIban(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase();
}

/** Valida la forma del intento fallido al leer de localStorage, que puede traer cualquier cosa. */
function isFailedAttempt(value: unknown): value is NonNullable<BankAccountDto['lastFailedVerification']> {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (v.outcome === 'mismatch' || v.outcome === 'unavailable' || v.outcome === 'error')
    && typeof v.at === 'string';
}

function maskIban(value: string): string {
  const clean = normalizeIban(value);
  return `${clean.slice(0, 4)} **** **** **** ${clean.slice(-4)}`;
}

/**
 * Migrates whatever shape was previously stored (including the pre-this-phase
 * demo shape with `iban`/`holderName`) into the current BankAccountDto shape.
 * Any account that didn't already carry `verificationStatus` is treated as
 * legacy demo data and always lands on 'unverified' — no historical
 * verification is ever invented.
 */
function migrateStoredAccount(raw: unknown): BankAccountDto | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string') return null;

  const isPreExistingNewShape = r.verificationStatus === 'verified' || r.verificationStatus === 'unverified';

  return {
    id: r.id,
    ibanMasked: typeof r.ibanMasked === 'string' ? r.ibanMasked
      : typeof r.iban === 'string' ? r.iban
      : 'ES?? **** **** **** ????',
    bank: typeof r.bank === 'string' ? r.bank : undefined,
    alias: typeof r.alias === 'string' ? r.alias : undefined,
    isDefault: Boolean(r.isDefault),
    verificationStatus: isPreExistingNewShape ? (r.verificationStatus as BankAccountDto['verificationStatus']) : 'unverified',
    verifiedAt: isPreExistingNewShape && r.verificationStatus === 'verified' && typeof r.verifiedAt === 'string' ? r.verifiedAt : undefined,
    lastFailedVerification: isFailedAttempt(r.lastFailedVerification) ? r.lastFailedVerification : undefined,
  };
}

/** Exported for reuse by withdrawals.mock.ts (needs the masked IBAN for a given bankAccountId). */
export function readStoredAccounts(): BankAccountDto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ACCOUNTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_ACCOUNTS;
    const migrated = parsed.map(migrateStoredAccount).filter((a): a is BankAccountDto => a !== null);
    return migrated.length > 0 ? migrated : DEFAULT_ACCOUNTS;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

function writeStoredAccounts(accounts: BankAccountDto[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // Demo persistence only — a failure here (e.g. storage disabled) must not break the flow.
  }
}

export async function listBankAccountsMock(): Promise<BankAccountDto[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(readStoredAccounts()), 400);
  });
}

export async function addBankAccountMock(input: AddBankAccountInput): Promise<AddBankAccountResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const accounts = readStoredAccounts();
      const newAccount: BankAccountDto = {
        id: `bank-${Date.now()}`,
        ibanMasked: maskIban(input.iban),
        bank: input.bank?.trim() || undefined,
        alias: input.alias?.trim() || undefined,
        isDefault: accounts.length === 0,
        verificationStatus: 'unverified',
      };

      const updated = [...accounts, newAccount];
      writeStoredAccounts(updated);
      resolve({ bankAccount: newAccount });
    }, 700);
  });
}

/**
 * El interruptor de desenlaces de demo vive en
 * features/profile/data/bankVerificationDemo.ts, que es de donde también
 * los lee el formulario de alta para ofrecerlos como atajo. Aquí solo se
 * interpretan. No es un algoritmo de titularidad: nunca compara ningún
 * nombre, es una búsqueda fija de valores reservados.
 */
export async function verifyBankAccountOwnershipMock(input: VerifyBankAccountInput): Promise<VerifyBankAccountResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const accounts = readStoredAccounts();
      const account = accounts.find((a) => a.id === input.bankAccountId);
      if (!account) {
        reject(new Error('bank-accounts.verifyOwnership: unknown bankAccountId'));
        return;
      }

      const key = (account.alias ?? '').trim().toLowerCase();
      const outcome = DEMO_ALIAS_OUTCOMES[key] ?? 'verified';
      const now = new Date().toISOString();

      // Se persisten LOS DOS desenlaces, no solo el bueno. Un intento
      // fallido deja constancia en la cuenta (lastFailedVerification) para
      // que la UI pueda explicar después por qué sigue sin verificar; un
      // intento correcto la verifica y borra ese recuerdo.
      const updatedAccount: BankAccountDto = outcome === 'verified'
        ? { ...account, verificationStatus: 'verified', verifiedAt: now, lastFailedVerification: undefined }
        : { ...account, lastFailedVerification: { outcome, at: now } };

      writeStoredAccounts(accounts.map((a) => (a.id === updatedAccount.id ? updatedAccount : a)));

      resolve({ outcome, bankAccount: updatedAccount });
    }, 1100);
  });
}

/**
 * Removes an account. If it was the default, no other account is
 * auto-promoted — explicit, minimal rule: the user picks the next default
 * themselves (setDefaultBankAccountMock) rather than the system guessing.
 * Deleting an unknown id is a no-op that still resolves with the current list.
 */
export async function deleteBankAccountMock(input: DeleteBankAccountInput): Promise<DeleteBankAccountResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const accounts = readStoredAccounts().filter((a) => a.id !== input.bankAccountId);
      writeStoredAccounts(accounts);
      resolve({ accounts });
    }, 500);
  });
}

/**
 * Marks exactly one account as default, clearing the flag on every other
 * one. Setting an unknown id leaves every account's isDefault untouched.
 */
export async function setDefaultBankAccountMock(input: SetDefaultBankAccountInput): Promise<SetDefaultBankAccountResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const accounts = readStoredAccounts();
      if (!accounts.some((a) => a.id === input.bankAccountId)) {
        reject(new Error('bank-accounts.setDefault: unknown bankAccountId'));
        return;
      }
      const updated = accounts.map((a) => ({ ...a, isDefault: a.id === input.bankAccountId }));
      writeStoredAccounts(updated);
      resolve({ accounts: updated });
    }, 400);
  });
}
