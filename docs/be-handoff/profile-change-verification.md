# Confirmación de cambio de perfil con código de 6 dígitos

Documento de handoff técnico para el módulo "Confirmación de cambio con código":
ningún cambio hecho en la pantalla de datos personales/cuenta se aplica hasta
que el usuario confirma un código de 6 dígitos enviado por email. NO cubre
verificación inicial de email, recuperación de contraseña, banco ni
retiradas — esas fases se documentan aparte (ver `auth-registration-recovery.md`,
`bank-account-verification.md`, `withdrawals.md`).

## Estado actual (FE)

- Pantalla: `src/features/profile/pages/AccountPage.tsx` (ruta `/profile/account`)
- Modal: `src/features/profile/components/ProfileChangeVerificationModal.tsx`
- Hook: `src/features/profile/hooks/useProfileChangeVerification.ts`
- Input de 6 dígitos (genérico, reutilizable): `src/shared/ui/OtpInput.tsx`
- Contratos: `src/services/api/contracts/profile.contracts.ts`
  (`RequestProfileChangeVerificationInput/Result`, `ConfirmProfileChangeVerificationInput/Result`,
  `ProfileChangeVerificationOutcome`)
- Interfaz: `src/services/api/providers/api.provider.ts` (`IApiProvider.profile`)
- Mock: `src/services/api/adapters/mock/profile.mock.ts`

## Flujo

```
Usuario edita datos (nombre, dirección, email, etc.)
  → pulsa "Guardar cambios"
  → validación de formulario (ej. email/confirmación coinciden)
  → NO se persiste nada todavía
  → se abre ProfileChangeVerificationModal, que pide un código automáticamente
  → client.profile.requestProfileChangeVerification({ email })
  → usuario introduce el código de 6 dígitos
  → client.profile.confirmProfileChangeVerification({ code })
  → outcome 'confirmed' → SOLO ENTONCES: AuthContext.updateProfile(cambios)
  → outcome 'invalid' | 'expired' → nada se aplica, el usuario puede reintentar/reenviar
  → cerrar el modal (X, backdrop, abandono) en cualquier punto → nada se aplica
```

**FE enviará:**
- `requestProfileChangeVerification`: `{ email }` — ver "Cambio del propio email" abajo para la decisión pendiente sobre qué email usar.
- `confirmProfileChangeVerification`: `{ code }` — el código de 6 dígitos tal cual lo introduce el usuario.

**FE necesita recibir:**
- De la solicitud de código: solo `{ sent: true }` o un `AuthError` (`rate_limited`, `service_unavailable`, etc. — ver `features/auth/lib/authErrors.ts`, reutilizado tal cual, no se ha creado un tipo de error paralelo).
- De la confirmación: `{ outcome: 'confirmed' | 'invalid' | 'expired' }`. Estos son resultados de UN intento, nunca estado persistente del usuario.

## Estado real hoy

**No implementado contra ningún backend real.** Los tres adapters se comportan así:

| Adapter | Comportamiento actual |
|---|---|
| `mock` (por defecto en la demo) | Determinista — ver "Mock / demo" abajo. |
| `firebase` | Stub explícito — `console.warn` + `throw new AuthError('service_unavailable')`. Enviar/validar un OTP real por email requiere un proveedor de correo + rate-limiting/caducidad server-side, no documentos Firestore escribibles por el cliente. |
| `http` | Stub explícito — `throw new Error('HttpAdapter: profile.request/confirmProfileChangeVerification — pending BE endpoint definition')`. Sin URL inventada; BE debe definir la ruta. |

## Mock / demo

Archivo: `src/services/api/adapters/mock/profile.mock.ts`.

- `requestProfileChangeVerificationMock`: siempre resuelve `{ sent: true }` tras ~700ms, **excepto** si `email === 'error-envio@example.com'` (constante reservada `DEMO_EMAIL_SEND_ERROR`), que rechaza con `AuthError('service_unavailable')` para poder demostrar el estado "Error de envío". Nota: en el flujo real de `AccountPage`, el email de destino es siempre `profile.email` (el email verificado del usuario demo, `demo@loteriamanises.com`), así que este camino de error no es alcanzable espontáneamente desde la UI hoy — es una sonda determinista pensada para pruebas directas contra el mock o para cuando el email de destino deje de estar fijado a `profile.email`.
- `confirmProfileChangeVerificationMock`: reconoce exactamente dos códigos reservados (nunca inferidos de nada real):
  - `'123456'` (`DEMO_OTP_CODE_CORRECT`) → `{ outcome: 'confirmed' }`
  - `'000000'` (`DEMO_OTP_CODE_EXPIRED`) → `{ outcome: 'expired' }`
  - Cualquier otro código de 6 dígitos → `{ outcome: 'invalid' }` (default seguro).
- Nada de esto persiste datos ni toca `AuthContext` — `AccountPage.handleChangesConfirmed()` es quien llama a `AuthContext.updateProfile()`, y solo tras `outcome === 'confirmed'`.

## Caducidad (15 minutos, referencia del cliente)

El FE **no es autoridad de seguridad** y no implementa un temporizador de
caducidad real: la caducidad de 15 minutos debe ser controlada por BE al
generar/validar el código. El mock solo simula el resultado de forma
determinista (código `'000000'` ⇒ `expired`) para poder probar la UI de ese
estado sin esperar 15 minutos reales. Cuando BE implemente el endpoint real,
el FE simplemente reflejará el `outcome` que devuelva — no requiere ningún
cambio en `useProfileChangeVerification`.

## Reenvío

Cooldown de 60 segundos gestionado enteramente en el FE
(`useProfileChangeVerification`, `RESEND_COOLDOWN_SECONDS`), puramente de UX
— BE debe aplicar su propio rate-limiting server-side independientemente de
este contador visual.

## Campos protegidos hoy

`AccountPage.tsx` mapea a `AuthContext.updateProfile()` (y por tanto al
gate de confirmación) únicamente los campos que **ya existen** en
`UserProfile` (`shared/types/domain.ts`): `address`, `postalCode`,
`municipality`, `province`, y `email` (cuando el usuario rellena "Nuevo
email"). `name`, `surname`, `phone`, `alternatePhone` y `country` del
formulario **no se han añadido** a `UserProfile` — ya eran puramente estado
local antes de esta tarea (el `handleSave` anterior tampoco los persistía en
ningún sitio), así que no se han inventado campos nuevos. Quedan protegidos
por el mismo modal de confirmación (ningún campo del formulario se guarda sin
código), pero su "aplicación" tras confirmar sigue siendo estado local, igual
que antes. Si en el futuro se añaden a `UserProfile`, entrarán automáticamente
en el mismo flujo sin cambios adicionales en el modal/hook.

## DECISIÓN PENDIENTE — Cambio del propio email

Cuando el campo que cambia es el email del usuario, `AccountPage` envía el
código al email **actual, ya verificado** (`profile.email`) — nunca al nuevo
valor que el usuario acaba de escribir y que aún no ha demostrado controlar.
Esto es el valor por defecto más seguro (evita que cualquiera escriba un
email que no controla y se autoapruebe el cambio), pero **BE/producto debe
confirmar o corregir este criterio**: ¿debe el código ir solo a la dirección
antigua, solo a la nueva, o a ambas? El FE no ha implementado ningún
comportamiento adicional (doble verificación antigua/nueva, etc.) por
iniciativa propia — ver `RequestProfileChangeVerificationInput` en
`profile.contracts.ts` para la nota exacta en el tipo.

## Errores mostrados en UI

| Caso | Copy |
|---|---|
| Código incorrecto | "El código introducido no es correcto. Inténtalo de nuevo." |
| Código caducado | "El código ha caducado. Solicita uno nuevo." |
| Error al enviar el código | "No hemos podido enviar el código. Inténtalo de nuevo." |
| Error al aplicar el cambio tras confirmar | "No hemos podido confirmar el cambio. Inténtalo de nuevo." |

Ninguno expone detalles técnicos — todos los `catch` mapean a estas 4 copies fijas.
