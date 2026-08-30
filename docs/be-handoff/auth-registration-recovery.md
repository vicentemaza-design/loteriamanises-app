# Login, Recuperación de Contraseña y Registro

Documento de handoff técnico para estas fases: login por email/contraseña,
recuperación de contraseña, y registro manual en 3 pasos + pantalla "Verifica
tu email". NO cubre verificación real de email (próxima fase), KYC, cuentas
bancarias ni retiradas — esas fases se documentarán aparte.

## Estado actual (FE)

- Login por email/contraseña: `src/features/auth/hooks/useLogin.ts` → `client.auth.loginWithEmail()`
- Recuperación de contraseña: `src/features/auth/hooks/usePasswordRecovery.ts` → `client.auth.requestPasswordReset()`
- Registro: `src/features/auth/hooks/useRegister.ts` → `client.auth.register()`
- Contratos: `src/services/api/contracts/auth.contracts.ts` (`LoginInput`, `LoginResult`, `RequestPasswordResetInput`, `RequestPasswordResetResult`, `RegisterInput`, `RegisterResult`, `DocumentType`, `AuthErrorCode`)
- Interfaz: `src/services/api/providers/api.provider.ts` (`IApiProvider.auth`)
- Páginas: `LoginPage.tsx`, `RecoverPasswordPage.tsx`, `EmailSentPage.tsx`, `RegisterPage.tsx`, `VerifyEmailPage.tsx` (`src/features/auth/pages/`)

**Google Sign-In no cambia en esta fase.** Sigue funcionando exactamente igual que
antes, vía Firebase Auth directamente desde `AuthProvider.tsx`/`auth.service.ts` —
no pasa por `IApiProvider.auth` ni por los adapters descritos aquí.

## LOGIN

### Flujo

```
Usuario rellena email + contraseña
  → LoginPage.handleLogin()
  → useLogin.login(email, password)
  → validación cliente (email/contraseña no vacíos, formato de email razonable)
  → client.auth.loginWithEmail({ email, password })
  → BE valida credenciales
  → Éxito: LoginResult { user, profile, emailVerified? }
  → Error: AuthError con un AuthErrorCode (ver tabla de errores)
```

**FE enviará:** `email`, `password` (`LoginInput`, `src/services/api/contracts/auth.contracts.ts`).

**FE necesita recibir:**
- Si la autenticación fue correcta o incorrecta.
- Un usuario/perfil mínimo (`AuthUserDto`/`UserProfileDto`, ya definidos en `auth.contracts.ts` — mismo shape que el resto de la app).
- El estado de sesión que corresponda según la arquitectura definitiva que decida BE (JWT propio, cookie, sesión Firebase custom, etc.). El FE no asume nada sobre el mecanismo de sesión en esta fase — solo consume `LoginResult`.

`emailVerified` es opcional en el contrato (`LoginResult.emailVerified?: boolean`) porque la verificación de email todavía no está modelada — se añadirá cuando exista esa fase, sin romper el contrato actual.

### Estado real hoy

**No implementado contra ningún backend real.** Los tres adapters se comportan así:

| Adapter | Comportamiento actual |
|---|---|
| `mock` (por defecto en la demo) | `loginWithEmailMock` siempre rechaza con `AuthError('service_unavailable')` tras ~600ms simulados. Nunca crea sesión, nunca toca `localStorage`. |
| `firebase` | Stub explícito — `console.warn` + `throw new AuthError('service_unavailable')`. Deliberadamente NO conectado a `signInWithEmailAndPassword` de Firebase; requiere autorización aparte. |
| `http` | Stub explícito — `throw new Error('HttpAdapter: auth.loginWithEmail — pending BE endpoint definition')`. Sin URL inventada; BE debe definir la ruta y sustituir el throw por una llamada real (`apiPost`), manteniendo el shape `LoginInput`/`LoginResult`. |

## RECUPERACIÓN DE CONTRASEÑA

### Flujo

```
Usuario introduce email
  → RecoverPasswordPage.handleSubmit()
  → usePasswordRecovery.requestReset(email)
  → validación cliente (email no vacío, formato razonable)
  → client.auth.requestPasswordReset({ email })
  → Éxito → navega a EmailSentPage (misma pantalla, exista o no la cuenta)
  → Error → banner inline con mensaje genérico
```

**FE enviará:** `email` (`RequestPasswordResetInput`).

**FE necesita únicamente distinguir:**
- Petición aceptada (`{ requested: true }`) → se muestra "Email enviado".
- Error técnico (`AuthErrorCode`) → se muestra un banner de error.

**IMPORTANTE — anti-enumeración:** la respuesta visual NO debe permitir saber si la
cuenta existe. `EmailSentPage` muestra siempre el mismo mensaje
("Si existe una cuenta asociada a {email}, recibirás las instrucciones...")
independientemente de si BE encontró o no una cuenta con ese email. **BE debe
replicar esta garantía en el propio endpoint**: responder con éxito (o al menos
con el mismo comportamiento observable) tanto si el email existe como si no, y no
filtrar la diferencia por timing, código de error ni ningún otro canal.

### Estado real hoy

**Ningún token se genera, ningún email se envía.** El adapter `mock` siempre
resuelve `{ requested: true }` tras ~600ms simulados, independientemente del
email introducido — este es exactamente el comportamiento anti-enumeración que
BE deberá replicar contra datos reales. No se ha llamado a
`sendPasswordResetEmail` de Firebase ni se ha diseñado ningún backend.

## REGISTRO

### Flujo

```
PASO 1 (Acceso): email, password, repeatPassword
PASO 2 (Datos personales): firstName, lastName, documentType, documentNumber, birthDate, phone
PASO 3 (Condiciones): acceptTerms (obligatorio), acceptMarketing (opcional)
  → RegisterPage.handleSubmit()
  → useRegister.register(RegisterInput)
  → validación cliente completa (ver abajo, todas las reglas son UX)
  → client.auth.register(input)
  → Éxito: RegisterResult { user, profile, emailVerified: false }
  → navega a VerifyEmailPage ("Verifica tu email")
  → Error: AuthError con un AuthErrorCode (ver tabla de errores)
```

**FE envía** (`RegisterInput`, `src/services/api/contracts/auth.contracts.ts`):

- `email`
- `password`
- `firstName`
- `lastName`
- `documentType` (`'NIF' | 'NIE' | 'PASSPORT'`)
- `documentNumber`
- `birthDate` (string ISO `YYYY-MM-DD`)
- `phone`
- `acceptTerms` (boolean)
- `acceptMarketing` (boolean, **independiente** de `acceptTerms`)

**FE necesita recibir:**

- Usuario/perfil mínimo (`AuthUserDto`/`UserProfileDto`, mismo shape que login).
- `emailVerified: false` — siempre, en esta fase. No existe todavía ningún mecanismo real de verificación; el campo se añadió al contrato precisamente para que la siguiente fase pueda empezar a usarlo sin cambiar el shape.

### BE DEBE validar (no confiar en las validaciones de React)

Todas las validaciones descritas abajo son **exclusivamente UX** en el FE — impiden
que un usuario cometa un error obvio antes de enviar el formulario, pero no
sustituyen ninguna validación server-side:

- **Email**: formato y que no esté ya en uso. FE valida solo formato; **email
  duplicado solo puede detectarlo BE** (`AuthErrorCode: 'email_already_in_use'`,
  ya modelado y con mensaje preparado en el FE).
- **Password**: FE exige mínimo 8 caracteres, mayúscula, minúscula, número y
  carácter especial (`src/features/auth/lib/passwordRules.ts`) — **BE DEBE
  volver a validar la política de contraseña server-side**, no confiar en que
  el valor recibido ya la cumple.
- **Mayoría de edad**: FE calcula la edad con mes/día reales (`differenceInYears`
  de `date-fns`), no solo `año actual − año nacimiento` — pero es **únicamente
  UX**. **BE DEBE volver a validar mayoría de edad server-side** antes de
  completar el registro (`AuthErrorCode: 'underage'`, ya modelado en el FE).
- **Documento** (`documentNumber` + `documentType`): FE valida
  (`src/features/auth/lib/registerValidation.ts`) **formato + letra de
  control** para NIF y NIE (NIF = 8 dígitos + letra, NIE = X/Y/Z + 7 dígitos +
  letra, ambos con el checksum oficial `resto = número % 23` contra la tabla
  `TRWAGMYFPDXBNJZSQVHLCKE`), y **solo formato** para Pasaporte (alfanumérico
  5–15 caracteres — no existe un checksum universal aplicable a pasaportes de
  cualquier país). **Esto sigue siendo validación de cliente, no sustituye a
  BE**: **BE DEBE volver a validar TODO server-side** (formato, checksum
  NIF/NIE, y además **unicidad y cualquier política documental definitiva**
  que determine el negocio).
- **Teléfono**: FE aplica un formato laxo para España (9 dígitos, prefijo
  opcional `+34`/`0034`) — normalización final pendiente de definir con BE.
- **Términos obligatorios**: FE bloquea "Crear cuenta" y el botón de Google
  si `acceptTerms` no está marcado — **BE DEBE rechazar el registro si
  `acceptTerms` no llega en `true`**, no confiar en que el FE ya lo filtró.
- **Consentimiento comercial independiente**: `acceptMarketing` es un campo
  separado, por defecto `false`, nunca inferido de `acceptTerms`. **BE NO
  DEBE inferir consentimiento comercial de la aceptación de términos** bajo
  ninguna circunstancia.

### BE DEBE (almacenamiento y trazabilidad)

- Almacenar el consentimiento legal (`acceptTerms`) junto con la versión de
  las condiciones aceptadas y un timestamp, según la política definitiva que
  decida el negocio/legal — el FE no impone ningún formato concreto para esto.
- Almacenar `acceptMarketing` como un consentimiento independiente y
  auditable por separado del legal.
- No inferir ni "activar por defecto" ningún consentimiento comercial.

### Estado real hoy

**No implementado contra ningún backend real.** Los tres adapters:

| Adapter | Comportamiento actual |
|---|---|
| `mock` (por defecto en la demo) | `registerMock` (`src/services/api/adapters/mock/auth.mock.ts`) resuelve tras ~800ms simulados con un `RegisterResult` **sintético**: `uid` generado en cliente (`mock-xxxxxxxx`), `profile.balance: 0`, `emailVerified: false`. **No crea sesión real** (no toca `AuthContext`, no hay `onAuthStateChanged` involucrado), **no persiste nada** — ni siquiera el propio resultado se guarda en ningún sitio tras navegar a "Verifica tu email". `password`, `documentNumber`, `birthDate` y `phone` nunca se devuelven, ni se loguean, ni se escriben en `localStorage`/`sessionStorage`. |
| `firebase` | Stub explícito — `console.warn` + `throw new AuthError('service_unavailable')`. Deliberadamente NO conectado a `createUserWithEmailAndPassword` de Firebase. Google Sign-Up (que sí sigue funcionando) es independiente de este stub. |
| `http` | Stub explícito — `throw new Error('HttpAdapter: auth.register — pending BE endpoint definition')`. Sin URL inventada. |

### "Verifica tu email" — acciones preparadas, no implementadas

`VerifyEmailPage.tsx` incluye dos acciones junto al CTA principal, ambas ya
implementadas end-to-end contra `IApiProvider` (ver sección "VERIFICACIÓN DE
EMAIL" más abajo para el detalle completo):

- **"Reenviar email"** — llama a `client.auth.resendVerificationEmail()`.
  En mock resuelve tras una latencia simulada y muestra "Te hemos enviado un
  nuevo email de verificación.". No se envía ningún email real ni se genera
  ningún token — HttpAdapter tiene un stub explícito pendiente de endpoint BE.
- **"Cambiar email"** — abre un formulario inline (no navega fuera de la
  pantalla) que llama a `client.auth.changePendingEmail()`. En mock solo
  actualiza el email mostrado en pantalla; no crea otra cuenta, no persiste
  nada, no toca Firebase. HttpAdapter tiene un stub explícito pendiente de
  endpoint BE.

La verificación real (generación de token, envío de email real, confirmación
server-side, `emailVerified: true` persistido) sigue pendiente de BE — ver
la sección "VERIFICACIÓN DE EMAIL" para lo que el FE ya tiene listo y lo que
falta implementar en servidor.

## Errores que FE está preparado para mostrar

FE ya renderiza un mensaje específico para cada uno de estos códigos
(`AuthErrorCode`, `src/services/api/contracts/auth.contracts.ts`). No se imponen
códigos HTTP concretos — BE puede usar los que le convengan; el FE solo necesita
que el error se pueda mapear a uno de estos `code`:

| `AuthErrorCode` | Cuándo | Mensaje mostrado hoy |
|---|---|---|
| `invalid_credentials` | Credenciales inválidas | "Email o contraseña incorrectos." |
| `validation_error` | Error de validación | "Revisa los datos introducidos." |
| `technical_error` | Error técnico genérico | "Ha ocurrido un error técnico. Inténtalo de nuevo." |
| `rate_limited` | Demasiados intentos | "Demasiados intentos. Espera unos minutos antes de volver a intentarlo." |
| `service_unavailable` | Servicio no disponible / operación aún no soportada | "El acceso con email estará disponible próximamente. Usa Google para entrar." |
| `email_already_in_use` | Email ya registrado (solo registro) | "Ya existe una cuenta con este email." |
| `underage` | BE detecta menor de edad (solo registro, defensa en profundidad tras la validación UX) | "Debes ser mayor de 18 años para crear una cuenta." |

Si BE necesita un código adicional que no encaje en esta lista, avisar para
ampliar `AuthErrorCode` — es un tipo cerrado a propósito para que el FE pueda
tener un mensaje definido para cada valor.

Nota: el resto de errores que el FE ya sabe representar en el formulario de
registro (email con formato inválido, contraseña que no cumple la política,
contraseñas que no coinciden, campos obligatorios vacíos, términos no
aceptados) se resuelven **enteramente en cliente**, antes de llamar a
`client.auth.register()` — no necesitan ningún `AuthErrorCode` porque la
petición ni siquiera llega a dispararse si fallan.

## PENDIENTE DE BE

- Definir el endpoint/mecanismo real de login por email/contraseña (`HttpAdapter.auth.loginWithEmail` está preparado con un `throw` explícito, sin URL inventada, a la espera de la definición).
- Definir el endpoint/mecanismo real de recuperación de contraseña (`HttpAdapter.auth.requestPasswordReset`, mismo estado).
- Decidir la arquitectura de sesión definitiva para email/contraseña (JWT propio, cookie httpOnly, u otra) — el contrato `LoginResult` no asume ninguna en concreto.
- Implementar rate limiting real en login/recuperación (hoy no existe ni cliente ni servidor — ver auditoría de seguridad).
- Garantizar anti-enumeración en el propio endpoint de recuperación, no solo en el copy del FE.
- Cuando exista verificación de email, decidir cómo se comunica `emailVerified` en `LoginResult`/`RegisterResult` y si debe bloquear alguna acción en FE.
- Rate limiting, CAPTCHA o bloqueo por intentos fallidos — sin diseñar todavía, ni siquiera a nivel de requisito.
- Definir el endpoint/mecanismo real de registro (`HttpAdapter.auth.register` está preparado con un `throw` explícito, sin URL inventada).
- Validar server-side: formato y unicidad de email, política de contraseña, mayoría de edad (con mes/día reales), documento (checksum/unicidad real), términos obligatorios — ver sección REGISTRO arriba para el detalle completo.
- Decidir el formato de almacenamiento del consentimiento legal (versión + timestamp) y del consentimiento comercial (independiente, nunca inferido).
- Implementar server-side la verificación de email: generación del token/enlace, envío real del email, endpoint de confirmación (`HttpAdapter.auth.verifyEmail`), endpoint de reenvío (`HttpAdapter.auth.resendVerificationEmail`) y endpoint de cambio de email pendiente (`HttpAdapter.auth.changePendingEmail`) — los tres stubs ya existen en FE con un `throw` explícito, sin URL inventada. Ver sección "VERIFICACIÓN DE EMAIL" para el contrato exacto que el FE ya consume.
- Decidir si el registro manual (no-Google) requiere algún paso adicional de verificación de documento/identidad antes de completarse, o si eso queda enteramente para la fase de KYC.

## VERIFICACIÓN DE EMAIL (implementado en FE — mock; pendiente de BE)

Esta fase implementa completamente el lado FE de la verificación de email:
contratos, `IApiProvider`, mock adapter, stubs en `HttpAdapter`/`FirebaseAdapter`,
hooks y las dos pantallas necesarias. **No hay backend real conectado**: no se
genera ningún token, no se envía ningún email, `emailVerified` nunca se
escribe a `true` de forma real en esta fase.

### Modelo de estado (contrato con BE)

- `emailVerified?: boolean` es el **único estado persistente** del usuario
  relacionado con esta fase. Vive en `UserProfileDto`/`UserProfile`
  (`src/services/api/contracts/auth.contracts.ts`, `src/shared/types/domain.ts`)
  y se espera que llegue por el canal **ya existente**: `getCurrentUser()` /
  `AuthContext.profile`. No existe ni se ha añadido ningún endpoint de estado
  independiente.
- `'verified' | 'expired' | 'invalid'` (`VerifyEmailOutcome`) y
  `'rate_limited' | 'service_unavailable'` (vía `AuthErrorCode`) son
  **outcomes de una operación puntual** (intentar reenviar, cambiar email o
  consumir un enlace) — nunca se escriben en `UserProfile`, nunca se
  confunden con el estado persistente de arriba.
- El FE **no depende de `auth.user.emailVerified` de Firebase** para nada de
  producto. BE debe decidir, cuando implemente esto de verdad, cómo mapea a
  usuarios de Google en el modelo definitivo (aceptar la verificación del
  proveedor vs. exigir verificación propia) — esa decisión no la toma el FE.

### `getEmailVerificationStatus()` — decisión: NO se ha añadido

Se evaluó explícitamente durante la implementación y **no se ha creado esta
operación**. Justificación: `emailVerified` ya está declarado en
`UserProfileDto`/`UserProfile`, así que en cuanto BE lo implemente fluirá de
forma natural por el canal `getCurrentUser()`/`AuthContext.profile` que el
resto de la app ya usa. Ni `VerifyEmailPage` (deriva su estado de
`RegisterResult.emailVerified`, ya `false`) ni la pantalla del enlace
(deriva su estado del outcome puntual `VerifyEmailResult.outcome`) necesitan
consultar un estado aparte. Si en el futuro aparece una necesidad real e
independiente de refrescar solo `emailVerified` sin recargar el perfil
completo, esta operación se puede añadir entonces — con esa justificación
explícita en el momento de hacerlo, no antes.

### Operaciones FE (contrato mínimo)

Definidas en `src/services/api/contracts/auth.contracts.ts` y expuestas en
`IApiProvider.auth` (`src/services/api/providers/api.provider.ts`):

1. **`resendVerificationEmail({ email }) → { sent: true }`** — reenvía el
   email de verificación a la cuenta ya registrada. Rechaza con `AuthError`
   (`rate_limited` / `service_unavailable` / `technical_error`).
2. **`changePendingEmail({ newEmail }) → { email }`** — cambia el email de
   una cuenta aún no verificada. Rechaza con `AuthError`
   (`email_already_in_use` / `rate_limited` / `service_unavailable` /
   `technical_error`).
3. **`verifyEmail({ token }) → { outcome: 'verified' | 'expired' | 'invalid' }`**
   — consume el enlace recibido por email. El `token` es **opaco**: el FE
   nunca lo decodifica, nunca infiere `userId`/email a partir de él, nunca lo
   persiste ni lo loguea. Un fallo técnico (red, rate limit, servicio caído)
   se representa como `AuthError`, no como un cuarto valor de `outcome`.

No se ha añadido una cuarta operación de status — ver apartado anterior.

### Páginas y rutas

- **`/register/verify-email`** (`VerifyEmailPage.tsx`, dentro de
  `PublicLayout`, sin cambios de ruta) — pantalla tras el registro. Lee el
  email exclusivamente de `location.state` (sin `localStorage`/`sessionStorage`/
  query string). Si se accede sin ese estado (refresco directo, enlace
  compartido, etc.) se muestra una pantalla dedicada — "Sin verificación
  pendiente" / "No tenemos una verificación pendiente en esta sesión." — con
  dos acciones seguras (volver a login o volver al registro), en lugar de
  texto `undefined` o una copia engañosa. "Cambiar email" abre un formulario
  inline (no navega fuera de la pantalla ni reinicia el wizard de registro).
- **`/verify-email/:token`** (`VerifyEmailLinkPage.tsx`, nueva) — representa
  el enlace que el usuario recibe por email. Es una ruta **standalone**, fuera
  de `PublicLayout` (que redirige a cualquier usuario autenticado/demo a
  `/home`, lo que rompería el flujo para alguien ya logueado que hace clic en
  su enlace) y fuera de `RequireAuth` (debe funcionar también sin sesión).
  Estados: verificando → verificado / caducado / inválido / error técnico
  (con reintento). El botón "Ir a mi cuenta" del estado verificado navega a
  `/home` si ya hay sesión/demo activa, o a `/login` si no — **no crea ninguna
  sesión ni toca `AuthContext`/Firebase**, solo representa el resultado
  visualmente.

### Comportamiento del mock (`src/services/api/adapters/mock/auth.mock.ts`)

- `resendVerificationEmailMock` — resuelve `{ sent: true }` tras ~700ms.
- `changePendingEmailMock` — resuelve `{ email }` tras ~700ms; rechaza con
  `email_already_in_use` si el nuevo email es exactamente `usado@example.com`
  (valor reservado para demo).
- `verifyEmailMock` — reconoce tres tokens explícitos y aislados en el mock:
  `demo-success` → `verified`, `demo-expired` → `expired`,
  `demo-invalid` → `invalid`. **Cualquier otro valor no reconocido devuelve
  `invalid` por defecto** (elección deliberada: es más seguro fallar cerrado
  que mostrar "verificado" ante un token desconocido).
- Ninguna de las tres toca `AuthContext`, Firebase, ni persiste PII.

### Stubs `HttpAdapter` / `FirebaseAdapter`

- `HttpAdapter` — las tres operaciones lanzan `Error('HttpAdapter: auth.<método>
  — pending BE endpoint definition')`, sin URL inventada, siguiendo el mismo
  patrón que `login`/`register`/`requestPasswordReset`.
- `FirebaseAdapter` — las tres operaciones son stubs explícitos
  (`console.warn` + `throw new AuthError('service_unavailable')`). **No**
  están conectadas a `sendEmailVerification`, `applyActionCode`,
  `checkActionCode` ni `updateEmail` de Firebase Auth. El flujo de Google
  Sign-In (`AuthProvider.tsx` / `auth.service.ts`) no se ha tocado.

### Lo que BE debe implementar server-side

- Generación del token/enlace de verificación y su expiración.
- Envío real del email de verificación (inicial, reenvío, tras cambio de email).
- Invalidación del token tras un uso exitoso y tras un cambio de email.
- Unicidad del email en `changePendingEmail` (server-side, no solo el valor
  reservado del mock).
- Anti-abuso/rate limiting real en reenvío y cambio de email (hoy no existe
  ni cliente ni servidor).
- Actualización de `emailVerified` en el registro del usuario tras una
  verificación exitosa, expuesta por el canal `getCurrentUser()` ya existente.
- Decidir el mapeo de usuarios de Google respecto a `emailVerified` (ver
  apartado "Modelo de estado" arriba).

No se especifican aquí tablas, SQL, formato de token ni arquitectura interna
— eso queda a criterio de BE.

## Fuera de alcance de esta fase (ya detectado en auditoría previa, no tocado en este cambio)

Se detectaron en la auditoría de seguridad previa y siguen pendientes de revisión
con BE antes de producción — **no se ha modificado nada de esto en este handoff**:

- `firestore.rules` permite a cualquier usuario autenticado leer/escribir cualquier documento.
- El saldo (`balance`) puede modificarse libremente desde el cliente.
- `/play/:gameId` no está protegido por `RequireAuth`.
- PIN de bloqueo de app con valor por defecto hardcodeado `1234`.
- No debe existir ninguna API key secreta en el bundle cliente. La autenticación, tokens, correo y rate limiting deben permanecer server-side.
- Configuración de Firebase de producción trackeada en git.
- Logs verbose (`enableVerboseApiLogs`) activos también en producción.
