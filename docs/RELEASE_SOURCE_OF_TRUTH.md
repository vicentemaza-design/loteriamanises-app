# Source of truth de entrega

## Baseline y alcance

- Release funcional integrado: `f8741dc054b82d98a86bc7f1e5a2480d22f2a15b`.
- Se llegó desde `origin/main` mediante fast-forward y después desde `origin/test/ios-root-transparent` mediante fast-forward.
- `experiment/unify-gameplay-bottom-menu` no forma parte de esta entrega.
- Mock/demo es válido para QA y presentación; no representa dinero, SELAE, Redsys, ledger, stock ni retirada reales.

## Estado FE/BE

- El FE mantiene adapters Mock, Firebase y HTTP detrás de `IApiProvider`.
- HTTP contiene rutas para varias lecturas/escrituras contractuales, pero deja explícitamente pendientes auth email, cuentas bancarias, retirada y cálculo de precio autoritativo.
- Firebase implementa lecturas y algunas operaciones de demo, pero deja protegidas las operaciones que requieren autoridad server-side.
- BE debe autenticar al usuario, recalcular combinatoria/precio, validar calendario/cierres, saldo, idempotencia y trazabilidad SELAE.

## Juegos y fechas

`GameSelection` es una unión discriminada para Nacional, Primitiva, Bonoloto, Euromillones, EuroDreams, Gordo y Quiniela. El FE dispone de flujo multi-columna; su payload es una intención que BE debe validar, no una orden de cobro confiable.

El día de negocio FE usa `Europe/Madrid`. BE sigue siendo autoridad para el sorteo, cierre, persistencia y conversión de instantes.

## iOS/PWA y layer-debug

`layer-debug` es un mecanismo histórico de diagnóstico visual, no una dependencia funcional actual. No se elimina ni se reactiva como parte de una integración sin QA físico iOS/PWA. Las pruebas desktop no cierran teclado, safe-area, viewport, Withdrawals ni `ShippingAddressModal` en dispositivo real.

## Release decision

El artefacto es entregable como frontend demo/mock y base contractual FE→BE, con pendientes BE y QA físico explícitos. No debe presentarse como producción transaccional real hasta completar la integración server-side y validación legal/operativa.
