# Comunicaciones Automáticas por Email — Especificación BE
**Lotería Manises · Sistema de Email Transaccional**

Este documento define cada email automático que el backend debe enviar, incluyendo el evento disparador, el fichero HTML de plantilla, las variables que debe inyectar y las condiciones de entrega.

Las plantillas usan la sintaxis `{{VARIABLE}}` (compatible con Mustache, Handlebars, Jinja2 y similares).  
La URL base de assets CDN es `https://cdn.loteriamanises.com/emails/`.

---

## Índice

> **Nota de estado (2026-08-18):** este índice y las secciones de detalle que
> le siguen se escribieron cuando solo existía 1 de los 34 templates
> transaccionales ya construidos hoy en `emails/templates/transaccional/`.
> Los nombres de fichero de las filas 01–17 se han corregido para apuntar
> al `.html` real que cubre cada evento, pero las secciones de detalle
> (variables / contenido esperado / notas BE) de las filas marcadas
> "🔲 revisar" **no se han vuelto a redactar** — describen el plan original,
> no necesariamente la plantilla final. Los 17 templates adicionales que ya
> existen y no tenían fila en este índice (`juegos-*`, `nacional-*`,
> `abono-recepcion-solicitud`, `comunicacion-pedido`,
> `cuenta-datos-actualizados`, `cuenta-cancelada`, etc.) tampoco están
> documentados aquí todavía. Antes de que el backend implemente la
> integración, alguien debe hacer una pasada completa de este documento
> contra los 34 `.html` reales — no asumir que lo que sigue está al día.

| # | Evento | Plantilla | Estado |
|---|--------|-----------|--------|
| 01 | Registro completado | `auth-bienvenida.html` | 🔲 revisar contra plantilla real |
| 02 | Verificación de email | *(sin plantilla dedicada — no construida)* | 🔲 revisar contra plantilla real |
| 03 | Recuperación de contraseña | `auth-recuperar-contrasena.html` | 🔲 revisar contra plantilla real |
| 04 | Cambio de contraseña (aviso seguridad) | `cuenta-contrasena-modificada.html` | 🔲 revisar contra plantilla real |
| 05 | Solicitud de recarga por transferencia | `recarga-transferencia.html` | ✅ listo |
| 06 | Recarga por tarjeta confirmada | `recarga-confirmacion.html` | 🔲 revisar contra plantilla real |
| 07 | Confirmación de compra (jugadas) | `juegos-confirmacion-pedido.html` | 🔲 revisar contra plantilla real |
| 08 | Premio menor acreditado en saldo | `nacional-escrutado-con-premio-custodia.html` | 🔲 revisar contra plantilla real |
| 09 | Premio mayor — inicio de proceso | `nacional-escrutado-con-premio-mensajeria.html` | 🔲 revisar contra plantilla real |
| 10 | Solicitud de retirada de saldo | `wallet-retirada.html` | 🔲 revisar contra plantilla real |
| 11 | Retirada de saldo completada | *(cubierta por `wallet-retirada.html`? revisar)* | 🔲 revisar contra plantilla real |
| 12 | Verificación KYC solicitada | *(sin plantilla — no construida)* | 🔲 revisar contra plantilla real |
| 13 | Verificación KYC aprobada | *(sin plantilla — no construida)* | 🔲 revisar contra plantilla real |
| 14 | Verificación KYC rechazada | *(sin plantilla — no construida)* | 🔲 revisar contra plantilla real |
| 15 | Abono (suscripción) activado | `juegos-abono-confirmacion.html` / `abono-confirmacion.html` | 🔲 revisar contra plantilla real |
| 16 | Abono (suscripción) cancelado | `juegos-abono-cancelacion.html` / `nacional-abono-cancelacion.html` | 🔲 revisar contra plantilla real |
| 17 | Abono — jugada procesada en sorteo | `juegos-abono-renovacion-fallida.html`? | 🔲 revisar contra plantilla real |

**Templates ya construidos y sin fila en este índice todavía** (documentar en
una futura pasada): `abono-recepcion-solicitud`, `abono-rechazo`,
`auth-nuevo-acceso`, `comunicacion-pedido`, `cuenta-cancelada`,
`cuenta-datos-actualizados`, `juegos-recepcion-pedido`, `juegos-escrutado`,
`juegos-cancelacion-pedido`, `nacional-recepcion-solicitud`,
`nacional-confirmacion-pedido`, `nacional-cancelacion-pedido`,
`nacional-envio-pedido`, `nacional-escrutado-sin-premio-custodia`,
`nacional-escrutado-sin-premio-mensajeria`, `nacional-escrutado`,
`nacional-abono-recordatorio`, `nacional-solicitud-modificada`,
`recarga-compra-no-completada`, `recarga-fallida`.

---

## Variables globales

Presentes en **todos** los templates.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{NOMBRE_USUARIO}}` | Nombre de pila del usuario | `Carlos` |
| `{{URL_VERSION_WEB}}` | Enlace a versión web del email | `https://app.loteriamanises.com/emails/view/abc123` |
| `{{URL_APP_STORE}}` | Enlace App Store | `https://apps.apple.com/es/app/loteria-manises/...` |
| `{{URL_GOOGLE_PLAY}}` | Enlace Google Play | `https://play.google.com/store/apps/details?id=...` |

### Enlaces fijos del footer
| Red | URL |
|---|---|
| Facebook | `https://www.facebook.com/LoteriaManises/` |
| Instagram | `https://www.instagram.com/loteriamanises/` |
| X (Twitter) | `https://x.com/loteriamanises` |

---

## 01 · Bienvenida

**Fichero:** `templates/transaccional/bienvenida.html`  
**Disparador:** El usuario completa el registro (email + contraseña verificados)  
**Destinatario:** Email registrado  
**Asunto sugerido:** `Bienvenido a Lotería Manises, {{NOMBRE_USUARIO}} 🎉`  
**Prioridad:** Alta — es el primer contacto de la marca

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{URL_VERIFICACION}}` | Enlace para verificar el email si no se ha hecho aún | `https://app.loteriamanises.com/verify/token123` |

### Contenido esperado
- Saludo de bienvenida personalizado
- CTA principal: acceder a la app / explorar juegos
- Resumen de qué puede hacer el usuario (comprar décimos, recargar saldo, recibir premios)
- Módulo de descarga de la app
- Footer compartido

### Notas BE
- Enviar inmediatamente tras la verificación del email de registro
- Si el sistema requiere verificación de email previa al acceso, este email puede omitir el bloque de verificación

---

## 02 · Verificación de email

**Fichero:** `templates/transaccional/verificacion-email.html`  
**Disparador:** Registro nuevo o cambio de email en configuración  
**Destinatario:** Email a verificar  
**Asunto sugerido:** `Confirma tu dirección de email — Lotería Manises`  
**Prioridad:** Crítica — bloquea el acceso hasta completar

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{URL_VERIFICACION}}` | Enlace de verificación único (token) | `https://app.loteriamanises.com/verify/token123` |
| `{{EXPIRACION_ENLACE}}` | Tiempo de validez del enlace | `24 horas` |

### Contenido esperado
- Mensaje claro: "Confirma tu email para activar tu cuenta"
- CTA único y grande: "Confirmar mi email"
- Nota de expiración del enlace
- Aviso de seguridad: si el usuario no solicitó esto, puede ignorarlo
- Sin footer de app (no tiene sentido antes de verificar)

### Notas BE
- El token de verificación debe ser de un solo uso
- Si el enlace expira, el usuario debe poder solicitar uno nuevo desde la app
- Reenvío máximo: 3 veces en 24h por dirección IP

---

## 03 · Recuperación de contraseña

**Fichero:** `templates/transaccional/recuperacion-contrasena.html`  
**Disparador:** El usuario solicita restablecer contraseña desde login  
**Destinatario:** Email registrado en la cuenta  
**Asunto sugerido:** `Restablece tu contraseña — Lotería Manises`  
**Prioridad:** Crítica

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{URL_RESET_PASSWORD}}` | Enlace de restablecimiento único (token) | `https://app.loteriamanises.com/reset/token456` |
| `{{EXPIRACION_ENLACE}}` | Tiempo de validez | `1 hora` |

### Contenido esperado
- Mensaje directo: "Recibiste este email porque solicitaste restablecer tu contraseña"
- CTA: "Restablecer contraseña"
- Nota de expiración
- Aviso de seguridad: si no lo solicitó, su contraseña no ha cambiado

### Notas BE
- El enlace debe expirar en **60 minutos**
- Token de un solo uso: se invalida al usarse
- No revelar si el email existe o no en la respuesta de la API (seguridad)

---

## 04 · Cambio de contraseña (aviso de seguridad)

**Fichero:** `templates/transaccional/cambio-contrasena.html`  
**Disparador:** El usuario cambia su contraseña exitosamente  
**Destinatario:** Email registrado  
**Asunto sugerido:** `Tu contraseña ha sido actualizada — Lotería Manises`  
**Prioridad:** Alta — aviso de seguridad

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{FECHA_CAMBIO}}` | Fecha y hora del cambio | `11 agosto 2026, 14:32h` |
| `{{URL_SOPORTE}}` | Enlace a soporte si no fue el usuario | `https://app.loteriamanises.com/soporte` |

### Contenido esperado
- "Tu contraseña ha sido cambiada correctamente"
- Fecha y hora del cambio
- Aviso: si no fuiste tú, contacta con soporte inmediatamente
- CTA secundario: "Contactar soporte"

### Notas BE
- Enviar siempre que se modifique la contraseña, independientemente del método (formulario, reset por email)
- No incluir ni la contraseña antigua ni la nueva

---

## 05 · Solicitud de recarga por transferencia bancaria

**Fichero:** `templates/transaccional/recarga-transferencia.html`  
**Disparador:** El usuario solicita una recarga y elige el método "transferencia bancaria"  
**Destinatario:** Email registrado  
**Asunto sugerido:** `Solicitud de recarga recibida — {{IMPORTE}} · Lotería Manises`  
**Prioridad:** Alta  
**Estado:** ✅ Plantilla HTML completada

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{NUMERO_SOLICITUD}}` | ID único de la solicitud | `4773337` |
| `{{IMPORTE}}` | Importe solicitado con formato español | `50,00 €` |
| `{{BENEFICIARIO}}` | Nombre del titular de la cuenta destino | `LOTERÍA MANISES, S.L.` |
| `{{BANCO}}` | Nombre del banco de destino | `Banco Sabadell` |
| `{{IBAN}}` | IBAN formateado con espacios | `ES96 0081 0271 80 0001345344` |
| `{{URL_COPIAR_IBAN}}` | URL de acción para copiar el IBAN (puede ser deeplink) | `https://app.loteriamanises.com/copy-iban/4773337` |
| `{{PLAZO_ESTIMADO}}` | Horas hábiles estimadas de acreditación | `72` |

### Condiciones
- Se envía en el momento en que el usuario confirma la solicitud, **antes** de recibir la transferencia
- El saldo no se acredita hasta que la transferencia sea recibida y confirmada manualmente

---

## 06 · Recarga por tarjeta confirmada

**Fichero:** `templates/transaccional/recarga-tarjeta-confirmada.html`  
**Disparador:** Pago con tarjeta (Redsys) completado con éxito — callback de confirmación recibido  
**Destinatario:** Email registrado  
**Asunto sugerido:** `Recarga de {{IMPORTE}} confirmada — Lotería Manises`  
**Prioridad:** Alta

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{NUMERO_OPERACION}}` | ID de la operación Redsys | `OP-2026-0811-4420` |
| `{{IMPORTE}}` | Importe recargado | `50,00 €` |
| `{{METODO_PAGO}}` | Descripción de la tarjeta usada | `Visa •••• 4242` |
| `{{SALDO_NUEVO}}` | Saldo resultante en la cuenta | `125,50 €` |
| `{{FECHA_OPERACION}}` | Fecha y hora de la operación | `11 ago 2026, 15:04h` |

### Contenido esperado
- Confirmación de la recarga con importe destacado
- Tarjeta usada (brand + últimos 4 dígitos)
- Saldo actual tras la recarga
- CTA: "Ver mi saldo" / "Jugar ahora"

### Notas BE
- Enviar solo cuando el pago esté **confirmado** por Redsys (no en el redirect del navegador, sino en la notificación server-to-server)
- No enviar si el pago queda en estado pendiente o es rechazado

---

## 07 · Confirmación de compra (jugadas)

**Fichero:** `templates/transaccional/confirmacion-compra.html`  
**Disparador:** El usuario confirma una sesión de juego y las jugadas son procesadas correctamente  
**Destinatario:** Email registrado  
**Asunto sugerido:** `Tus jugadas para {{NOMBRE_SORTEO}} están confirmadas — Lotería Manises`  
**Prioridad:** Alta — es el recibo del usuario

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{NUMERO_PEDIDO}}` | ID único de la compra | `PED-20260811-0042` |
| `{{FECHA_COMPRA}}` | Fecha y hora de confirmación | `11 ago 2026, 16:20h` |
| `{{NOMBRE_SORTEO}}` | Nombre del sorteo principal | `Bonoloto · Sorteo del 12 ago` |
| `{{FECHA_SORTEO}}` | Fecha del sorteo | `miércoles, 12 agosto 2026` |
| `{{IMPORTE_TOTAL}}` | Importe total descontado del saldo | `6,00 €` |
| `{{SALDO_RESTANTE}}` | Saldo tras la compra | `44,50 €` |
| `{{LINEAS_COMPRA}}` | Array de jugadas (ver estructura abajo) | — |

### Estructura de `{{LINEAS_COMPRA}}`

El backend debe iterar sobre este array para renderizar cada jugada en el email:

```json
[
  {
    "tipo": "Bonoloto",
    "numeros": "3 · 14 · 22 · 31 · 41 · 49",
    "complementario": "estrella: 2 · 5",
    "modalidad": "Sencilla",
    "importe": "1,00 €"
  },
  {
    "tipo": "Primitiva",
    "numeros": "7 · 12 · 19 · 28 · 36 · 45",
    "complementario": "c: 8 · R: 4",
    "modalidad": "Doble",
    "importe": "2,00 €"
  }
]
```

Para **décimos nacionales / Navidad / El Niño**, cada línea incluye además:
```json
{
  "tipo": "Lotería Nacional",
  "numero": "03721",
  "serie": "004",
  "fraccion": "2",
  "sorteo": "Navidad 2026",
  "importe": "20,00 €",
  "custodia": "digital",
  "custodia_ref": "CUS-20260811-00123"
}
```

### Notas BE
- Solo se envía si **todas** las jugadas son confirmadas (éxito total)
- Si hay confirmación parcial, enviar también este email indicando las jugadas que sí se procesaron y notificando el reembolso de las fallidas

---

## 08 · Premio menor acreditado en saldo

**Fichero:** `templates/transaccional/premio-saldo.html`  
**Disparador:** El sistema acredita automáticamente un premio en el saldo del usuario  
**Destinatario:** Email registrado  
**Asunto sugerido:** `¡Premio de {{IMPORTE_PREMIO}} acreditado en tu cuenta! — Lotería Manises`  
**Prioridad:** Alta — noticia positiva para el usuario

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{NOMBRE_JUEGO}}` | Nombre del juego | `Bonoloto` |
| `{{FECHA_SORTEO}}` | Fecha del sorteo premiado | `martes, 10 agosto 2026` |
| `{{NUMEROS_PREMIADOS}}` | Los números de la jugada ganadora | `7 · 14 · 22 · 31 · 36 · 45` |
| `{{CATEGORIA_PREMIO}}` | Categoría del premio | `5.ª categoría (3 aciertos)` |
| `{{IMPORTE_PREMIO}}` | Importe bruto del premio | `4,80 €` |
| `{{SALDO_NUEVO}}` | Saldo tras acreditar el premio | `54,30 €` |
| `{{URL_MIS_TICKETS}}` | Enlace a la sección "Mis jugadas" | `https://app.loteriamanises.com/tickets` |

### Contenido esperado
- Encabezado celebratorio ("¡Enhorabuena!")
- Juego, fecha del sorteo y números ganadores
- Categoría y cantidad acreditada
- Saldo actual
- CTA: "Ver mi saldo" / "Jugar de nuevo"

---

## 09 · Premio mayor — inicio de proceso de validación

**Fichero:** `templates/transaccional/premio-mayor-validacion.html`  
**Disparador:** Una jugada del usuario tiene un premio que supera el umbral de validación manual (ej. > 2.500 €) o requiere proceso oficial LAE  
**Destinatario:** Email registrado  
**Asunto sugerido:** `Premio importante detectado en tu cuenta — Lotería Manises`  
**Prioridad:** Crítica

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{NOMBRE_JUEGO}}` | Nombre del juego | `Lotería Nacional` |
| `{{SORTEO}}` | Identificador del sorteo | `Sorteo del Jueves nº 84` |
| `{{IMPORTE_PREMIO}}` | Importe bruto estimado | `25.000,00 €` |
| `{{PASOS_PROCESO}}` | Array con los pasos a seguir | — |
| `{{URL_SOPORTE}}` | Enlace a soporte / contacto | `https://app.loteriamanises.com/soporte` |
| `{{TELEFONO_SOPORTE}}` | Teléfono de atención | `96 154 03 17` |

### Notas BE
- No acreditar el importe automáticamente — este proceso requiere validación
- El email debe ser claro en que el premio está **pendiente de validación**, no acreditado
- Incluir referencia al proceso oficial de cobro de premios de la LAE cuando aplique

---

## 10 · Solicitud de retirada de saldo

**Fichero:** `templates/transaccional/solicitud-retirada.html`  
**Disparador:** El usuario solicita una retirada de saldo a su cuenta bancaria  
**Destinatario:** Email registrado  
**Asunto sugerido:** `Solicitud de retirada de {{IMPORTE}} recibida — Lotería Manises`  
**Prioridad:** Alta

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{NUMERO_SOLICITUD}}` | ID de la solicitud | `RET-20260811-0018` |
| `{{IMPORTE}}` | Importe a retirar | `100,00 €` |
| `{{IBAN_DESTINO}}` | IBAN del banco del usuario (enmascarado) | `ES96 **** **** **** **45 44` |
| `{{TITULAR_IBAN}}` | Nombre del titular de la cuenta destino | `Carlos García López` |
| `{{PLAZO_ESTIMADO}}` | Días hábiles estimados | `1–3 días hábiles` |
| `{{SALDO_RETENIDO}}` | Saldo pendiente tras la solicitud | `25,50 €` |

### Notas BE
- El saldo se retiene en el momento de la solicitud, aunque la transferencia tarde en llegar
- Si la solicitud es rechazada, enviar el email `retirada-confirmada.html` con estado `RECHAZADA` y el saldo devuelto

---

## 11 · Retirada de saldo completada

**Fichero:** `templates/transaccional/retirada-confirmada.html`  
**Disparador:** La transferencia al IBAN del usuario ha sido procesada (o rechazada)  
**Destinatario:** Email registrado  
**Asunto sugerido:** `Retirada de {{IMPORTE}} completada — Lotería Manises`  
**Prioridad:** Alta

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{NUMERO_OPERACION}}` | ID de la operación | `RET-20260811-0018` |
| `{{IMPORTE}}` | Importe transferido | `100,00 €` |
| `{{IBAN_DESTINO}}` | IBAN destino enmascarado | `ES96 **** **** **** **45 44` |
| `{{FECHA_TRANSFERENCIA}}` | Fecha de emisión de la transferencia | `11 ago 2026` |
| `{{ESTADO}}` | Estado de la operación | `COMPLETADA` o `RECHAZADA` |
| `{{MOTIVO_RECHAZO}}` | Solo si ESTADO = RECHAZADA | `IBAN no validado` |

---

## 12 · Verificación KYC solicitada

**Fichero:** `templates/transaccional/kyc-solicitada.html`  
**Disparador:** El usuario inicia el proceso de verificación de identidad (KYC) desde la app  
**Destinatario:** Email registrado  
**Asunto sugerido:** `Hemos recibido tu documentación — Lotería Manises`  
**Prioridad:** Media

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{NUMERO_SOLICITUD_KYC}}` | ID de la solicitud KYC | `KYC-20260811-0004` |
| `{{PLAZO_REVISION}}` | Plazo estimado de revisión | `24–48 horas hábiles` |
| `{{URL_ESTADO_KYC}}` | Enlace a seguimiento del estado | `https://app.loteriamanises.com/perfil/kyc` |

---

## 13 · Verificación KYC aprobada

**Fichero:** `templates/transaccional/kyc-aprobada.html`  
**Disparador:** El equipo de Lotería Manises aprueba la documentación KYC  
**Destinatario:** Email registrado  
**Asunto sugerido:** `Identidad verificada — tu cuenta está completa · Lotería Manises`  
**Prioridad:** Alta

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{FECHA_APROBACION}}` | Fecha de aprobación | `11 agosto 2026` |
| `{{LIMITES_DESBLOQUEADOS}}` | Descripción de lo que se desbloquea | `Retiradas hasta 10.000 €/mes` |

### Contenido esperado
- Confirmación positiva ("Tu identidad ha sido verificada")
- Qué se desbloquea con la verificación completa
- CTA: "Ir a mi cuenta"

---

## 14 · Verificación KYC rechazada

**Fichero:** `templates/transaccional/kyc-rechazada.html`  
**Disparador:** La documentación KYC es rechazada (documentación inválida, caducada, etc.)  
**Destinatario:** Email registrado  
**Asunto sugerido:** `Revisión de documentación — acción requerida · Lotería Manises`  
**Prioridad:** Alta

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{MOTIVO_RECHAZO}}` | Motivo legible del rechazo | `El documento enviado está caducado` |
| `{{URL_REINTENTAR_KYC}}` | Enlace directo para volver a intentarlo | `https://app.loteriamanises.com/perfil/kyc` |

### Notas BE
- No incluir términos técnicos en el motivo de rechazo — usar lenguaje claro
- El usuario debe poder reintentar sin límite hasta que sea aprobado

---

## 15 · Abono (suscripción) activado

**Fichero:** `templates/transaccional/abono-activado.html`  
**Disparador:** El usuario activa un abono a sorteo(s) recurrente(s)  
**Destinatario:** Email registrado  
**Asunto sugerido:** `Tu abono a {{NOMBRE_JUEGO}} está activo — Lotería Manises`  
**Prioridad:** Media

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{ID_ABONO}}` | ID del abono | `ABN-20260811-0077` |
| `{{NOMBRE_JUEGO}}` | Nombre del juego | `Bonoloto` |
| `{{DESCRIPCION_APUESTA}}` | Descripción de la jugada recurrente | `6 números · modalidad sencilla` |
| `{{NUMEROS}}` | Números/combinación del abono | `3 · 14 · 22 · 31 · 41 · 49` |
| `{{FRECUENCIA}}` | Periodicidad | `Todos los sorteos` / `Martes y viernes` |
| `{{IMPORTE_POR_SORTEO}}` | Coste por participación | `1,00 €` |
| `{{PROXIMO_SORTEO}}` | Fecha del próximo sorteo en que participará | `martes, 12 agosto 2026` |
| `{{URL_GESTIONAR_ABONO}}` | Enlace a gestión del abono | `https://app.loteriamanises.com/suscripciones/ABN-0077` |

---

## 16 · Abono (suscripción) cancelado

**Fichero:** `templates/transaccional/abono-cancelado.html`  
**Disparador:** El usuario cancela un abono activo  
**Destinatario:** Email registrado  
**Asunto sugerido:** `Tu abono a {{NOMBRE_JUEGO}} ha sido cancelado — Lotería Manises`  
**Prioridad:** Media

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{ID_ABONO}}` | ID del abono cancelado | `ABN-20260811-0077` |
| `{{NOMBRE_JUEGO}}` | Nombre del juego | `Bonoloto` |
| `{{FECHA_CANCELACION}}` | Fecha efectiva de la cancelación | `11 agosto 2026` |
| `{{ULTIMO_SORTEO}}` | Último sorteo en que participó | `martes, 10 agosto 2026` |

### Notas BE
- Si la cancelación ocurre entre sorteos, indicar que el abono ya no participará a partir del siguiente sorteo
- Si hay saldo retenido para el abono, reintegrarlo inmediatamente

---

## 17 · Abono — jugada procesada en sorteo

**Fichero:** `templates/transaccional/abono-jugada-procesada.html`  
**Disparador:** El sistema procesa automáticamente la jugada de un abono activo para un sorteo  
**Destinatario:** Email registrado  
**Asunto sugerido:** `Tu abono ha participado en {{NOMBRE_SORTEO}} — Lotería Manises`  
**Prioridad:** Baja — informativo (puede ser opcional o configurable por el usuario)

### Variables específicas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{NOMBRE_JUEGO}}` | Nombre del juego | `Primitiva` |
| `{{NOMBRE_SORTEO}}` | Identificador del sorteo | `Sorteo nº 55 · Jueves 14 ago` |
| `{{NUMEROS}}` | Combinación jugada | `7 · 12 · 19 · 28 · 36 · 45` |
| `{{IMPORTE_DESCONTADO}}` | Importe descontado del saldo | `2,00 €` |
| `{{SALDO_RESTANTE}}` | Saldo tras el descuento | `42,30 €` |
| `{{FECHA_RESULTADO}}` | Cuándo se conocen los resultados | `esta noche a las 21:30h` |

### Notas BE
- Este email es **opcional** — considerar permitir al usuario desactivarlo desde ajustes para no saturar su bandeja
- Si el abono genera un premio, enviarlo a continuación del email `premio-saldo.html` o `premio-mayor-validacion.html` según corresponda

---

## Notas generales de implementación

### Prioridad de envío

Los emails deben enviarse con la siguiente prioridad SMTP (`X-Priority` header):

| Prioridad | Tipos de email |
|---|---|
| `1` (urgente) | Verificación email, recuperación contraseña, cambio contraseña |
| `2` (alta) | Todas las operaciones económicas (recargas, retiradas, premios) |
| `3` (normal) | Confirmaciones de compra, KYC, abonos |

### Sender recomendado

```
From: Lotería Manises <notificaciones@loteriamanises.com>
Reply-To: info@loteriamanises.com
```

### Logs y auditoría

El backend debe registrar para cada email enviado:
- `user_id` del destinatario
- `email_type` (ej. `recarga-transferencia`)
- `timestamp_enviado`
- `status` (entregado / rebotado / abierto — vía webhook del proveedor SMTP)
- `template_version` (para trazabilidad si el template cambia)

### Proveedor SMTP recomendado

Para transaccional: **SendGrid**, **Postmark** o **Resend**.  
Evitar servidores propios para emails transaccionales — la reputación del dominio es crítica para deliverability.

### Inlining de CSS

El HTML de las plantillas incluye `<style>` en el `<head>` para media queries responsive.  
Antes de enviar, pasar las plantillas por un **CSS inliner** (ej. `juice`, `premailer`) para maximizar compatibilidad.  
Las media queries deben **mantenerse en el `<head>`** y NO inline (los clientes que las soportan las leen del head).

### Charset y encoding

- Encoding: `UTF-8`
- Las variables deben escaparse como HTML antes de inyectarlas (evitar XSS vía nombre de usuario, etc.)
- Caracteres especiales del español (`á é í ó ú ñ ü ¿ ¡`) pueden usarse directamente en UTF-8 o como entidades HTML

---

## Historial de cambios

| Fecha | Versión | Cambio |
|---|---|---|
| 2026-08-11 | 1.0 | Documento inicial — 17 comunicaciones mapeadas |
