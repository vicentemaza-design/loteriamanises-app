# Mejoras posteriores a la entrega y qué hace falta para producción

Documento de traspaso. Complementa a `RELEASE_SOURCE_OF_TRUTH.md` (alcance y
estado de la entrega) y a `ios-pwa-final-architecture.md` (invariantes de iOS).

**Base entregada:** `main` en `a338208`, 30 de agosto de 2026.
**Este documento cubre:** lo añadido después de esa fecha, y lo que hay que
cambiar antes de conectar contra servicios reales.

**Rondas de mejoras:**

| Ronda | Fecha | `main` | Sección |
|---|---|---|---|
| 1 | 02/09/2026 | `a338208` → `b14628d` | §1 |
| 2 | 10/09/2026 | `b14628d` → `8727d04` | §5 |

---

## 1. Mejoras incorporadas después de la entrega

Todas validadas en iPhone físico con la PWA instalada. Cada una lleva su porqué
comentado en el código; los comentarios no son decorativos y se explica más
abajo por qué conviene no borrarlos.

| Bloque | Qué resuelve |
|---|---|
| **Arranque** | El documento ya no se pide por red en cada apertura. Medido con 250 ms de RTT simulado: azul de marca de 289 a ~40 ms, app usable de 719 a ~180 ms en cada relanzamiento |
| **Toasts** | Los avisos salían casi blancos bajo el status bar de iOS y conmutaban sus glifos a oscuro sin revertirlos. Ahora van sobre `#0A4792` con el tipo marcado por el color del icono |
| **Teclado** | La hoja de "Datos de envío" se dimensiona al `visualViewport`: sus últimos campos ya no quedan detrás del teclado |
| **Carrusel de Gordos** | La última tarjeta era inalcanzable arrastrando por aritmética de scroll. Se cierra con una tarjeta de marca que además corrige la geometría |
| **Cesta** | El modo de entrega se recuerda entre aperturas, y salir hacia otro sorteo cierra el panel en vez de dejarlo tapando el juego |
| **Navegación** | Cuatro controles llamaban a `navigate('/')`, que en este router **es el Login**. Logo de cabecera, 404 y dos CTA expulsaban al usuario |

### Piezas que parecen prescindibles y no lo son

Cada una tiene detrás una regresión reproducida. Están comentadas en el propio
código, y `ios-pwa-final-architecture.md` las recoge con más detalle:

- `!important` en `html` y `html.has-bottom-nav` (`src/index.css`). El critical
  CSS inline va sin capa y gana a `@layer base`; sin el `!important`, el
  bootstrap no caduca y borra el alfa del BottomNav.
- `html [data-sonner-toaster][data-sonner-theme]` (`shared/styles/toasts.css`).
  sonner inyecta en runtime una regla de especificidad (0,2,0); un selector más
  débil pierde y el toast vuelve a salir blanco. **Ya se desplegó así una vez.**
- La compuerta `html:not(.css-ready) #root` (`vite.config.ts`). Al no bloquear el
  render, React monta antes de que el bundle se aplique.
- La tarjeta de cierre del carrusel. Extiende el recorrido del scroll; si se
  quita, el último Gordo vuelve a ser inalcanzable.

### Cómo verificar cambios en estas zonas

- **Arranque y service worker:** medir el **segundo** arranque, nunca el primero.
  El worker debe instalarse antes de poder servir nada, y por diseño un build
  nuevo tarda un arranque en tomar el control (no hace `skipWaiting`, para no
  recargar la app en mitad de una sesión). Para reiniciar de cero: desinstalar y
  reinstalar la PWA.
- **Toasts:** contra un `<Toaster>` real de sonner y la hoja de estilos ya
  construida, nunca contra un DOM montado a mano — las reglas que compiten se
  inyectan en runtime y en un DOM fabricado no existen.
- **`npm run dev` no reproduce el arranque.** `scripts/prepare-ios-startup.mjs`
  solo corre en `build`, así que en dev no hay critical CSS ni loader. No está
  roto: hay que hacer `build` y servir `dist/`.

---

## 2. Antes de conectar contra servicios reales

### 2.1 `demoEnabled` está forzado a `true` en `main`

`src/config/runtime.ts` contiene:

```ts
demoEnabled: true,
```

con un comentario encima que dice, textualmente, *"NUNCA mergear este override
a main"*. Está en `main`, es decir, en la base entregada.

**Esto es deliberado y se mantiene**: `main` es la variante DEMO y debe seguir
permitiendo el recorrido sin backend. Lo que no puede es viajar así a un build
conectado.

El diseño original lee la variable de entorno y **falla cerrado**:

```ts
demoEnabled: import.meta.env.VITE_ENABLE_DEMO_ACCESS === 'true',
```

Ese arreglo existe en el commit `ed7927e` ("restore production-safe demo and
debug flags") y vive hoy en `fix/release-cleanup-demo-debug`,
`test/release-cleanup-demo-enabled` y `test/ios-top-surface-isolation`.

### 2.2 Qué gobierna exactamente esa bandera

No es solo el botón de "Entrar en modo demo". Con `demoEnabled` en `true`:

| Fichero | Efecto |
|---|---|
| `shared/lib/getFunctionalUserId.ts` | **Devuelve `'demo-user'` para cualquier usuario** |
| `features/profile/lib/security.ts` | Habilita el **PIN universal `1234`** |
| `features/wallet/hooks/useMovements.ts` | Salta la comprobación de "no hay usuario" |
| `features/play/hooks/usePlay.ts` | Íd. |
| `features/tickets/hooks/useTickets.ts` | Íd. |
| `features/profile/pages/PaymentsPage.tsx` | Devuelve métodos de pago sintéticos |
| `features/play/lib/quiniela-fixtures.ts` | Rellena jornadas sintéticas |
| `app/providers/AuthProvider.tsx` | Rutas de perfil de demostración |
| `app/layouts/PublicLayout.tsx` | Un usuario identificado que aterriza en `/` se queda en Login en vez de rebotar a `/home` |
| `features/auth/pages/LoginPage.tsx` | Muestra el acceso demo |

**Un build de producción construido desde `main` tal cual tratará a todos los
usuarios como `demo-user` y aceptará el PIN `1234`.** No se puede desactivar por
variables de entorno mientras el valor esté forzado en el código.

### 2.3 Checklist mínimo para un build conectado

1. Restaurar `demoEnabled` a la lectura de `VITE_ENABLE_DEMO_ACCESS` (commit
   `ed7927e`).
2. En el entorno conectado, **no definir** `VITE_ENABLE_DEMO_ACCESS`, o ponerla
   a cualquier valor que no sea la cadena `'true'`.
3. Definir `VITE_API_PROVIDER` explícitamente (`firebase` o `http`). Si se deja
   sin definir **cae a `mock`** por defecto; es la elección del adaptador de
   datos, no una bandera de seguridad, y por eso `demoEnabled` es una bandera
   aparte.
4. Definir las `VITE_FIREBASE_*` si el proveedor es Firebase. El código las
   prefiere sobre `firebase-applet-config.json`.
5. Verificar que el acceso demo y el PIN `1234` **no** aparecen en ese build.

> Nota sobre el entorno de QA: si se restaura la bandera sin poner
> `VITE_ENABLE_DEMO_ACCESS=true` en el despliegue de demo, ese despliegue deja
> de mostrar el acceso demo y no se puede recorrer sin cuenta. Hay que
> configurar la variable antes o a la vez.

### 2.4 `firebase-applet-config.json` está versionado

Sigue trackeado pese a aparecer en `.gitignore` — un `.gitignore` no destrackea
lo ya versionado — y apunta al proyecto `loteria-manises`.

Esto **no es una fuga de credenciales**: la configuración web de Firebase no es
secreta, la `apiKey` identifica el proyecto y la seguridad la dan las reglas de
Firestore y App Check. Pero el `.gitignore` da una falsa sensación de
protección, y conviene decidir explícitamente si ese fichero se queda o se
sustituye por completo por las `VITE_FIREBASE_*`.

**La seguridad real de los datos depende de las reglas de Firestore y de la
validación en backend, no del frontend.** Este frontend envía intenciones; toda
autoridad sobre precio, saldo, calendario, stock e idempotencia es del backend,
como ya recoge `RELEASE_SOURCE_OF_TRUTH.md`.

---

## 3. Lo que el frontend necesita saber del backend

No está definido y condiciona el trabajo de integración:

1. **Qué proveedor se usa**: `firebase`, `http`, o ambos según entorno. El
   frontend ya tiene los tres adaptadores detrás de `IApiProvider`.
2. **Base de datos y modelo**: si es Firestore, hacen falta las reglas y la forma
   de las colecciones. Si es una API propia, hace falta el contrato — el
   adaptador HTTP tiene rutas, pero deja pendientes auth por email, cuentas
   bancarias, retirada y cálculo autoritativo de precio.
3. **Autenticación**: qué emite el token, cómo se renueva, y qué identidad
   sustituye a `getFunctionalUserId()`.
4. **Idempotencia y trazabilidad SELAE**: qué clave usa el backend y qué debe
   enviar el frontend en cada intento de compra.
5. **Dónde vive la dirección de envío del usuario.** No existe hoy: `domain.ts`
   solo la guarda DENTRO de un décimo ya comprado, como metadato de ese envío,
   y no hay concepto de "dirección guardada" en perfil ni en los contratos.
   Mientras tanto el frontend la conserva **en el dispositivo**
   (`features/session/lib/shipping-address.ts`), porque si no el usuario
   reescribe nombre, teléfono, email y dirección cada vez que abre la cesta.
   Se borra al cerrar sesión y nunca se envía a ningún sitio por su cuenta:
   solo viaja al confirmar una compra. **Es un puente, no el destino**: cuando
   defináis el contrato de perfil, ese fichero se sustituye por lectura y
   escritura de perfil y desaparece.

Hasta que 1 y 2 estén decididos, el frontend no puede ir más allá de lo que ya
está: adaptadores preparados y contratos declarados.

---

## 4. Otros apuntes operativos

- **`npm run build` modifica el `index.html` versionado**, porque
  `prepare-ios-startup.mjs` escribe sobre el fuente antes de que corra Vite. No
  commitear esos bloques generados.
- **`package-lock.json` cambia mucho** por una sola dependencia añadida
  (`vite-plugin-pwa`). Al revisar el diff, el ruido está ahí.
- **Hay un service worker vivo** desde estas mejoras. Cualquier despliegue nuevo
  tarda un arranque en tomar el control. Si alguien reporta "no veo mi cambio",
  esa es la causa habitual, y se resuelve reinstalando la PWA.

---

## 5. Ronda 2 — Reducidas y garantías (10/09/2026)

`main` de `b14628d` a `8727d04`. Cuatro commits. El grueso no es UI: es que las
pantallas de garantías no tenían detrás datos reales, y eso condiciona al
backend más que cualquier otra cosa de este documento.

### 5.1 Qué cambió en el frontend

| Cambio | Fichero |
|---|---|
| El selector de columnas de Quiniela ya no expulsa los botones `–` y `+` fuera de la tarjeta al añadir columnas | `features/play/components/QuinielaSimpleSection.tsx` |
| Modelo de datos y UI de las tablas de garantías de los juegos numéricos | `features/play/lib/reduced-guarantees.ts` (nuevo), `features/play/reduced/components/ReducedSystemList.tsx` |
| `rows` y `development` de Quiniela pasan a opcionales; las tarjetas declaran cuándo no hay datos | `features/play/lib/quiniela-data.ts`, `QuinielaOficialSection.tsx`, `QuinielaManisesSection.tsx` |
| Precio por apuesta de la Quiniela oficial: `1.0` → `0.75` | `QuinielaOficialSection.tsx` |

El fix de Quiniela se midió con Playwright sobre el componente real a 320, 360,
375, 390, 393 y 430 px con 8 columnas. Antes, `+` salía del viewport desde
393 px y por debajo de 375 px se salían los dos botones. La altura de la
tarjeta no cambia.

### 5.2 Por qué se retiraron datos en vez de corregirlos

Las tablas que había eran de relleno, y en Quiniela se pudo demostrar que
además eran imposibles:

- Los desarrollos contradecían su propio pronóstico. En «4 Triples» solo 4
  partidos pueden variar de signo entre columnas; el desarrollo variaba en los
  15, con 11 partidos mostrando tres signos distintos. En «7 Dobles», con cero
  triples, ningún partido puede tener tres signos: había cuatro.
- Tres reducciones de tamaños distintos —«7 Dobles» (32 ap.), «6 Dobles + 2
  Triples» (32 ap.) y «Reducción al 13» (96 ap.)— declaraban exactamente los
  mismos mínimos y máximos.
- Las nueve declaraban la misma probabilidad, 16,67 %, fuera cual fuera su
  tamaño.

En los juegos numéricos, `DEMO_GUARANTEE_ROWS` estaba indexado solo por el id
del sistema: la misma tabla salía para Bonoloto, Primitiva y Euromillones, y
era idéntica con 12 números que con 40 — cuando la garantía depende justamente
de cuántos números se juegan. Las categorías estaban además en formato
Euromillones («5+2 aciertos») y se mostraban también en los 6/49.

**Criterio aplicado:** en una app que mueve dinero, un hueco declarado es
preferible a una cifra de premio inventada. Donde no hay dato, la UI lo dice.

### 5.3 El contrato de garantías

`features/play/lib/reduced-guarantees.ts` define la forma y resuelve por
`(juego, sistema, nº de números)`:

```ts
getReducedGuaranteeTable(gameId, systemId, numbersCount): ReducedGuaranteeTable | null
```

`null` no es un error: es el estado normal mientras la combinación no esté
cargada, y la UI ya lo trata. Sustituir el objeto `GUARANTEES` por una llamada
del tipo `GET /api/reducidas/garantias?game=&system=&numbers=` respetando
`ReducedGuaranteeTable` es todo el trabajo de integración en el frontend.

**El cliente ha confirmado (10/09/2026) que el motor de reducidas es suyo y ya
vive en su backend**, y que para cada combinación calcula el desarrollo y, a
partir de él, los mínimos, máximos y garantías. Es decir: no hay 164 tablas que
transcribir. Hay un servicio que ya existe y hay que exponerlo.

Las 5 tablas cargadas hoy en `reduced-guarantees.ts` son **semillas de
verificación**, no el destino: sirven para que la UI se pueda probar contra
valores reales mientras se conecta el servicio. Cada una lleva su `source`.
Primitiva y Bonoloto comparten tablas —solo cambia el precio por apuesta—, así
que `getLoadedGuaranteeCombinations()` devuelve 9 pares `(juego, sistema, nº)`
para esas 5 tablas.

### 5.4 Qué son los porcentajes, y por qué esto es un problema de motor

Cada porcentaje publicado es un entero exacto sobre `C(números, aciertos)`:

| Combinación | Total | Columnas publicadas |
|---|---|---|
| 6/49, 10 núm. al 5 | `C(10,6)` = 210 | 18/210 = 8,57 % · 210/210 = 100 % |
| 6/49, 12 núm. al 4 | `C(12,6)` = 924 | 10/924 = 1,08 % · 370/924 = 40,04 % |
| Euro, 15 núm. al 2 | `C(15,5)` = 3003 | 3/3003 = 0,10 % · 153/3003 = 5,09 % · 1503/3003 = 50,05 % |

La **primera** columna es siempre `apuestas / C(n,m)`, así que se puede calcular
con lo que ya hay en `reduced-tables.ts`. Las demás dependen de **qué** columnas
concretas juega la reducción, no de cuántas.

Consecuencia para el backend: **la tabla de garantías y el motor de reducciones
son el mismo problema**. Con el desarrollo real de la reducción, toda la tabla
se calcula de forma exacta y no hace falta cargar 164 tablas a mano. Sin él, no
hay fórmula que valga.

Confirmado por el cliente el 10/09/2026, y por su propia calculadora, que lo
dice con estas palabras: «la probabilidad de coger premio de 6 siempre coincide
con el número de apuestas que juega la reducida».

Lo mismo aplica a «Ver desarrollo»: `generateDemoCombinations()` en
`ReducedSystemList.tsx` **no ejecuta la reducción**. Recorre combinaciones por
fuerza bruta y se queda con las primeras N. Las columnas que muestra no son las
que se jugarían. Se deja en pie a propósito, marcado aquí, porque sustituirlo
sin motor sería cambiar un relleno por otro.

### 5.5 Calidad de los datos que ya están en producción

`reduced-tables.ts` gobierna los precios que cobra la app hoy. Se contrastó con
la fuente de la que salió —el propio blog del cliente, artículo «Combinaciones
Bonoloto Reducidas»— y coincide en todas las filas que ese artículo publica
(10-15 y 25-27). El resto de filas, hasta 49 números, no está publicado ahí.

El 10/09/2026 el cliente envió capturas de su propia calculadora, y cuatro
filas más cuadran exactamente con las nuestras: 21 números al 5 (1.800
apuestas), al 4 (196) y al 3 (26), y 44 números al 3 (355).

Eso **descarta la sospecha de que los saltos no monótonos fueran erratas**: el
21 al 3 son 26 apuestas después de que el 20 sean 30, y así lo da su sistema en
producción. Son reducciones distintas, no una progresión, y no hay nada que
corregir ahí.

Quedan dos cosas por confirmar, las dos de datos:

1. **Huecos internos.** Con 47 números no aparece reducida al 4, pero sí con 46
   y 48. Con 23 no aparece reducida al 3, pero sí con 22 y 24. En Euromillones,
   con 26 no aparece reducida al 3, pero sí con 25 y 27. Se comprueba en un
   minuto en la calculadora del cliente: o existen y a nosotros nos faltan, o
   no existen y entonces está bien.
2. **Divergencia Primitiva/Bonoloto.** Las dos tablas son idénticas en 92 de 93
   filas. En la 93 —13 números, reducida al 3— Primitiva dice 7 apuestas y
   Bonoloto 4. **No se ha tocado**, porque cambia un precio.

### 5.6 Reducidas de Quiniela: pendiente de producto

Los recuentos de `OFICIAL_REDUCTIONS` (`quiniela-data.ts`) no coinciden con las
seis reducidas oficiales de LAE, y en dos casos difiere hasta el tipo de
apuesta:

| En la app | Oficial |
|---|---|
| 4 Triples al 13 — 16 ap. | 4 triples al 13 — **9 ap.** |
| 7 Dobles al 13 — 32 ap. | 7 dobles al 13 — **16 ap.** |
| 3 Dobles + 3 Triples al 13 — 32 ap. | 3 triples y 3 dobles al 13 — **24 ap.** |
| 6 Dobles + 2 Triples al 13 — 32 ap. | 2 triples y 6 dobles al 13 — **64 ap.** |
| 8 **Dobles** al 12 — 64 ap. | 8 **triples** al 12 — **81 ap.** |
| 11 Dobles al 11 — 128 ap. | 11 dobles, condicionada al 13 — **132 ap.** |

Los valores de la app son 16, 32, 32, 32, 64 y 128: todo potencias de dos.
`bet-calculator.ts` sí tiene los oficiales para tres de ellas (`7D→16`,
`4T→9`, `11D→132`), pero no es el fichero que alimenta esa pantalla.

**No se ha corregido** porque qué reducciones se venden es decisión de producto,
no de código. Está pendiente de que lo confirme el cliente. Cuando llegue la
lista, el cambio es de datos en `OFICIAL_REDUCTIONS`.
