# Source of truth de entrega

## Baseline y alcance

- Baseline funcional aprobado: `f8741dc054b82d98a86bc7f1e5a2480d22f2a15b`.
- Cierre documental anterior: `9ad8667fe926ba9ab56a61be54feb8f906b20fd8`.
- SHA final de documentación/entrega: el `HEAD` de `main` que contiene este documento; queda registrado por Git y en el manifest del paquete de entrega.
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

La configuración `demoEnabled: true` y el provider mock pertenecen al entorno demo/QA y deben tratarse como configuración de handoff, nunca como autorización de producción. El runtime de producción debe seleccionar un provider real y fallar cerrado cuando falten contratos o credenciales.

## DEMO vs PRODUCTION

### DEMO

- Variante preparada para presentación, QA y recorrido funcional.
- Puede usar `MockAdapter` y datos sintéticos o hardcodeados de demostración.
- Permite recorrer la interfaz sin depender de backend real ni servicios externos.
- No representa dinero real, SELAE real, Redsys real, ledger real, stock oficial ni retiradas bancarias reales.

### PRODUCTION

- Contiene el mismo frontend, UI, navegación, arquitectura visual y fixes funcionales aprobados que DEMO.
- No es una aplicación visualmente distinta.
- Está destinada a conectarse con providers/adapters reales, principalmente HTTP/Firebase según corresponda.
- Es la base frontend/contractual para integrar autenticación, SELAE, Redsys, wallet/saldo, ledger, cuentas bancarias, retiradas, stock y validación autoritativa, precios, calendarios/cierres, idempotencia y trazabilidad.
- PRODUCTION no debe depender del `MockAdapter` como fuente principal de autoridad de negocio.

DEMO y PRODUCTION comparten el mismo código funcional y diseño aprobado; la diferencia principal es el modo de integración y la fuente/autoridad de los datos.

PRODUCTION no significa que SELAE, Redsys, wallet, ledger, retiradas u otros servicios externos estén ya conectados, certificados o listos para operación real. Representa la base frontend preparada para su integración con backend y proveedores reales.

## Release decision

El artefacto es entregable como frontend demo/mock y base contractual FE→BE, con pendientes BE y QA físico explícitos. No debe presentarse como producción transaccional real hasta completar la integración server-side y validación legal/operativa.
