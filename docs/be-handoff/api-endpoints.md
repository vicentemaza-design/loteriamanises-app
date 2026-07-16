# Endpoints REST esperados por el Frontend

El frontend se conecta al backend mediante `HttpAdapter` (`src/services/api/adapters/http/http.adapter.ts`). Para activarlo: `VITE_API_PROVIDER=http` en `.env.local` (actualmente usa MockAdapter).

Todos los endpoints usan `VITE_API_BASE_URL` como prefijo (ej: `https://api.loteriamanises.com`). El cliente HTTP está en `src/services/api/adapters/http/http.client.ts`.

---

## Fase 1 / Fase 2 / Fuera de alcance

| Endpoint | Fase 1 (entrega inicial) | Fase 2 | Fuera de alcance |
|----------|--------------------------|--------|------------------|
| `GET /results` | ✅ | | |
| `GET /results/:id` | ✅ | | |
| `GET /users/:uid/tickets` | ✅ | | |
| `GET /tickets/:id` | ✅ | | |
| `POST /play-sessions` | ✅ | | |
| `GET /users/:uid/wallet/balance` | ✅ | | |
| `GET /users/:uid/wallet/movements` | ✅ | | |
| `POST /users/:uid/wallet/top-up` | ✅ | | |
| `GET /auth/me` | ✅ | | |
| `DELETE /auth/session` | ✅ | | |
| `POST /bets` | | ✅ (uso futuro) | |
| `POST /play/quote` (calcular precio) | | ✅ — BE debe recalcular, FE no confía en precio local | |
| `GET /subscriptions/...` | | ✅ — Abonos Navidad/Niño | |
| Pagos con tarjeta / Redsys | | | ✅ — Fase 3 |

---

## Auth

La autenticación (Google OAuth) va por Firebase SDK directamente. No hay endpoint REST para sign-in.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/auth/me` | Perfil extendido del usuario autenticado |
| `DELETE` | `/auth/session` | Cerrar sesión en el backend |

**Respuesta `GET /auth/me` (`UserProfile`):**
```ts
{
  uid: string
  email: string
  displayName: string
  photoURL?: string
  balance: number
  createdAt: string  // ISO 8601
}
```

---

## Resultados — `/results`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/results` | Últimos resultados de todos los juegos |
| `GET` | `/results/:id` | Resultado por ID de juego o sorteo |

**Respuesta (`ResultDto[]` / `ResultDto`):**
```ts
{
  gameId: string           // 'euromillones' | 'primitiva' | 'bonoloto' | 'gordo' | 'eurodreams' | ...
  gameType: GameType
  date: string             // ISO 8601
  numbers: number[]        // bolas principales
  stars?: number[]         // estrellas / clave / sueño (Euromillones, Gordo, EuroDreams)
  complementario?: number  // Primitiva / Bonoloto
  reintegro?: number       // Primitiva / Bonoloto
  firstPrizeNumber?: string   // Lotería Nacional: número completo 1er premio
  secondPrizeNumber?: string
  reintegros?: number[]    // Lotería Nacional: array de dígitos
  decimoPrice?: number     // 3 (jueves) | 6 (sábado)
  jackpotNext?: number     // bote próximo sorteo en EUR
}
```

**Notas:**
- El FE puede filtrar por `gameId` en cliente si BE devuelve todos en un array.
- `complementario` y `reintegro` son opcionales — si BE los sirve, el FE los renderiza.
- Para Lotería Nacional, `numbers` es array de 5 dígitos del 1er premio (ej: `[3,1,4,2,5]`).

---

## Tickets — `/users/:uid/tickets` y `/tickets/:id`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/users/{userId}/tickets` | Jugadas del usuario autenticado |
| `GET` | `/tickets/:id` | Jugada por ID |

**Respuesta (`TicketDto`):**
```ts
{
  id: string
  userId: string
  gameId: string
  gameType: GameType
  numbers: number[]
  stars?: number[]
  drawDate: string         // 'YYYY-MM-DD'
  status: 'pending' | 'won' | 'lost'
  prize?: number           // si status === 'won'
  price: number            // importe de la jugada
  hasInsurance?: boolean
  isSubscription?: boolean
  orderId?: string         // agrupa tickets de un mismo pedido (múltiples sorteos / combinaciones)
  metadata?: {
    nationalNumber?: string
    nationalQuantity?: number
    nationalDrawLabel?: string
    orderDrawDates?: string[]
    orderTotalPrice?: number
    scheduleMode?: string
    weeksCount?: number
  }
  createdAt: string        // ISO 8601
}
```

---

## Wallet — `/users/:uid/wallet`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/users/{userId}/wallet/balance` | Saldo del usuario |
| `GET` | `/users/{userId}/wallet/movements` | Historial de movimientos |
| `POST` | `/users/{userId}/wallet/top-up` | Recarga de saldo |

**Balance (`WalletBalanceDto`):**
```ts
{ balance: number; userId: string }
```

**Movimiento (`WalletMovementDto`):**
```ts
{
  id: string
  userId: string
  type: 'deposit' | 'bet' | 'prize' | 'withdrawal' | 'adjustment' | 'cancellation'
  amount: number           // positivo para entradas, negativo para apuestas/retiros
  description: string
  createdAt: string        // ISO 8601
  orderId?: string
  balanceAfter?: number
  details?: {
    gameId?: string
    gameLabel?: string
    combinations?: string[]
    number?: string
    quantity?: number
    shippingCost?: number
    deliveryMode?: 'custody' | 'shipping'
    iban?: string
    bankName?: string
    recipientName?: string
  }
}
```

**Top-up:**
```ts
// POST /users/{userId}/wallet/top-up — body
{ amount: number }

// Respuesta
{ success: boolean; newBalance: number }
```

---

## Play — `/play-sessions` y `/bets`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/play-sessions` | Confirmar sesión de compra completa (Fase 1) |
| `POST` | `/bets` | Apuesta individual (Fase 2 — uso futuro) |

**Submit session request (`SubmitPlaySessionRequestDto`):**
```ts
{
  sessionId: string
  userId: string
  paymentMethod: 'wallet'
  totalAmount: number      // BE debe recalcular y rechazar si no coincide
  items: SubmitPlaySessionItemDto[]  // ver play-session-contract.md
}
```

**Submit session response:**
```ts
{
  success: boolean
  confirmedDraftIds?: string[]
  ticketIds?: string[]
  failures?: Array<{ draftId: string; reason: string }>  // confirmación parcial
  error?: string
}
```

**Notas:**
- BE debe rechazar si saldo insuficiente antes de procesar ítems.
- BE debe recalcular `totalAmount` independientemente — no confiar en el valor del FE.
- `failures` permite confirmación parcial: el FE lo gestiona con `resolveConfirmPartial`.
- `calculatePrice` en HttpAdapter devuelve `0` — es un stub. **El precio real lo calcula el BE** antes de cobrar. Ver tabla de fases — `POST /play/quote` queda para Fase 2.

---

## Subscriptions — `/subscriptions` (Fase 2)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/subscriptions/available-numbers` | Números disponibles para abono |
| `POST` | `/subscriptions` | Crear abono |
| `GET` | `/subscriptions` | Abonos del usuario |
| `PATCH` | `/subscriptions/:id` | Actualizar abono |
| `DELETE` | `/subscriptions/:id` | Cancelar abono |
| `GET` | `/subscriptions/reservations` | Reservas de sorteos pendientes de pago |
| `POST` | `/subscriptions/reservations/pay` | Pagar reservas pendientes |
| `POST` | `/subscriptions/:id/confirm-first-draw` | Confirmar primer sorteo de un abono |

Ver contratos en `src/services/api/contracts/subscriptions.contracts.ts`.

---

## Activar el HttpAdapter

1. Configurar `VITE_API_BASE_URL` en `.env.local` apuntando al servidor BE.
2. Configurar `VITE_API_PROVIDER=http` en `.env.local`.
3. El `createApiClient` instanciará `HttpAdapter` automáticamente.

El HttpAdapter está en `src/services/api/adapters/http/http.adapter.ts`. El cliente HTTP base (con headers de autenticación, base URL, etc.) está en `src/services/api/adapters/http/http.client.ts`.
