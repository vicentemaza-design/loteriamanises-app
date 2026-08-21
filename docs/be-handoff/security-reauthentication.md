# Seguridad local (PIN) y reautenticación por acciones

This documents the new local PIN-lock layer added to the frontend: what it
protects, what it explicitly does **not** protect, and what Backend must
still validate independently. It complements — and does not replace —
`docs/be-handoff/profile-change-verification.md` (the existing email-OTP
flow) and `docs/be-handoff/passkeys-webauthn.md` (future Passkey support).

## What this is

A **local, device-side UI gate**: before certain screens/actions, the app
asks the person holding the phone to re-enter a 4-digit PIN. Two categories:

1. **User-configurable preferences** (`SecurityPreferences`, in
   `src/features/profile/types/profile.types.ts`): a master switch
   (`securityEnabled`) plus four independent toggles the user sets from
   `/profile/security` (`SecurityPage.tsx`):
   - `requireOnLaunch` — PIN on opening the app (drives `AppLock.tsx`).
   - `requireOnPurchase` — PIN before confirming a games/lottery purchase.
   - `requireOnWithdrawal` — PIN before submitting a withdrawal request.
   - `requireOnTopUp` — PIN before confirming a wallet top-up.
2. **A fixed business rule, not a preference**: reauthentication before any
   profile-data edit (`AccountPage.tsx`). This is `PROFILE_CHANGE_REAUTH_REQUIRED
   = true` in `src/features/profile/lib/security.ts` — a constant, not a
   field on `SecurityPreferences`, so there is deliberately no switch
   anywhere in the UI that could turn it off. It applies **unconditionally**,
   even when `securityEnabled` is false and every other toggle is off.

## What this is NOT

- **Not a backend authorization mechanism.** Matching the PIN locally proves
  only "this app instance was unlocked by someone who knew the PIN" — it
  proves nothing to any server, and it is never sent anywhere. It is not
  secure server authorization, not bank authentication, and not payment
  authorization.
- **Not a substitute for BE validation.** Every sensitive operation
  (purchase, withdrawal, top-up, profile change) still goes through exactly
  the same BE-facing call it did before this feature existed
  (`submitPlaySession`, `createWithdrawal`, the wallet top-up success
  handler, `updateProfile`). BE must continue to independently validate
  and authorize every one of these — session/auth tokens, balance checks,
  fraud/rate-limit rules, etc. — regardless of what the PIN gate did
  locally.
- **Not proof of identity.** A correct PIN means "someone who knows the PIN
  used this device", not "this is definitely the account owner" — the same
  caveat that already applies to `AppLock`'s pre-existing PIN and to
  Passkeys/biometrics generically (see passkeys-webauthn.md's security
  notes — the same principle applies here).

## PIN storage

- Only a SHA-256 **hash** of the PIN is stored (`localStorage`, key
  `app_pin_hash`), never the plain digits — see `createPin`/`verifyPin`
  in `src/features/profile/lib/security.ts`. This is a
  deterrent against casual inspection, not real cryptographic protection: a
  4-digit PIN only has 10,000 possibilities, so the hash cannot be treated
  as secret-proof. There is no OS keychain/secure-enclave API exposed to a
  web app, so this is the closest available "not plaintext" option within
  the current pure-frontend architecture.
- **There is no universal fallback PIN in production.** `verifyPin()` fails
  closed there: with no custom PIN ever created, it always returns `false`,
  and `useSecurityGate` opens `PinEntryModal` in `"create"` mode instead of
  `"verify"` — the person creates and confirms a real PIN right there, and
  that creation is what lets the action proceed. This applies even to the
  mandatory profile-change reauth (see above) for a user who never
  explicitly turned "Activar seguridad" on: they still get walked through
  creating a PIN first, never silently let through.
- **DEMO/QA only**: a single well-known convenience PIN (`1234`) is
  accepted by `verifyPin()`, but ONLY while no custom PIN has been created
  AND only when `isDemoEnvironment()` is true — which reads
  `RUNTIME_CONFIG.demoEnabled` (`src/config/runtime.ts`), a **dedicated,
  explicit opt-in flag** driven by `VITE_ENABLE_DEMO_ACCESS=true`. This is
  deliberately a *different* flag from `VITE_API_PROVIDER`/`apiProvider`:
  that one defaults to `'mock'` whenever left unset (so local dev keeps
  using mock data without extra configuration), and reusing it here would
  mean any unconfigured build silently exposed the demo PIN too. With
  `demoEnabled`, an absent/unset `VITE_ENABLE_DEMO_ACCESS` — including a
  build where only `VITE_API_PROVIDER` was forgotten — always resolves to
  `false` (fail closed). It never depends on `import.meta.env.DEV` alone,
  since a Vercel demo deployment can itself be a production build. Same
  flag also gates "Entrar en modo demo (sin cuenta)" on `LoginPage.tsx` —
  one single source of truth for both. This is purely a testing/demo
  convenience — **it is not part of the Backend contract**, is never
  available in a real BE/production build, and stops applying the moment a
  real PIN is created (from then on, in demo or production, only that PIN
  works — e.g. custom PIN `2468`: `"2468"` → true, `"1234"` → false).
- The PIN is never logged, never included in analytics/error reporting,
  and never transmitted to any endpoint.

## Interaction with the existing profile-change OTP flow

`AccountPage.tsx`'s `handleSave` now runs, in this fixed order:

1. **Local PIN reauth** (`useSecurityGate().requireReauth('profile')`) —
   always required, independent of any toggle. Quick, local, no network
   call. If no PIN exists yet, this is where a real one gets created in
   production (see "PIN storage" above) — or, in demo/QA only, `1234` can
   be used instead. If an existing PIN doesn't match, the flow stops here —
   the OTP modal never opens and nothing about the intended change is sent
   anywhere.
2. **Existing email-OTP modal** (`ProfileChangeVerificationModal.tsx`,
   unchanged) — only opens after step 1 succeeds. This remains the real,
   BE-validated confirmation: a 6-digit code sent to the user's email,
   verified by BE, and only then does `onConfirmed()` call
   `AuthContext.updateProfile()`.

The PIN step was **not** merged into or made to replace the OTP step — they
serve different purposes (device-owner check vs. BE-validated identity
confirmation) and both must pass. Nothing in `ProfileChangeVerificationModal.tsx`
or `useProfileChangeVerification.ts` was changed.

## What Backend must do

- Continue to independently authorize every purchase, withdrawal, top-up,
  and profile change exactly as it does today — the PIN gate changes
  nothing about what BE must validate.
- Nothing new is required from BE for the PIN feature itself: it is 100%
  client-local (no endpoint, no new field on any DTO, no new contract).
- If BE ever wants to enforce reauthentication server-side (e.g. requiring
  a fresh session/step-up token for withdrawals), that would be a
  completely separate, additive mechanism — this local PIN cannot serve
  that purpose no matter how it's wired up client-side.

## Biometrics / Passkeys — unchanged, still future

This feature does not touch the Passkeys/WebAuthn preparation work
documented in `docs/be-handoff/passkeys-webauthn.md`. `SecurityPage.tsx`
only shows a short pointer ("Biometría / Passkeys — Próximamente") toward
`/profile/biometrics` for feature-detection status; it does not add any
new biometric call, and:

- No `navigator.credentials.create()` / `.get()`.
- No simulated Face ID success.
- No `localStorage` flag used as proof of a biometric credential.

Everything in passkeys-webauthn.md (BE contract needed, security notes,
feature-flag plan) still applies unchanged.
