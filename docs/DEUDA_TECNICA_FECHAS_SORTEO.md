# Deuda técnica: fechas de sorteo y zona horaria

## Estado actual

El flujo de juego ya soporta selección de varios sorteos (`drawDates[]`) y funciona correctamente en modo mock y Firebase.

Actualmente el cálculo y la serialización de fechas usan varias conversiones basadas en `Date` y `toISOString()`. Esto es suficiente para la demo y para el comportamiento actual validado, pero deja una zona gris en torno a la normalización horaria.

## Riesgo identificado

El riesgo no está en la selección matemática de apuestas, sino en la representación temporal del sorteo:

- una fecha local puede desplazarse al convertirla a ISO UTC
- un mismo sorteo puede verse distinto según el huso horario del cliente
- comparaciones como `drawDate === result.date.split('T')[0]` dependen de que ambos lados estén normalizados de la misma forma
- al crecer el soporte multi-draw, estos desajustes pueden volverse más visibles

Ejemplo típico:

- el usuario selecciona un sorteo pensado en horario peninsular español
- el cliente genera una fecha con `Date`
- la conversión a UTC mueve el día al anterior o al siguiente
- el ticket queda persistido con una fecha válida técnicamente, pero semánticamente ambigua

## Impacto actual

A día de hoy esta deuda técnica no bloquea el flujo aprobado:

- `build` y `lint` están en verde
- la demo se mantiene estable
- la compra simple y multi-draw funciona
- no se ha detectado regresión funcional directa en tickets, wallet o results

Por eso se considera deuda técnica no bloqueante, no bug crítico.

## Recomendación técnica

El siguiente paso recomendado es introducir una capa explícita de normalización temporal para sorteos.

### Objetivo

Que toda fecha de sorteo tenga una semántica única y consistente en toda la app:

- fecha lógica del sorteo
- zona horaria de referencia: `Europe/Madrid`
- representación para UI
- representación para persistencia

### Propuesta mínima

Crear una utilidad central para fechas de sorteo, por ejemplo:

- `toDrawLocalDate()`
- `toDrawStorageDate()`
- `compareDrawCalendarDay()`

Y fijar una convención única:

- UI basada en la fecha lógica del sorteo en zona de negocio (`Europe/Madrid`)
- persistencia basada en fecha normalizada
- comparaciones siempre contra el mismo formato

### Convención recomendada

- almacenar el día de sorteo como `YYYY-MM-DD` en zona de negocio (`Europe/Madrid`)
- usar `Date` o `ISO timestamp` solo para:
  - cierres de sorteo
  - auditoría
  - marcas de creación/actualización

## Regla recomendada

No mezclar en la lógica de negocio:

- `Date` nativo con hora implícita
- `toISOString()` usado como identificador de día
- comparaciones parciales por `split('T')[0]` en varios puntos distintos

Eso debe quedar encapsulado en una única capa de utilidades.

## Prioridad sugerida

Prioridad media.

No es urgente para la demo actual, pero sí recomendable antes de:

- ampliar más juegos con calendario dinámico
- activar reglas reales de cierre de sorteo
- introducir suscripciones reales
- mostrar histórico multi-draw con trazabilidad estricta

## Resumen

La funcionalidad multi-draw está aprobada y estable.

La deuda pendiente es temporal, no matemática:

- falta una normalización explícita de zona horaria
- conviene resolverla antes de seguir escalando calendario y persistencia temporal

---

## Actualización: Multi-draw validada como estable (21/04/2026)

Se ha realizado una auditoría funcional exhaustiva de 10 puntos validando los siguientes escenarios:

1. **Euromillones Multi-semana:** Verificada la generación de hasta 8 tickets por compra (4 semanas) con fechas de sorteo sucesivas y precios correctos (2,50€ x N).
2. **Primitiva Multi-semana:** Verificada la integridad del flujo en variantes de sorteo único y multi-semana.
3. **Regresión:** El flujo tradicional de "Próximo sorteo" permanece intacto y funcional.
4. **Integridad Transaccional:** Se ha comprobado que el cálculo del precio total en el frontend coincide con la creación de tickets individuales en la capa de datos.
5. **Revisión Técnica:** `npm run build` y `npm run lint` están en verde.

### Decisión de Ciclo
La funcionalidad multi-draw se considera **Cerrada y Válida** para la fase actual de industrialización. 

El siguiente paso es la **Normalización de fechas en Europe/Madrid** para eliminar la ambigüedad de `toISOString()` y garantizar que la app sea resiliente a cambios de huso horario en el cliente, según se detalla en las recomendaciones técnicas de este documento.
