# Mejoras posteriores a la entrega y qué hace falta para producción

Documento de traspaso. Complementa a `RELEASE_SOURCE_OF_TRUTH.md` (alcance y
estado de la entrega) y a `ios-pwa-final-architecture.md` (invariantes de iOS).

**Base entregada:** `main` en `a338208`, 30 de agosto de 2026.
**Este documento cubre:** lo añadido después de esa fecha, y lo que hay que
cambiar antes de conectar contra servicios reales.

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
