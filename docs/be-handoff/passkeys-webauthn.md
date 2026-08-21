# Passkeys / WebAuthn — FUTURE / NOT IMPLEMENTED

Status: **FUTURE / NOT IMPLEMENTED.** This document exists only to prepare
the frontend's architecture for an eventual Passkeys/WebAuthn integration.
No registration or authentication flow described here is wired up today —
there is no BE endpoint, no `navigator.credentials.create()`/`.get()` call,
and no stored credential anywhere in the app. Nothing in this document
should be read as a description of working functionality.

## Terminology — this is not "Face ID"

The frontend should never talk about this as "Face ID support". Face ID is
one possible **platform authenticator** among several (Touch ID, Windows
Hello, Android biometrics, a device PIN, a security key…). The correct
framing is always **Passkey** / **WebAuthn** / **autenticación biométrica
del dispositivo**. The browser — never the app — decides which authenticator
the OS presents to the user, and the app never gets direct access to any
sensor. Copy aimed at end users may mention "Face ID, Touch ID u otro método
seguro" as an illustrative example, but the technical name in code and docs
is Passkey/WebAuthn.

## What exists on the frontend today

- `src/shared/lib/webauthn.ts` — pure feature detection:
  `getWebAuthnSupport()` (sync, checks for `PublicKeyCredential` in
  `window`) and `isPlatformAuthenticatorAvailable()` (async wrapper around
  `PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()`).
  Neither function creates, requests, or transmits a credential. Both fail
  closed (`'unsupported'`/`false`) on any error, SSR, or older browsers.
- `src/shared/lib/webauthn.ts` — `WebAuthnSupport` (`'unsupported' |
  'supported' | 'unknown'`, FE-detectable device capability) and
  `src/features/profile/types/profile.types.ts` — `PasskeyStatus`
  (`'not_configured' | 'configured' | 'unavailable'`, the user's real
  credential state — must come from BE). These are deliberately two
  separate types, not one that mixes both: capability and actual
  registration are two different questions, and only BE can answer the
  second one.
- `src/features/profile/pages/BiometricsPage.tsx` — shows the device's
  Passkey capability (via the feature detection above) with honest copy
  ("Próximamente" / "no admite autenticación mediante Passkeys"). It does
  not offer a working toggle and does not claim any credential was
  registered.
- `src/app/components/AppLock.tsx` — has a disabled, inert button reserved
  for a future "unlock with Passkey" action on the local PIN screen. No
  `onClick`, `disabled` set explicitly.
- `LoginPage.tsx` is unchanged — Google and email/password remain the only
  working sign-in methods. See "Login (future)" below for how a Passkey
  option could appear later.

## A. Passkey registration (future)

1. FE requests registration options/challenge from BE for the signed-in
   user.
2. BE generates the challenge (and the rest of
   `PublicKeyCredentialCreationOptions`: rp, user, pubKeyCredParams,
   excludeCredentials, etc.).
3. FE calls `navigator.credentials.create({ publicKey: options })`.
4. FE sends the resulting credential (attestation response) to BE.
5. BE verifies the attestation/registration.
6. BE stores the public key / credential ID associated with the user.

## B. Passkey login (future)

1. FE requests authentication options/challenge from BE (typically just
   from an email, or usernameless via discoverable credentials).
2. BE generates the challenge.
3. FE calls `navigator.credentials.get({ publicKey: options })`.
4. FE sends the resulting assertion to BE.
5. BE verifies: challenge, origin, rpId, signature, counter (if
   applicable), and that the credential is associated with a real account.
6. BE creates a normal session/token exactly as it would for any other
   login method — no special-cased trust path for "it came from a
   passkey".

## C. Credential deletion / revocation (future)

BE must expose a way for a signed-in user to list and revoke the passkeys
associated with their account (e.g. from a future settings screen). A
revoked credential must be rejected on any subsequent login attempt.

## Backend is the sole authority for

- Challenge generation
- Challenge expiration
- Credential registration
- Public key storage
- Credential-to-user association
- rpId validation
- Origin validation
- Signature verification
- Replay prevention (counter checks, etc.)
- Credential revocation
- User/session creation
- Rate limiting
- Audit/security logging

The frontend is authority for **none** of the above. It only detects
device capability and, once BE exists, forwards challenges/responses
verbatim.

## Security notes

- `localStorage` (or any other client-only flag) is **never** valid proof
  that a passkey is registered — that fact lives exclusively in BE.
- The frontend must never store private keys or any WebAuthn secret; the
  private key never leaves the authenticator/device by design.
- "The device offered Face ID" is not the same as "this is the account
  owner" — user/identity assertions must always be validated by BE.
- No local flag may substitute for BE verification, and no insecure
  fallback (e.g. silently accepting the credential without a BE round-trip)
  may ever be introduced.

## Login (future) — how this could appear on LoginPage

Once the above BE contract exists, `LoginPage.tsx` could add an "Entrar
con Passkey" option alongside Google and email/password, gated by device
capability (`getWebAuthnSupport() === 'supported'`) and by a rollout flag
(see below). **No such button exists today** — this section is purely
forward-looking; adding it requires an approved product placeholder plus
the real BE endpoints.

## Feature flag (documented, not implemented)

A `VITE_ENABLE_PASSKEYS` build-time flag (default/absent = `false`, fail
closed) would be the natural way to roll this out once BE support lands —
consistent with the existing `VITE_API_PROVIDER` pattern already used in
`src/config/runtime.ts`. It is intentionally **not** wired into the code
yet: there is no working feature to gate, and adding an always-false check
around already-inert UI would be complexity without benefit. When BE work
starts, introduce it the same way `VITE_API_PROVIDER` is read in
`RUNTIME_CONFIG`, defaulting to disabled when unset.

## What's needed before any of this is real

- BE endpoints for registration options, registration verification,
  authentication options, authentication verification, and credential
  listing/revocation.
- A decision on rp ID / allowed origins per environment (demo, BE
  delivery, production).
- The `VITE_ENABLE_PASSKEYS` flag wired into `RUNTIME_CONFIG` once there is
  something real to gate.
- `PasskeyStatus` actually populated from a BE response (today nothing
  fetches it — the type exists but has no data source).
- Product sign-off on the LoginPage placement described above before any
  button is added there.
