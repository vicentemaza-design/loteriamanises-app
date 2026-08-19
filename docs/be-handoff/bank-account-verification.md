# Cuentas bancarias + verificación de titularidad — handoff FE → BE

Este documento describe únicamente lo que el FE necesita del backend para las
cuentas bancarias de destino de retiradas y su verificación de titularidad.
**No se ha implementado backend en esta fase, no se ha inventado ningún
endpoint, no se ha integrado ningún proveedor bancario real.** Todo lo
descrito aquí funciona hoy contra un `MockAdapter` (`VITE_API_PROVIDER=mock`,
el valor por defecto de la app).

La app sigue siendo, en esta fase, principalmente una DEMO/VISUAL. El flujo
de retirada final (confirmación económica, descuento de saldo, ledger,
idempotencia, PSD2, KYC real, proveedor bancario real) **no se ha tocado ni
implementado** — ver la sección "Pendiente fase retirada" al final.

## Modelo de estado — contrato con BE

- `verificationStatus: 'unverified' | 'verified'` es el **único estado
  persistente** de una cuenta bancaria. Vive en `BankAccountDto`
  (`src/services/api/contracts/bank-accounts.contracts.ts`) y en el tipo FE
  equivalente `BankAccount` (`src/features/profile/types/profile.types.ts`).
- El resultado de un único intento de `verifyOwnership()` —
  `'verified' | 'mismatch' | 'unavailable' | 'error'`
  (`BankAccountVerificationOutcome`) — es un **outcome de operación**, nunca
  un estado del que la cuenta puede "estar". Solo el outcome `'verified'` es
  el que hace avanzar el estado persistente de arriba; `mismatch` /
  `unavailable` / `error` nunca se escriben en la cuenta, que simplemente
  sigue `unverified`.
- El FE **no decide la titularidad**. No compara `holderName` con el nombre
  del perfil en React, no implementa ningún algoritmo de matching. Solo
  representa visualmente el `outcome` que devuelva el provider.
- El FE no envía ni recibe datos de titular adicionales a los
  estrictamente necesarios para mostrar la cuenta (alias, entidad, IBAN
  enmascarado, estado). No se expone ningún dato de titular real en esta fase.

## Operaciones FE necesarias

Definidas en `IApiProvider.wallet.bankAccounts`
(`src/services/api/providers/api.provider.ts`):

1. **`list() → BankAccountDto[]`** — cuentas bancarias del usuario autenticado.
2. **`add({ iban, bank?, alias? }) → { bankAccount }`** — añade una cuenta
   nueva. El FE ya valida formato español + dígito de control (MOD-97) antes
   de llamar; **BE debe re-validar igual en servidor**, nunca confiar en la
   validación de cliente. Resultado inicial: `verificationStatus: 'unverified'`
   siempre — nunca se considera verificada al guardarla.
3. **`verifyOwnership({ bankAccountId }) → { outcome, bankAccount }`** —
   consume la verificación de titularidad para una cuenta ya guardada. El FE
   no envía ningún dato adicional de titular; identifica la cuenta solo por
   su id, nunca por IBAN completo ni por `userId` en query params.

No se ha añadido una cuarta operación de "consultar estado" independiente —
el estado persistente (`verificationStatus`) se espera que viaje dentro de
`list()`/`add()`/`verifyOwnership()`, sin necesidad de una llamada aparte.

## Outcomes que el FE distingue

| Outcome | Significado | Copy mostrado |
|---|---|---|
| `verified` | El proveedor confirma la titularidad | "Cuenta verificada" |
| `mismatch` | El proveedor confirma que NO coincide | "Cuenta no válida" / "Los datos del titular no coinciden." |
| `unavailable` | El proveedor no puede resolver ahora (no es un fallo del cliente) | "No podemos verificar ahora" / "Inténtalo de nuevo más tarde." |
| `error` | Fallo técnico genérico (red, timeout, servicio caído) | Mensaje genérico + reintentar |

## Qué debe implementar BE

- Validar formato + dígito de control del IBAN server-side (no confiar en
  la validación de cliente, que es solo UX).
- Asociar la cuenta al usuario autenticado (autorización server-side, nunca
  basada en un id pasado por el cliente sin verificar sesión).
- Verificar la titularidad real a través de un proveedor bancario — **no
  especificamos aquí cuál**; el contrato FE (`outcome` de 4 valores) es
  agnóstico al proveedor concreto.
- Garantizar que el FE nunca puede decidir el resultado — el `outcome`
  siempre debe originarse en el proveedor/servidor, nunca en un cálculo de
  cliente.
- Devolver solo los datos que el FE necesita (`BankAccountDto`): nada de
  titular adicional, nada de IBAN completo una vez guardado.
- Invalidar la verificación (`verificationStatus` vuelve a `unverified`) si
  el IBAN de una cuenta ya verificada cambia. El FE está preparado para
  representar ese estado, pero **no implementa ninguna regla de negocio
  definitiva al respecto** — la regla debe vivir en BE.
- No confiar en `holderName` enviado por el cliente como prueba de nada — de
  hecho el FE ya no lo envía ni lo pide en el formulario de alta.
- Proteger el IBAN y no dejarlo en logs — el FE tampoco lo persiste completo
  en ningún sitio (ver sección siguiente).
- Aplicar rate limiting / anti-abuso en `add()` y `verifyOwnership()` — hoy
  no existe ni cliente ni servidor.

No se especifican aquí tablas MySQL, proveedor concreto, algoritmos internos
de matching, ni forma definitiva de los endpoints.

## Dato sensible — cómo lo trata el FE hoy

- El formulario de alta mantiene el IBAN completo **solo en memoria del
  componente** mientras el usuario lo escribe.
- Al llamar a `add()`, el IBAN completo viaja una única vez como payload de
  esa llamada. El adapter (mock hoy, HTTP en el futuro) es responsable de no
  loguearlo ni devolverlo — el mock lo enmascara inmediatamente
  (`ES12 **** **** **** 7890`) y descarta el valor completo.
- Ni `localStorage`, ni `sessionStorage`, ni logs de consola contienen en
  ningún momento el IBAN completo nuevo. Se comprobó explícitamente en
  pruebas de navegador (ver informe de la fase).
- El `MockAdapter` persiste en `localStorage` (`manises_bank_accounts`)
  **solo** la representación enmascarada + metadatos no sensibles — igual
  que hacía la demo antes de esta fase (el código previo ya enmascaraba el
  IBAN antes de guardarlo; esta fase mantiene esa propiedad y además fuerza
  la migración de cualquier cuenta antigua sin `verificationStatus` a
  `'unverified'`, sin inventar una verificación histórica).

## Nota de seguridad para producción

Antes de producción, la gestión real de cuentas bancarias y retiradas debe
estar completamente fuera de la autoridad del cliente y protegida por BE.

## Pendiente fase retirada (fuera de alcance de esta fase)

Esta fase prepara únicamente selección de cuenta + verificación de
titularidad. **No implementa**:

- confirmación económica de la retirada;
- descuento real de saldo;
- creación de una operación económica/ledger;
- idempotencia;
- marcar una retirada como procesada;
- PSD2;
- KYC real;
- proveedor bancario real.

`WithdrawalsPage.tsx` sigue mostrando, tras la selección de cuenta, un paso
de revisión y un paso de "confirmación" puramente visual/demo (ya existente
antes de esta fase, sin tocar su comportamiento de fondo) — no representa
una retirada real.
