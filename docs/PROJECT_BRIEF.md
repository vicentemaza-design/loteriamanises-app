# Project Brief: App Manises

## Qué es
App Manises es la app digital de `Lotería Manises`.

No debe entenderse como una demo de loterías ni como una app genérica de números aleatorios. Debe evolucionar como producto real vinculado al negocio de `https://www.loteriamanises.com/`.

## Propósito del producto
Permitir que un usuario gestione su relación con Lotería Manises desde una experiencia móvil/web centrada en:
- confianza
- claridad operativa
- rapidez de uso
- seguimiento de jugadas
- continuidad de cuenta

## Referencias principales
### Referencia de negocio
- `https://www.loteriamanises.com/`

Esta es la referencia principal para entender:
- alcance del negocio
- lenguaje de marca
- tipos de servicio
- expectativas funcionales reales

### Referencias comparables de experiencia
- `TuLotero`
- `MiLoto`

Estas referencias sirven para calibrar:
- navegación
- sensación de producto maduro
- jerarquía de información
- flujo de juego, tickets, resultados y cuenta

No deben copiarse literalmente. Se usan como benchmark.

## Qué debe transmitir la app
La app debe sentirse:
- fiable
- clara
- ágil
- comercial pero seria
- moderna, sin parecer una demo experimental

No debe sentirse:
- demasiado conceptual
- demasiado “gaming”
- sobrecargada de efectos sin función
- genérica o intercambiable con cualquier template fintech/app mobile

## Núcleo funcional del producto
### Ya contemplado en la dirección del proyecto
- login de usuario
- catálogo de juegos
- selección de jugada
- tickets del usuario
- resultados
- perfil
- saldo

### Capas de producto que deben poder existir
- cuenta
- wallet / movimientos
- favoritos
- abonos
- premios
- cesta / checkout
- contenido de confianza
- lotería para empresas

## Prioridades de UX
1. El usuario debe entender su situación de un vistazo
   - saldo
   - próximas jugadas
   - estado de tickets
   - resultados recientes

2. El flujo principal debe ser corto
   - entrar
   - elegir juego
   - configurar jugada
   - confirmar
   - revisar tickets

3. Debe haber sensación de continuidad
   - no pantallas aisladas
   - no “concept screens”
   - sí producto conectado y operativo

4. La información importante debe tener más peso que la decoración
   - sorteos
   - importes
   - estados
   - fechas
   - acciones principales

## Dirección visual deseada
### Sí
- identidad fuerte y propia
- sensación premium sobria
- componentes reconocibles y consistentes
- foco en confianza y operativa
- jerarquía visual clara
- densidad útil de información

### No
- exceso de glassmorphism por estética
- interfaces que parezcan un dribbble shot
- motion gratuita
- layouts demasiado vacíos
- exceso de ornamento frente a información crítica

## Principios de diseño
- el diseño debe ayudar a vender y gestionar, no solo impresionar
- la marca debe sentirse real y comercial
- el usuario debe saber siempre dónde está y qué puede hacer
- el sistema visual debe ser consistente entre catálogo, jugadas, tickets y perfil
- los estados vacíos, de carga y error importan tanto como las pantallas principales

## Estado actual del proyecto
### Situación actual
- hay una base funcional en React + TypeScript + Firebase
- el login con Firebase ya funciona en local
- la estructura técnica ya fue reorganizada a `app / features / shared`

### Lectura honesta
La base ya no está mal, pero todavía está más cerca de un MVP funcional que de un producto pulido.

## Siguiente fase recomendada
### Fase 1
Refinar la base funcional:
- extraer componentes de dominio
- separar mejor lógica y UI
- consolidar patrones reutilizables

### Fase 2
Entrar en diseño de producto:
- home
- catálogo de juegos
- game play
- tickets
- perfil
- wallet

### Fase 3
Expandir producto:
- favoritos
- abonos
- checkout
- premios
- contenidos corporativos

## Mensaje para cualquier diseñador o modelo externo
Si trabajas sobre este proyecto:
- piensa en `Lotería Manises` como negocio real
- usa `loteriamanises.com` como referencia de alcance
- usa `TuLotero` y `MiLoto` como benchmarks funcionales
- evita tratar la app como una demo visual genérica
- prioriza confianza, claridad y continuidad de producto
