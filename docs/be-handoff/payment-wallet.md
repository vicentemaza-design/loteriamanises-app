# Integración de Pagos y Wallet

## Estado actual (FE)

- Saldo: `src/features/wallet/hooks/useWallet.ts` → `client.wallet.topUp()`
- Movimientos: `src/features/wallet/hooks/useMovements.ts` → `client.wallet.getMovements()`
- Confirmación de sesión: `src/features/session/hooks/usePlaySessionConfirm.ts` → `client.play.submitPlaySession()`

## Flujo de compra

```
Usuario confirma sesión
  → usePlaySessionConfirm.confirm()
  → POST /api/play/session (SubmitPlaySessionRequestDto)
  → BE valida saldo, recalcula importe, confirma jugadas
  → Responde SubmitPlaySessionResponseDto
  → FE muestra éxito / error / confirmación parcial
```

El FE **no descuenta saldo localmente**. Espera que BE devuelva `success: true` y luego llama a `refreshProfile()` para actualizar el saldo desde Firebase/API.

## Recarga de saldo

```
Usuario introduce importe
  → useWallet.topUp(amount)
  → POST /api/wallet/topup { userId, amount }
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

## Pendiente de integración BE

- **Favoritos** (`FavoritesPage`): usa datos hardcodeados en `premium-demo.ts`. Requiere `GET /api/favorites?userId={uid}` y hook dedicado.
- **Abonos** (`SubscriptionsPage`): mismo caso. Requiere `GET /api/subscriptions?userId={uid}`.
- **Cobro de premios** (`WithdrawalsPage`): página existente, sin hook real. Requiere flujo IBAN + validación documental.

Estas tres áreas **no tienen adaptador HTTP ni Firebase implementado** en el FE. Son pantallas de placeholder. El FE deberá crear hooks cuando BE defina los contratos.
