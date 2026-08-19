# Retirada segura — handoff FE → BE

Este documento describe únicamente lo que el FE necesita del backend para
crear una solicitud de retirada. **No se ha implementado backend en esta
fase, no se ha inventado ningún endpoint, no se ejecuta ninguna transferencia
real, no se descuenta saldo real, no se crea ningún ledger.** Todo lo
descrito aquí funciona hoy contra un `MockAdapter`
(`VITE_API_PROVIDER=mock`, el valor por defecto de la app).

La app sigue siendo, en esta fase, principalmente una DEMO/VISUAL. Esta fase
cubre exclusivamente la UX de creación de una solicitud de retirada y sus
contratos FE→BE — no el procesamiento económico real.

## Principio de autoridad

El frontend **nunca** es autoridad sobre: saldo disponible, elegibilidad de
retirada, titularidad bancaria, importe final aceptado, límites, comisiones,
ni el estado definitivo de una retirada. El FE hace validación UX
preliminar únicamente; **BE debe volver a validar todo** antes de aceptar
una retirada real.

## Modelo — dominio vs. UI

- **`WithdrawalStatus`** (`'pending' | 'processing' | 'completed' | 'rejected' | 'failed'`)
  es el estado de **dominio/proceso** de la solicitud, vive en `WithdrawalDto`
  y lo controla BE.
- Los estados de **UI** de la operación de creación
  (`'idle' | 'submitting' | 'error' | 'rate_limited' | 'service_unavailable'`,
  ver `useCreateWithdrawal`) describen únicamente la llamada `createWithdrawal()`
  en sí — nunca se confunden con `WithdrawalStatus`.
- `rejected` (decisión de negocio/validación) y `failed` (fallo
  técnico/procesamiento) se representan por separado en el FE — son
  conceptos distintos.

## Operación FE necesaria

`IApiProvider.wallet.createWithdrawal(input) → CreateWithdrawalResult`
(`src/services/api/contracts/withdrawals.contracts.ts`).

**Input mínimo (`CreateWithdrawalInput`)**:
```ts
{ bankAccountId: string; amount: number }
```
El FE **no envía**: `balance`, `holderName`, `verificationStatus`, ningún
`userId` arbitrario, ni ninguna comisión calculada por el cliente. BE debe
derivar/validar todo eso server-side a partir de la sesión autenticada y de
la cuenta bancaria referenciada por `bankAccountId`.

**Resultado (`CreateWithdrawalResult`)**:
```ts
{
  withdrawal: WithdrawalDto; // id, amount, bankAccountMasked, status, createdAt, updatedAt?, fee?, netAmount?, safeReasonCode?, safeReasonMessage?
  updatedBalance?: number;   // solo si BE decide devolverlo — nunca obligatorio, nunca autoritativo por sí solo en el cliente
}
```
`fee` y `netAmount` son opcionales y **nunca los calcula el FE** — si BE no
los devuelve, el FE simplemente no los muestra (no se inventa una comisión).

## Qué debe implementar BE

- Autenticar al usuario.
- Comprobar que la cuenta bancaria (`bankAccountId`) pertenece al usuario autenticado.
- Comprobar el `verificationStatus` **real** de esa cuenta server-side — el
  FE ya bloquea el avance visual si la cuenta no está `verified`, pero eso
  no es una garantía de seguridad, solo UX.
- Comprobar elegibilidad/KYC del usuario.
- Validar `amount` (formato, límites reales, etc.) — el FE ya valida
  formato UX (obligatorio, numérico, >0, máx. 2 decimales) pero eso no
  sustituye la validación server-side.
- Comprobar el saldo autoritativo **dentro de la misma operación
  transaccional** — nunca confiar en el saldo que ve el FE, ni en un
  importe/saldo enviado por el cliente, ni en la validación previa del FE.
  Caso que BE debe impedir explícitamente: dos retiradas concurrentes que
  en conjunto superen el saldo disponible. El FE no implementa ningún
  locking ni protección de concurrencia.
- Aplicar límites reales (mínimo/máximo) — **no existen límites hoy en el
  FE**; no se ha inventado ningún valor (10€/100€/1000€, etc.) — deben venir
  de BE/configuración productiva.
- Calcular comisiones reales, si aplica, y devolver `fee`/`netAmount`.
- Prevenir doble gasto/concurrencia e **implementar idempotencia
  server-side real**. El FE solo deshabilita visualmente el botón mientras
  `submitting` para evitar doble clic — eso es una protección de UX, **no**
  idempotencia real.
- Crear el ledger/transacción y ejecutar/procesar la retirada.
- Controlar la transición de estados (`pending → processing → completed`,
  o `rejected`/`failed`). El FE no hace polling de estos cambios — no
  consulta periódicamente; solo representa lo que la creación devuelve de
  forma síncrona en esta fase.
- Devolver mensajes seguros: `safeReasonCode`/`safeReasonMessage` para un
  `rejected`, nunca un error técnico interno del servidor. El FE nunca
  asume ni inventa motivos de rechazo.

**No se especifica aquí**: tablas MySQL, SQL, proveedor bancario concreto,
colas, webhook concreto, ni arquitectura interna.

## Comportamiento del mock (demo)

`src/services/api/adapters/mock/withdrawals.mock.ts` — no ejecuta ninguna
transferencia, no crea ledger, no revalida titularidad real, no modifica
Firebase/Firestore, no toca ningún saldo autoritativo. Todos los estados se
devuelven de forma síncrona (sin polling) mediante importes reservados,
aislados y documentados en el propio archivo — no es un mecanismo de
seguridad:

| `amount` | Resultado |
|---|---|
| `13.13` | `withdrawal.status = 'rejected'` |
| `14.14` | `withdrawal.status = 'failed'` |
| `15.15` | `withdrawal.status = 'processing'` |
| `16.16` | `withdrawal.status = 'completed'` |
| `17.17` | `createWithdrawal()` rechaza con `WithdrawalError('rate_limited')` |
| `18.18` | `createWithdrawal()` rechaza con `WithdrawalError('service_unavailable')` |
| cualquier otro importe válido | `withdrawal.status = 'pending'` |

## Saldo — qué había antes y qué se ha cambiado

**Antes de esta fase**, `WithdrawalsPage.tsx` ejecutaba, al confirmar:
```ts
updateProfile({ balance: balance - parsedAmount });
```
En modo demo esto mutaba el estado local del perfil directamente; para un
usuario real (no demo) esta misma función escribe con `merge` en el
documento Firestore `users/{uid}`, es decir, el cliente podía fijar
arbitrariamente su propio saldo. **Esta lógica se ha eliminado del nuevo
flujo de envío.** La nueva `confirm()` ya no llama a `updateProfile` para
nada relacionado con saldo — solo crea la solicitud de retirada demo vía
`useCreateWithdrawal`. El saldo mostrado en el header de `WithdrawalsPage`
se sigue leyendo de `profile.balance` sin mutarlo en ningún punto de este
flujo.

No se ha resuelto el problema de fondo de que `balance` sea modificable
desde cliente en general (es una condición de seguridad ya conocida y
fuera de alcance de esta fase) — solo se ha retirado su uso del flujo de
retirada, que es lo que esta fase pedía explícitamente.

## Seguridad para producción

Antes de producción, la gestión real de cuentas bancarias y retiradas debe
estar completamente fuera de la autoridad del cliente y protegida por BE
(esta nota ya se documentó en `bank-account-verification.md` y sigue
aplicando aquí).
