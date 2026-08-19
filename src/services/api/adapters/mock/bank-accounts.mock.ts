import type {
  AddBankAccountInput,
  AddBankAccountResult,
  BankAccountDto,
  VerifyBankAccountInput,
  VerifyBankAccountResult,
  BankAccountVerificationOutcome,
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
 * Demo-only outcome switch, isolated to this file. Controlled by the
 * account's `alias` (case-insensitive) so a demo presenter can reproduce
 * any of the 4 outcomes on demand by naming the account accordingly when
 * adding it. This is NOT a titularity-matching algorithm — it never
 * compares against any holder name, it is only a fixed lookup of reserved
 * demo values, same pattern as the email-verification phase's demo tokens.
 */
const DEMO_ALIAS_OUTCOMES: Record<string, BankAccountVerificationOutcome> = {
  'demo mismatch': 'mismatch',
  'demo unavailable': 'unavailable',
  'demo error': 'error',
};

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

      const updatedAccount: BankAccountDto = outcome === 'verified'
        ? { ...account, verificationStatus: 'verified', verifiedAt: new Date().toISOString() }
        : account;

      if (outcome === 'verified') {
        writeStoredAccounts(accounts.map((a) => (a.id === updatedAccount.id ? updatedAccount : a)));
      }

      resolve({ outcome, bankAccount: updatedAccount });
    }, 1100);
  });
}
