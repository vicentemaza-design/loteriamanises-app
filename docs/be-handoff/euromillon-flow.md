# Flujo de Euromillón: Ejemplo Extremo a Extremo

Se utiliza Euromillón como el caso más representativo que cubre selección compleja, múltiples y multi-sorteo.

## 1. Selección (Frontend)
El usuario elige:
- **Números**: `[4, 18, 23, 31, 45]`
- **Estrellas**: `[3, 9]`
- **Modo**: `simple`
- **Sorteos**: Martes y Viernes de la semana actual.

## 2. Construcción del Draft (FE Application Layer)
- `betsCount`: 1.
- `unitPrice`: 2.50 €.
- `drawsCount`: 2.
- `totalPrice`: 5.00 €.
- `drawDate`: Primera fecha del sorteo (ej: `2024-05-21T21:00:00Z`).
- `metadata.orderDrawDates`: `["2024-05-21T21:00:00Z", "2024-05-24T21:00:00Z"]`.

## 3. Envío al Backend (Payload)
```json
{
  "sessionId": "abc-123",
  "userId": "user-456",
  "totalAmount": 5.00,
  "items": [
    {
      "gameId": "euromillones",
      "mode": "simple",
      "numbers": [4, 18, 23, 31, 45],
      "stars": [3, 9],
      "drawDate": "2024-05-21T21:00:00Z",
      "totalPrice": 5.00,
      "metadata": {
        "orderDrawDates": ["2024-05-21T21:00:00Z", "2024-05-24T21:00:00Z"]
      }
    }
  ]
}
```

## 4. Checklist de Validación Backend
- [ ] **Auth**: Validar que `userId` tiene una sesión activa.
- [ ] **Pricing**: Recalcular combinatoria de `[4,18,23,31,45]` + `[3,9]` en modo simple -> Debe dar 1 apuesta.
- [ ] **Calendario**: Validar que las dos fechas en `orderDrawDates` corresponden a sorteos de Euromillones futuros y abiertos.
- [ ] **Wallet**: Reservar 5.00 € del saldo del usuario.
- [ ] **Integración**: Enviar a la plataforma de SELAE o persistir en el sistema de gestión de la administración.

## Riesgos Identificados en este Flujo
- Si el usuario edita el draft y cambia a "Múltiple" con 6 números, el backend debe detectar que el `totalPrice` debería ser 15.00 € (6 apuestas * 2.50 €) y rechazar la petición si el payload sigue diciendo 5.00 €.
