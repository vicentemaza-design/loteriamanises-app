# Login clásico (email/contraseña) y recuperación/restablecimiento de contraseña — contrato de producción

Documento de handoff técnico centrado específicamente en el **P0 de
producción**: login real por email/contraseña y el ciclo completo de
recuperación/restablecimiento de contraseña. No duplica el registro ni la
verificación de email — esos flujos ya están documentados con detalle en
`docs/be-handoff/auth-registration-recovery.md`; aquí solo se referencian
donde afectan al modelo de sesión.

## Alcance

- Login por email/contraseña — producción real, no mock.
- Recuperación de contraseña (solicitud) — ya documentada parcialmente en
  `auth-registration-recovery.md`; aquí se formaliza como contrato.
- **Restablecimiento de contraseña (con token) — actualmente NO EXISTE en el
  FE**, ni como pantalla ni como contrato. Es el hallazgo más importante de
  esta auditoría (ver sección "Restablecimiento").
- Modelo de sesión único para Google + email/contraseña.
- Arquitectura de token/sesión que espera hoy el HTTP adapter.

No cubre: registro, verificación de email, PIN local, Passkeys, Firestore
rules — todos documentados o auditados aparte.

## Requisito de producto (ya confirmado, no es una decisión pendiente)

En producción deben coexistir:
1. Login clásico (email + contraseña)
2. Login con Google (sin cambios — ver más abajo)
3. Recuperación de contraseña
4. Restablecimiento de contraseña

El botón "Entrar en modo demo" y "Entrar con Face ID (demo)" solo existen
con `RUNTIME_CONFIG.demoEnabled === true` y no deben tratarse como una
alternativa de producción.

---

## 1. LOGIN — estado actual

### Qué ocurre hoy cuando se pulsa "Entrar" con email/contraseña

```
LoginPage.handleLogin()
  → useLogin.login(email, password)          [src/features/auth/hooks/useLogin.ts]
  → validación cliente (email/password no vacíos, formato de email)
  → client.auth.loginWithEmail({ email, password })
  → siempre rechaza hoy, en los 3 adapters (ver tabla)
  → useLogin devuelve status:'error' + un AuthErrorCode ya mapeado a mensaje
```

| Adapter | Archivo:línea | Comportamiento |
|---|---|---|
| `mock` | `src/services/api/adapters/mock/auth.mock.ts` | Rechaza siempre con `AuthError('service_unavailable')` tras ~600ms simulados. |
| `firebase` | `src/services/api/adapters/firebase/firebase.adapter.ts` | Stub explícito: `console.warn` + `throw new AuthError('service_unavailable')`. NO conectado a `signInWithEmailAndPassword`. |
| `http` | `src/services/api/adapters/http/http.adapter.ts:88-90` | `throw new Error('HttpAdapter: auth.loginWithEmail — pending BE endpoint definition')`. Sin URL inventada. |

### El hallazgo crítico: aunque BE implemente el endpoint, HOY el resultado no se conecta a la sesión de la app

`useLogin.ts` (línea 14-17, comentario del propio código):

> "NOTE: today every adapter rejects this call... there is no real
> email/password session anywhere in the app. **Wiring a successful result
> into AuthContext is intentionally left for when BE actually implements
> the operation.**"

Es decir: `client.auth.loginWithEmail()` devuelve un `LoginResult { user,
profile }`, pero **nada del código actual toma ese resultado y lo escribe en
`AuthContext`** (`src/app/providers/AuthProvider.tsx`). El único lugar que
escribe `user`/`profile`/`isDemo` en el contexto real es:
- `onAuthStateChanged` de Firebase (login con Google), o
- `signInDemo()` (modo demo).

**Esto significa que conectar el login por email/contraseña no es solo "BE
implementa el endpoint" — también requiere un cambio de FE** para que
`useLogin`/`LoginPage` (tras un `LoginResult` exitoso) actualicen
`AuthContext` de la misma forma que `signInDemo()` ya lo hace. Ese cambio de
FE está bloqueado hoy, no por falta de esfuerzo, sino porque **no existe
todavía backend real contra el que probarlo** — implementarlo contra un
`throw` simulado sería construir sobre una API inventada.

### El segundo hallazgo crítico: el modelo de sesión de la app está tipado a Firebase

`src/features/auth/types/auth.types.ts`:

```ts
export interface AuthContextType {
  user: User | null;   // 👈 `User` es el tipo de `firebase/auth`, no un tipo propio
  profile: UserProfile | null;
  ...
}
```

`AuthContext.user` **no es un tipo propio de la app** — es literalmente el
tipo `User` del SDK de Firebase Auth (con métodos como `getIdToken()`,
`reload()`, etc., no solo datos). Un usuario autenticado vía HTTP/MySQL
**no puede producir un objeto de este tipo de forma limpia** sin recrear un
Firebase `User` falso (fragil, no recomendado).

Se auditaron los 10 archivos que consumen `user` de `useAuth()`
(`RequireAuth.tsx`, `PublicLayout.tsx`, `useTickets.ts`, `VerifyEmailLinkPage.tsx`,
`ResultsPage.tsx`, `useMovements.ts`, `useWallet.ts`, `usePlay.ts`,
`PlaySessionTray.tsx`, `usePlaySessionConfirm.ts`): **todos** lo usan solo
como señal de verdad ("¿hay alguien logueado?") o para leer `.uid` — ninguno
llama a métodos específicos de Firebase sobre `AuthContext.user` en esos
call sites. Esto es una buena noticia: **generalizar el tipo es viable sin
un refactor masivo**, pero sigue siendo una decisión de arquitectura que
debe tomarse explícitamente, no resolverse implícitamente.

**DECISIÓN BE/ARQUITECTURA NECESARIA**: `AuthContextType.user` debe dejar de
depender de `firebase/auth` y pasar a un tipo propio (p. ej. `AuthUserDto |
null`, ya definido en `auth.contracts.ts`), para que Google y
email/contraseña puedan alimentar el mismo modelo de sesión. Esto es un
cambio de FE, pero no debe hacerse hasta que BE confirme el contrato de
sesión final (ver sección 4).

---

## 2. RECUPERACIÓN DE CONTRASEÑA (solicitud) — estado actual

Ya documentado en detalle en `auth-registration-recovery.md`. Resumen:

```
RecoverPasswordPage → usePasswordRecovery.requestReset(email)
  → client.auth.requestPasswordReset({ email })
  → Éxito → navega a EmailSentPage (SIEMPRE el mismo mensaje, exista o no la cuenta)
```

- `mock`: siempre resuelve `{ requested: true }` tras ~600ms — este es
  exactamente el comportamiento anti-enumeración que BE debe replicar.
- `firebase`/`http`: stubs explícitos, sin URL inventada.

**Nada de esto cambia en este documento** — se cita aquí solo para dejar
claro dónde termina la "solicitud" y dónde debería empezar el
"restablecimiento" (siguiente sección).

---

## 3. RESTABLECIMIENTO DE CONTRASEÑA — groundwork de FE ya construido

### Estado actual (actualizado — ya no es un hallazgo abierto de FE)

La ausencia de pantalla/ruta/contrato detectada en la auditoría inicial ya
se ha resuelto en el lado FE, siguiendo exactamente el patrón de
`VerifyEmailLinkPage.tsx`:

- **Ruta**: `/reset-password/:token` (`src/app/router/AppRouter.tsx`) —
  standalone, fuera de `PublicLayout` y de `RequireAuth`, igual que
  `/verify-email/:token`.
- **Pantalla**: `src/features/auth/pages/ResetPasswordPage.tsx` —
  formulario (nueva contraseña + confirmación, reutilizando
  `PasswordRequirementsList`/`passwordRules.ts`/`passwordsMatch` tal cual
  los usa `RegisterPage.tsx`) → estados `idle` / `submitting` / `success` /
  `expired` / `invalid` / `error`.
- **Hook**: `src/features/auth/hooks/useResetPasswordToken.ts` — mismo
  patrón que `useVerifyEmailToken.ts`.
- **Contrato**: `ResetPasswordInput { token, password }` /
  `ResetPasswordOutcome = 'reset' | 'expired' | 'invalid'` /
  `ResetPasswordResult { outcome }`, añadidos a `auth.contracts.ts` y a
  `IApiProvider.auth.resetPassword()`.
- **Mock**: `resetPasswordMock` (`src/services/api/adapters/mock/auth.mock.ts`)
  reconoce los mismos 3 tokens de demo que `verifyEmailMock`
  (`demo-success` → `reset`, `demo-expired` → `expired`, `demo-invalid` →
  `invalid`; cualquier otro valor → `invalid` por defecto, fail-closed).
- **Adapters `firebase`/`http`**: stubs explícitos, mismo patrón que el
  resto de operaciones de auth — `firebase` con `console.warn` + `AuthError`,
  `http` con `throw new Error('HttpAdapter: auth.resetPassword — pending BE
  endpoint definition')`, **sin URL inventada**.

El `token` de la URL se trata como **opaco** — nunca decodificado, nunca
inferido. Un `outcome: 'reset'` **no inicia sesión automáticamente**; el
usuario vuelve al login normal con su nueva contraseña.

### Por qué esto ya no bloquea a FE, pero sigue bloqueando el Punto 7

Esto cierra la pieza de FE que faltaba (categoría B de la auditoría
anterior: "puede prepararse pero no completarse"). **El Punto 7 sigue sin
poder marcarse PASS**: mientras el adapter `http` no esté conectado a un
endpoint real, cualquier intento de reset en un build apuntando a HTTP
falla honestamente con el estado `error` genérico — verificado en vivo,
nunca finge éxito. Sigue pendiente de BE: el endpoint
`POST /auth/password/reset` (sección 5) y las decisiones de arquitectura de
sesión (sección 4).

---

## 4. MODELO DE SESIÓN — contrato único propuesto

### Lo que el HTTP adapter YA asume hoy (convención existente, no inventar otra)

`src/services/api/adapters/http/http.adapter.ts`:

```ts
logout: async () => { await apiDelete('/auth/session'); },
getCurrentUser: () => apiGet<UserProfile | null>('/auth/me'),
```

Es decir, el propio adapter **ya asume** un recurso `/auth/session` (DELETE
para cerrarlo) y `/auth/me` (GET para el perfil actual). El contrato
propuesto abajo **reutiliza esta convención ya existente** en vez de
inventar `/auth/logout`/`/auth/login` sueltos.

### Token — qué espera hoy el HTTP client

`src/services/api/adapters/http/http.client.ts`:

```ts
async function getAuthToken(): Promise<string | null> {
  try {
    const { auth } = await import('@/shared/config/firebase');
    return auth.currentUser ? auth.currentUser.getIdToken() : null;
  } catch {
    return null;
  }
}
// ...
Authorization: `Bearer ${token}`
```

**Hallazgo importante**: hoy, el `Bearer` token que el adapter HTTP envía
**viene de Firebase** (`auth.currentUser.getIdToken()`), incluso en el
adaptador que se supone independiente de Firebase. Es decir, el adapter
HTTP actualmente **solo puede autenticar peticiones si el usuario también
tiene una sesión de Firebase activa** (típicamente vía Google) — una
mezcla transitoria, no una arquitectura definitiva.

El propio comentario del código ya anticipa la migración:

```ts
// Currently uses the Firebase ID token.
// When migrating to a custom JWT (MySQL backend), replace with:
//   return localStorage.getItem('jwt_token');
```

**DECISIÓN BE/ARQUITECTURA NECESARIA** — elegir uno de:

| Opción | Compatibilidad con FE actual | Nota de seguridad |
|---|---|---|
| **Bearer JWT en `localStorage`** | Mínimo cambio (`getAuthToken()` ya tiene el comentario preparado) | Expuesto a robo vía XSS si existiera alguna vulnerabilidad de inyección en la app — no hay mitigación específica hoy. |
| **Cookie `HttpOnly` + `SameSite`** | Requiere que `fetch` use `credentials: 'include'` (no está hoy en `http.client.ts`) y que BE gestione CSRF | Más seguro contra robo de token vía XSS; es la opción recomendada por defecto salvo que BE tenga una razón de peso para JWT en cliente. |
| **JWT + refresh token** | Requiere añadir un endpoint `/auth/refresh` y lógica de renovación en `http.client.ts` (no existe hoy) | Combina con cualquiera de las dos anteriores. |

Esta app **no debe implementar ninguna de estas por su cuenta "para cerrar
la tarea"** — es explícitamente una decisión de arquitectura que debe
tomar BE (o BE+FE conjuntamente), documentada aquí como pendiente.

### Contrato único propuesto (Google + email/contraseña → mismo modelo)

Objetivo: que **cualquier** método de login (Google incluido) termine
escribiendo el mismo shape en `AuthContext`. Hoy Google escribe un Firebase
`User` real; email/contraseña necesitaría escribir un `AuthUserDto`. La
única forma de que ambos "acaben en el mismo sitio" es que `AuthContext`
deje de exigir específicamente un Firebase `User` (ver hallazgo de la
sección 1) y acepte el tipo ya definido en `auth.contracts.ts`
(`AuthUserDto`/`UserProfileDto`), que Google también puede rellenar
(mapeando el `User` de Firebase a ese shape en el punto de entrada, no en
cada consumidor).

**No se propone aquí eliminar Firebase para Google** — Google sigue
funcionando exactamente igual por dentro; lo que cambia es únicamente qué
tipo expone `AuthContext` hacia el resto de la app.

---

## 5. Endpoints propuestos

Se mantiene la convención ya existente (`/auth/session`, `/auth/me`) y se
añaden los que faltan, con nombres coherentes. **Ninguno de estos endpoints
existe hoy** — es una propuesta para que BE la valide o la ajuste.

### `POST /auth/session` (login por email/contraseña)

- **Sustituye conceptualmente** a "POST /auth/login" — simétrico con el
  `DELETE /auth/session` que el adapter ya usa para logout.
- **Request**: `{ email: string, password: string }`
- **Response éxito**: `{ user: AuthUserDto, profile: UserProfileDto, emailVerified?: boolean }` + el mecanismo de sesión que decida la sección 4 (cookie `Set-Cookie` o token en el body, según arquitectura elegida).
- **Errores esperados**: `invalid_credentials`, `rate_limited`, `technical_error`.
- **Auth requerida**: no.
- **Impacto en sesión**: crea la sesión.
- **Notas de seguridad**: rate limiting server-side (no existe hoy ni cliente ni servidor); no devolver nunca la contraseña; mensajes de error genéricos que no distingan "email no existe" de "contraseña incorrecta" (mismo principio anti-enumeración que en recuperación).

### `DELETE /auth/session` (logout) — YA ASUMIDO por el código, sin cambios

- Ya implementado en `http.adapter.ts:78-80`. Mantener tal cual.

### `GET /auth/me` (restaurar sesión / perfil actual) — YA ASUMIDO por el código, sin cambios

- Ya implementado en `http.adapter.ts:81-83`. Mantener tal cual. Este es el
  canal por el que `emailVerified` y el resto del perfil ya fluyen de
  forma natural (ver `auth-registration-recovery.md`).

### `POST /auth/password/forgot` (recuperación — solicitud)

- **Request**: `{ email: string }`
- **Response éxito**: `{ requested: true }` — **siempre**, exista o no la cuenta.
- **Errores esperados**: `rate_limited`, `technical_error` (nunca un error que revele si el email existe).
- **Auth requerida**: no.
- **Impacto en sesión**: ninguno.
- **Notas de seguridad**: anti-enumeración en el propio endpoint (no solo en el copy del FE — ver `auth-registration-recovery.md`); token generado server-side, aleatorio, con expiración corta (p. ej. 30-60 min, a decidir por BE); rate limiting por IP/email.

### `POST /auth/password/reset` (restablecimiento — NUEVO, sin contraparte FE todavía)

- **Request**: `{ token: string, newPassword: string }`
- **Response éxito**: `{ outcome: 'reset' }`
- **Errores esperados**: `{ outcome: 'expired' }`, `{ outcome: 'invalid' }` (token ya usado o inexistente), o `AuthError` (`validation_error` si la contraseña no cumple la política, `rate_limited`, `technical_error`).
- **Auth requerida**: no (el token del enlace es la autorización).
- **Impacto en sesión**: el token queda invalidado tras el uso; BE debe decidir si además invalida todas las sesiones activas previas del usuario (recomendado como política de seguridad, pero es una decisión de negocio/BE, no impuesta aquí).
- **Notas de seguridad**: un solo uso; expiración corta; nunca aceptar el mismo token dos veces; la nueva contraseña debe re-validarse server-side con la misma política que registro (`passwordRules.ts` es solo UX).

### `POST /auth/refresh` (solo si la arquitectura elegida en la sección 4 lo requiere)

- Documentado como opcional/condicional — depende de qué opción de token se elija.

---

## 6. Errores que el FE necesita (reutilizando el tipo ya cerrado `AuthErrorCode`)

No se añade ningún código nuevo salvo que BE lo pida explícitamente — el
tipo `AuthErrorCode` (`src/services/api/contracts/auth.contracts.ts`) ya
cubre: `invalid_credentials`, `validation_error`, `technical_error`,
`rate_limited`, `service_unavailable`, `email_already_in_use`, `underage`.
Para restablecimiento se usa el patrón `outcome` (`'reset' | 'expired' |
'invalid'`), igual que `VerifyEmailResult.outcome`, en vez de forzarlo
dentro de `AuthErrorCode` — un fallo de token no es un error técnico, es un
resultado esperado del intento.

**El FE nunca debe mostrar el mensaje técnico crudo del servidor** — todo
error se mapea a uno de estos códigos/outcomes antes de renderizarse
(mismo patrón ya usado en login/registro/verificación).

---

## 7. Seguridad — checklist para BE

- [ ] No revelar si un email existe (login y recuperación).
- [ ] Token de recuperación/restablecimiento aleatorio, generado server-side, con expiración corta.
- [ ] Un solo uso por token; invalidación inmediata tras consumo.
- [ ] Rate limiting real en login, recuperación y restablecimiento (hoy no existe ni cliente ni servidor).
- [ ] Política de contraseña validada server-side (no confiar en `passwordRules.ts`, que es solo UX).
- [ ] HTTPS obligatorio en todos los endpoints de auth.
- [ ] Nunca enviar la contraseña en texto plano por email.
- [ ] Nunca almacenar la contraseña en el FE más allá del formulario en memoria (ya cumplido hoy — no se persiste en ningún sitio).
- [ ] No registrar contraseñas ni tokens de sesión en logs de servidor.
- [ ] Decidir si un restablecimiento de contraseña invalida las sesiones previas del usuario (recomendado, pero es política de negocio).
- [ ] Elegir y documentar la arquitectura de token/sesión (ver sección 4) antes de implementar `/auth/session`.

---

## 8. Google — compatibilidad confirmada, sin tocar

Google Sign-In sigue funcionando exactamente igual (`AuthProvider.tsx` /
`auth.service.ts`, vía Firebase directamente) y **no se modifica en este
documento ni debe modificarse para cerrar este P0**. El único punto de
contacto futuro es que, si se generaliza `AuthContextType.user` (sección
1), el punto donde Firebase entrega su `User` deberá mapearse a
`AuthUserDto` en ese único lugar de entrada — no en cada consumidor.

---

## 9. Qué puede hacer FE ahora vs. qué requiere BE

**A. FE puede resolver sin BE:**
- Nada relevante para el login/reset en sí — todo lo que falta depende de un contrato BE real contra el que probar, o de una decisión de arquitectura de sesión.

**B. FE puede preparar pero no completar — YA HECHO:**
- Pantalla `/reset-password/:token` (`ResetPasswordPage.tsx`), contrato `ResetPasswordInput`/`ResetPasswordResult`/`resetPassword()` en `IApiProvider`, y stub `throw` explícito en `HttpAdapter` — construidos siguiendo el patrón de `VerifyEmailLinkPage.tsx` (ver sección 3). El adapter `http` sigue sin URL inventada, a la espera del endpoint real.

**C. Requiere BE real:**
- Los 4 endpoints de la sección 5 (`POST /auth/session`, `POST /auth/password/forgot`, `POST /auth/password/reset`, y `/auth/refresh` si aplica).
- Rate limiting, generación/expiración de tokens, envío real de emails.

**D. Requiere decisión de arquitectura (BE, o BE+FE conjuntamente):**
- Modelo de token/sesión (JWT en `localStorage` vs. cookie `HttpOnly` vs. JWT+refresh) — sección 4.
- Generalizar `AuthContextType.user` para dejar de depender de `firebase/auth` — sección 1.
- Wiring de `LoginResult` exitoso hacia `AuthContext` (bloqueado hasta que exista backend real contra el que probarlo).

---

## 10. ¿Punto 7 listo para producción?

**NO.**

Falta, en orden de bloqueo:

1. **Decisión de arquitectura de sesión/token** (sección 4) — sin esto, ningún endpoint puede implementarse de forma definitiva.
2. **Generalización de `AuthContextType.user`** (sección 1) — cambio de FE, pendiente de la decisión anterior.
3. **Los 3 endpoints reales de BE**: `POST /auth/session`, `POST /auth/password/forgot`, `POST /auth/password/reset` — el contrato de FE para los tres ya existe (sección 5), pero ninguno tiene backend real detrás.
4. **Wiring de `LoginResult`/sesión real → `AuthContext`** una vez exista backend contra el que probarlo.

La pantalla de restablecimiento (`/reset-password/:token`) **ya no es un
pendiente de FE** — ver sección 3 para el detalle de lo ya construido.

Nada de esto puede resolverse marcando la UI existente como suficiente — el
login clásico y la recuperación necesitan estar realmente conectados a un
backend de producción, con sesión persistente y restablecimiento
funcional de extremo a extremo.
