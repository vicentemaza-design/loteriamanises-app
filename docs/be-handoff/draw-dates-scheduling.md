# Gestión de Fechas y Sorteos (Scheduling)

El frontend permite seleccionar múltiples fechas para una misma jugada. El backend debe gestionar este array como la verdad canónica de la apuesta.

## Conceptos Clave
- **`drawDates` (Array)**: Lista de fechas ISO para las cuales se desea jugar.
- **`scheduleMode`**: Intención del usuario (`next_draw`, `full_week`, `custom_weeks`). BE debe usar esto para auditoría, pero validar las `drawDates` reales.
- **`weeksCount`**: Informativo sobre cuántas semanas cubre la apuesta.

## Lógica de Resolución
El módulo `resolve-draw-dates.ts` en FE calcula estas fechas basándose en la configuración de cada juego. 

### Lo que BE DEBE validar:
1. **Existencia**: Que cada fecha en `drawDates` corresponda a un sorteo real programado en el backend.
2. **Estado**: Que el sorteo esté "Abierto". El cierre suele ser 30-60 minutos antes de la hora oficial del sorteo.
3. **Coherencia**: Que las fechas sean compatibles con el juego. No permitir una fecha de un Miércoles para un juego que solo se sortea los Martes y Viernes (Euromillones).

## Lotería Nacional
Es un caso crítico debido a sus sorteos extraordinarios:
- **Jueves/Sábado**: Sorteos ordinarios semanales.
- **Navidad/Niño**: Sorteos especiales con precios y premios muy distintos.
- **Asignación**: BE debe validar que el `number` elegido (décimo) tiene disponibilidad en el stock de la administración para esa `drawDate` específica.

## Deuda Técnica Identificada
Actualmente el frontend usa la zona horaria del dispositivo. El backend **DEBE** normalizar todas las fechas recibidas a `Europe/Madrid` antes de procesar las validaciones para evitar problemas con usuarios fuera de España o cambios de hora estacionales.
