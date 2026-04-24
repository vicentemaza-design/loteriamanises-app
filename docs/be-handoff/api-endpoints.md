# Endpoints REST esperados por el Frontend

El frontend está preparado para conectarse a una API REST mediante el `HttpAdapter` (`src/services/api/adapters/http/`). Los adaptadores son stubs activos — cuando `RUNTIME_CONFIG.apiProvider === 'http'`, se usarán estas llamadas. Actualmente `createApiClient` lanza si se solicita `http`; descomentar y completar los stubs es suficiente para activarlos.

---

## Resultados — `/api/results`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/results/latest` | Últimos resultados de todos los juegos |
| `GET` | `/api/results/:gameId` | Resultado por ID de juego |

**Respuesta esperada (`ResultDto[]`):**
```ts
{
  gameId: string           // 'euromillones' | 'primitiva' | 'bonoloto' | ...
  gameType: GameType
  date: string             // ISO 8601
  numbers: number[]        // bolas principales (o dígitos para lotería nacional)
  stars?: number[]         // estrellas / clave (Euromillones, Gordo, EuroDreams)
  complementario?: number  // solo Primitiva/Bonoloto si BE lo sirve
  reintegro?: number       // solo Primitiva/Bonoloto si BE lo sirve
  firstPrizeNumber?: string  // lotería nacional: número completo 1er premio
  secondPrizeNumber?: string
  reintegros?: number[]    // lotería nacional: array de dígitos
  decimoPrice?: number     // 3 (jueves) | 6 (sábado)
  jackpotNext?: number     // bote o premio próximo sorteo en EUR
}
```

**Notas BE:**
- El FE filtra por `gameId` en cliente. BE puede devolver todos en una sola llamada.
- `complementario` y `reintegro` son opcionales. Si BE los sirve, el FE los renderiza automáticamente.
- Para lotería nacional, `numbers` es un array de 5 dígitos del 1er premio (ej: `[3,1,4,2,5]`).

---

## Tickets — `/api/tickets`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/tickets?userId={uid}` | Jugadas del usuario |
| `GET` | `/api/tickets/:id` | Jugada por ID |

**Respuesta esperada (`TicketDto`):**
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
  orderId?: string         // agrupa drafts de un mismo pedido
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

## Wallet — `/api/wallet`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/wallet/balance?userId={uid}` | Saldo del usuario |
| `GET` | `/api/wallet/movements?userId={uid}` | Historial de movimientos |
| `POST` | `/api/wallet/topup` | Recarga de saldo |

**Balance (`WalletBalanceDto`):**
```ts
{ balance: number; userId: string }
```

**Movimiento (`WalletMovementDto`):**
```ts
{
  id: string
  userId: string
  type: 'deposit' | 'bet' | 'prize'
  amount: number           // positivo para entradas, negativo para apuestas
  description: string      // texto libre para el usuario
  createdAt: string
}
```

**TopUp request/response:**
```ts
// POST body
{ userId: string; amount: number }

// Response
{ success: boolean; newBalance: number }
```

---

## Play — `/api/play`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/play/session` | Confirmar sesión de compra completa |
| `POST` | `/api/play/bet` | Apuesta individual (uso futuro) |

**Submit session request (`SubmitPlaySessionRequestDto`):**
```ts
{
  sessionId: string
  userId: string
  paymentMethod: 'wallet'
  totalAmount: number
  items: SubmitPlaySessionItemDto[]  // ver play-session-contract.md
}
```

**Submit session response (`SubmitPlaySessionResponseDto`):**
```ts
{
  success: boolean
  confirmedDraftIds?: string[]
  ticketIds?: string[]
  failures?: Array<{ draftId: string; reason: string }>
  error?: string
}
```

**Notas BE:**
- BE debe rechazar si saldo insuficiente antes de procesar ítems.
- BE debe recalcular `totalAmount` y no confiar en el valor enviado por el FE.
- `failures` permite confirmación parcial: el FE lo gestiona con `resolveConfirmPartial`.

---

## Auth — Firebase SDK (no REST)

La autenticación (Google OAuth) está gestionada directamente por el Firebase SDK en el cliente. No se requiere endpoint REST para sign-in/sign-out.

**Perfil de usuario** — si BE necesita enriquecer el perfil más allá de lo que Firebase Auth provee:

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/user/profile?uid={uid}` | Perfil extendido con saldo |

**Respuesta (`UserProfileDto`):**
```ts
{
  uid: string
  email: string
  displayName: string
  photoURL?: string
  balance: number
  createdAt: string
}
```

---

## Activar el HttpAdapter

En `src/services/api/factory/createApiClient.ts`, el caso `'http'` lanza actualmente. Para activarlo:

1. Crear `HttpAdapter` que implemente `IApiProvider` usando los stubs de `src/services/api/adapters/http/`.
2. Cambiar `throw new Error(...)` por `return new HttpAdapter()`.
3. Apuntar `RUNTIME_CONFIG.apiProvider` a `'http'` vía variable de entorno.
