# Integración de Pagos y Wallet

## Estado actual (FE)

- Saldo: `src/features/wallet/hooks/useWallet.ts` → `client.wallet.topUp()`
- Movimientos: `src/features/wallet/hooks/useMovements.ts` → `client.wallet.getMovements()`
- Confirmación de sesión: `src/features/session/hooks/usePlaySessionConfirm.ts` → `client.play.submitPlaySession()`

## Flujo de compra

```
Usuario confirma sesión
  → usePlaySessionConfirm.confirm()
  → POST /play-sessions (SubmitPlaySessionRequestDto)
  → BE valida saldo, recalcula importe, confirma jugadas
  → Responde SubmitPlaySessionResponseDto
  → FE muestra éxito / error / confirmación parcial
```

El FE **no descuenta saldo localmente**. Espera que BE devuelva `success: true` y luego llama a `refreshProfile()` para actualizar el saldo desde Firebase/API.

## Recarga de saldo

```
Usuario introduce importe
  → useWallet.topUp(amount)
  → POST /users/{userId}/wallet/top-up { amount }
  → BE procesa el cargo (pasarela externa)
  → Responde { success: boolean, newBalance: number }
  → FE llama refreshProfile() si success
```

La pasarela de pago (Stripe, Redsys, etc.) es responsabilidad del BE. El FE solo envía `amount` y espera `newBalance`.

## Método de pago actual

El contrato define `paymentMethod: 'wallet'` como único valor. No hay tarjeta directa en el flujo de compra de jugadas — el saldo es el intermediario.

## Validaciones que BE debe hacer (no confiar en FE)

| Validación | Campo FE enviado | Acción BE |
|------------|-----------------|-----------|
| Saldo suficiente | `totalAmount` | Consultar saldo real en DB |
| Importe correcto | `items[].totalPrice` | Recalcular con `unitPrice × betsCount × quantity` |
| Sorteo abierto | `items[].drawDate` | Verificar que no ha pasado la hora de cierre |
| Usuario autenticado | `userId` | Verificar token Firebase en header |

## Vinculación de tarjeta (UI disponible — BE pendiente)

El FE muestra la pantalla "Vincula tu nueva tarjeta" (`AddCardFlow`). Es un overlay con selección de importe y toggle "Guardar esta tarjeta". Actualmente no llama a ningún endpoint real.

Cuando BE implemente la tokenización de tarjeta (Redsys COF — ver `project_be_redsys_cards.md` en los apuntes del proyecto), el FE esperará:

```ts
// POST /users/{userId}/payment-methods/cards
{
  redsysToken: string     // Ds_Merchant_Identifier devuelto por Redsys
  last4: string
  brand: 'visa' | 'mastercard' | 'amex'
  expiryMonth: number
  expiryYear: number
  saveForFuture: boolean
}

// Respuesta
{ success: boolean; cardId: string }
```

Apple Pay y Google Pay se muestran como opciones en la pantalla de recarga pero sin integración BE activa todavía.

## Pendiente de integración BE

- **Favoritos** (`FavoritesPage`): usa `localStorage`. Requiere `GET /favorites?userId={uid}` y hook dedicado cuando se migre al servidor.
- **Abonos** (`SubscriptionsPage`): el `HttpAdapter` tiene los endpoints de subscriptions implementados (`GET /subscriptions`, `POST /subscriptions`, etc. — ver `api-endpoints.md`). Pendiente de conectar el hook de UI.
- **Cobro de premios** (`WithdrawalsPage`): página existente, sin hook real. Requiere flujo IBAN + validación documental.
- **Vinculación de tarjeta** (`AddCardFlow`): UI lista. Requiere tokenización Redsys (Fase 3).
