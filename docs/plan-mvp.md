# LIGA TRACKER: definición del MVP y plan de desarrollo

Basado en tus documentos: *Historias de Usuario*, *LigaTracker* (RF/RNF), *Estándares* (guía visual) y el modelo *DBML*.
Supuesto de dedicación: **8–10 horas por semana**, una persona.

---

## 1. Diagnóstico rápido

Tu documentación está muy completa: un modelo de datos serio, RBAC por claims, multitenencia y una guía visual. El riesgo no está en la calidad, sino en el **tamaño**. Son 9 módulos, unos 35 requisitos funcionales y tres clientes (web, API y Flutter). A tiempo parcial, construir todo eso llevaría más de un año antes de que alguien lo use.

El MVP debe responder una sola pregunta: **¿un organizador real usaría (y pagaría) LIGA TRACKER para llevar su torneo en lugar de Excel + WhatsApp?**

### Inconsistencias que conviene resolver antes de programar

| # | Dónde | Problema | Propuesta |
|---|-------|----------|-----------|
| 1 | LigaTracker.odt | El stack dice **backend en Go**, pero los RNF (SEG-02, SEG-03, REN-03, MAN-01, MAN-02) hablan de **NestJS**. Además, Prisma no tiene cliente oficial para Go (el cliente comunitario dejó de mantenerse). | Elegir **TypeScript de punta a punta** (ver sección 3). |
| 2 | LigaTracker.odt | Hay tres clientes (Next.js, PWA y Flutter). | Para el MVP basta con la **PWA en Next.js**. Flutter queda para más adelante, si hace falta. |
| 3 | LigaTracker.odt | RF-00.0 y RF-29 aparecen dos veces. | Renumerar. |
| 4 | Estándares.docx | "Éxito/Victorias/Solvencia" dice verde, pero el valor es `#3B82F6` (azul). | Usar un verde (por ejemplo `#22C55E`) o el primario `#10B981`, y dejar el azul como *info*. |
| 5 | Estándares.docx | El portal público muestra "líder de asistencias", pero el modelo no registra asistencias. | Agregar `assist_squad_id` a `match_goals` o quitarlo del portal. |

### Ajustes al modelo DBML

1. **`deleted_by` y `updated_by` como `not null`**: así es imposible crear un registro. Deben ser *nullable*.
2. **Tablas hijas sin `tenant_id`** (`squads`, `matches`, `match_goals`, `match_cards`, `tournament_rounds`, `pitches`, etc.): RLS (RNF-SEG-01) necesita el `tenant_id` en cada tabla para filtrar sin joins. Hay que agregarlo de forma desnormalizada a todas las tablas con datos de liga.
3. **`tenants`**: le faltan `logo_url` y `plan_id`, y no existe la tabla `subscription_plans` (HU-1.2, RF-00.2). Para el MVP no es necesaria (ver alcance).
4. **`tournament_rules`**: faltan puntos por victoria/empate/derrota, marcador de W.O. (RF-14), mínimo y máximo de jugadores por plantilla (RF-08), orden de criterios de desempate (RF-24) y equipos de liguilla (4 u 8).
5. **`matches`**: falta un `check (home_team_id <> away_team_id)`. Conviene añadir `is_public`/`published_at` y `winner_team_id` para W.O. y eliminatorias.
6. **`match_goals.team_id`** es redundante con `squad_id` (y puede quedar inconsistente). Basta con `squad_id` + `is_own_goal`.
7. **`tenant_users`** permite un solo rol por usuario y liga. Si una persona puede ser *Representante* y *Árbitro*, hace falta una tabla `tenant_user_roles`.
8. **`players.document_number`**: RF-08 lo hace obligatorio y HU-3.2 lo hace opcional para menores. Hay que decidirlo. El índice único con `NULL` funciona bien en Postgres.
9. **Auditoría (HU-7.3)**: `created_by/updated_by` no guarda el historial de cambios. Más adelante conviene una tabla `audit_log` (entidad, id, acción, antes/después, usuario, fecha).
10. **Partidos de vuelta y eliminatorias**: falta enlazar ida y vuelta (`leg`, `tie_id`) para calcular el marcador global (RF-04).

---

## 2. Definición del MVP

**Objetivo:** que un organizador lleve **un torneo de fase regular completo** en LIGA TRACKER, y que jugadores y aficionados consulten la tabla, los resultados y los goleadores en una página pública que se comparte por WhatsApp.

**Criterio de éxito:** **3 ligas reales** usándolo durante una temporada y **al menos 1 dispuesta a pagar**.

### Dentro del MVP

| Área | Alcance | Origen |
|------|---------|--------|
| Cuentas y ligas | Login con email y contraseña. **Tú** creas cada liga (tenant) y su administrador desde un panel simple de súper admin. Slug para la URL. | RF-00.0, RF-00.1, HU-1.1 |
| Roles | Roles fijos (*Administrador*, *Delegado de mesa*) que por dentro ya usan claims (`partido:registrar-gol`). Todo se filtra por `tenant_id`. | HU-1.4 (parcial) |
| Torneo | Nombre, categoría, rama, estado, máximo de equipos y reglas: Fútbol-N, duración, puntos y marcador de W.O. | RF-01, RF-02, HU-2.1, HU-2.2 |
| Sedes | Sedes y canchas (nombre, iluminación). | RF-12, HU-4.1 |
| Equipos y jugadores | Equipo (nombre, escudo, color, representante como dato de contacto). Jugador (nombre, foto, documento, fecha de nacimiento). Inscripción al torneo y plantilla con dorsal y posición. | RF-07, RF-08, HU-3.1 a HU-3.4 |
| Calendario | Botón "Generar fixture": todos contra todos (round robin) con vuelta espejo opcional. Asignación manual de fecha, hora y cancha, con aviso de choque de horario. | RF-11, RF-13 (parcial), HU-4.2, HU-4.3 |
| Resultados | Marcador final, goles (jugador, minuto, penal o autogol) y tarjetas (tipo, minuto, motivo). Estados: Programado, Finalizado, Suspendido y W.O. con marcador automático. | RF-14, RF-15, HU-5.2, HU-5.3, HU-5.5 |
| Sanciones básicas | Regla simple por torneo (N amarillas = 1 partido, roja = N partidos). Suspensión automática y lista de suspendidos por jornada. El admin puede anularla. | RF-21, RF-23 (parcial), HU-6.1 a HU-6.3 |
| Tablas | Tabla de posiciones con desempate DG, GF y duelo directo. Goleadores Top 10 y valla menos vencida. | RF-18, RF-19, RF-24 |
| Portal público | `ligatracker.app/{liga}/{torneo}`: tabla, jornadas y resultados, goleadores y suspendidos. Vista previa (Open Graph) para WhatsApp. | Pantalla 6 |
| UX | PWA instalable, modo claro/oscuro y tu guía visual (Inter, tabular-nums, tablas de 48px). | RNF-PWA-01, RNF-PWA-04, Estándares |
| Operación | Docker, variables de entorno, `prisma migrate` en el despliegue y backups diarios de Postgres. | RNF-DES-01 a 03 |

### Fuera del MVP (y por qué)

| Se pospone | Motivo |
|------------|--------|
| Planes, suscripciones y facturación automática (HU-1.2, HU-1.3) | Con 3 ligas, cobras por transferencia y suspendes a mano. Primero hay que demostrar que pagan. |
| Liguilla y eliminatorias (RF-03, RF-04) | Es la primera ampliación (v1.1), porque casi todos los torneos terminan así. Se deja fuera para llegar antes a un piloto. |
| Finanzas, fianzas y estado de cuenta (Módulo 7) | Valioso, pero no impide llevar el torneo. Va en v1.2. |
| Árbitros, terna y liquidación (RF-17, RF-29) | En el MVP, el "delegado de mesa" carga el acta. |
| Checklist pre-partido (RF-16) y sustituciones (HU-5.4) | Poco valor para validar. |
| Pizarra táctica y exportar alineación (RF-10) | Es la función más costosa. Encaja como gancho del plan Pro más adelante. |
| Live Match Tracker con cronómetro | En el MVP alcanza con el acta al final del partido. |
| Premios (RF-05, RF-06), histórico (RF-29/30) y métricas globales (RF-20) | Se derivan de los datos que ya registra el MVP, así que pueden añadirse después sin rehacer nada. |
| Notificaciones push (RNF-PWA-03, RF-31) | El portal compartido por WhatsApp cumple esa función al inicio. |
| App Flutter, OIDC y RLS en Postgres | Ver sección 3. RLS entra como endurecimiento antes de abrir el registro a terceros. |

---

## 3. Arquitectura recomendada para el MVP

**Recomendación: monorepo TypeScript, empezando con una sola aplicación.**

- **Next.js** (App Router) para el panel, el portal público y la API (route handlers / server actions).
- **Prisma + PostgreSQL**, con una *Prisma Client extension* que inyecta `tenant_id` en todas las consultas, más tests que verifican que no hay fugas entre ligas.
- **Lógica de dominio en un paquete aparte** (`packages/domain`: fixture, tabla, desempates, sanciones), con funciones puras y tests unitarios. Es el corazón del producto y no depende del framework.
- **Auth**: Auth.js (credenciales) o JWT propio con claims `{userId, tenantId, permissions}`. OIDC se añade después.
- **Turborepo** desde el inicio (RNF-MAN-01), aunque al principio solo tenga `apps/web` y `packages/domain`.

**Cuándo separar NestJS:** cuando llegue Flutter u otro cliente externo. Como la lógica ya vive en `packages/domain`, extraer `apps/api` con NestJS + OpenAPI (RNF-MAN-02) es mover código, no reescribirlo.

**Por qué no Go:** sumaría un segundo lenguaje y un ORM distinto. Prisma no tiene soporte para Go y tus RNF ya están escritos pensando en NestJS. Si prefieres Go por aprendizaje, la alternativa coherente es Go + sqlc o GORM + migraciones con Atlas o golang-migrate, sin Prisma.

**Infraestructura (aprovecha tu experiencia):** un VPS pequeño (unos 5–7 USD/mes) con Docker Compose (Next.js, Postgres y Caddy para HTTPS), backups con `pg_dump` a un almacenamiento externo y CI en GitHub Actions (lint, tests, build y deploy). Las fotos y escudos van a un almacenamiento compatible con S3 (Cloudflare R2 tiene capa gratuita).

---

## 4. Plan de desarrollo

Sprints de 2 semanas (unas 16–20 h cada uno). Total hasta el piloto: **unas 14 semanas**.

### Fase 0: preparación (semanas 1–2)
- Decidir el stack (sección 3) y corregir el DBML (sección 1).
- Pasar el DBML al `schema.prisma` del MVP (solo las tablas del alcance).
- Repo, Turborepo, ESLint/Prettier, Docker Compose local y CI básico.
- Desplegar un "hola mundo" en el VPS con HTTPS.
- **En paralelo:** hablar con 5–10 organizadores y conseguir **1 liga piloto** comprometida.

### Sprint 1: base multitenant (semanas 3–4)
- Login, sesión con claims, súper admin que crea ligas y su admin.
- Extensión de Prisma con `tenant_id` y tests de aislamiento.
- Layout del panel con tu guía visual y tema claro/oscuro.

### Sprint 2: torneo, sedes, equipos y jugadores (semanas 5–6)
- CRUD de torneo y reglas, sedes y canchas.
- Equipos, jugadores (con subida de foto), inscripción al torneo y plantilla con dorsal y posición.
- Validaciones: dorsal único, documento único por liga, mínimo y máximo de jugadores.

### Sprint 3: calendario (semanas 7–8)
- `domain/fixture`: round robin (método del círculo) con *bye* para número impar y vuelta espejo. Tests unitarios.
- Pantalla de jornadas y asignación de fecha, hora y cancha, con detección de choques.

### Sprint 4: acta y sanciones (semanas 9–10)
- Pantalla de resultado móvil-first: marcador, goles y tarjetas. W.O. con marcador automático.
- `domain/sanctions`: generación automática de suspensiones, cumplimiento por jornada y anulación manual.
- Aviso de "jugador suspendido" al cargar el acta.

### Sprint 5: tablas y portal público (semanas 11–12)
- `domain/standings`: tabla con desempates (DG, GF, duelo directo), goleadores y valla menos vencida.
- Portal público por liga y torneo, con imagen Open Graph dinámica para WhatsApp.
- PWA (manifest + service worker), backups y monitoreo básico (uptime + logs).

### Sprint 6: piloto (semanas 13–14)
- Cargar con la liga piloto un torneo real y acompañar las primeras jornadas.
- Corregir lo que salga y medir: ¿cuánto tarda en cargar una jornada? ¿Comparten el enlace?
- Definir el precio y ofrecer el plan de pago a la segunda temporada.

### Después del MVP (en el orden que pida el piloto)
- **v1.1:** liguilla y eliminatorias ida/vuelta con marcador global y penales (RF-03, RF-04). Premios y Fair Play (RF-05, RF-06, RF-24 completo).
- **v1.2:** finanzas (inscripción, fianza, Solvente/Moroso, bloqueo por morosidad) y árbitros con liquidación (Módulo 7, RF-17, RF-29).
- **v1.3:** planes, límites por plan y registro de ligas por su cuenta (self-signup), cobro con pasarela. RLS en Postgres y `audit_log`.
- **v2:** pizarra táctica con exportación de imagen (plan Pro), Live Match Tracker, notificaciones push, histórico de equipos y jugadores, y API NestJS + Flutter si hay demanda.

---

## 5. Mapa de tus historias de usuario

| HU | MVP | v1.1 | v1.2 | v1.3+ |
|----|:---:|:----:|:----:|:-----:|
| 1.1 Registrar ligas | ✔ (manual) | | | self-signup |
| 1.2 Planes | | | | ✔ |
| 1.3 Facturación SaaS | | | | ✔ |
| 1.4 RBAC multitenant | ✔ (roles fijos) | | | roles editables |
| 2.1 Crear torneo | ✔ | | | |
| 2.2 Reglas | ✔ (fase regular) | liguilla/eliminatoria | | |
| 2.3 Premios | | ✔ | | |
| 2.4 Checklist | | | | ✔ |
| 3.1–3.4 Equipos, jugadores, plantilla | ✔ | | | |
| 4.1 Sedes | ✔ | | | |
| 4.2–4.3 Jornadas y partidos | ✔ | | | |
| 4.4 Árbitros | | | ✔ | |
| 5.1 Checklist pre-partido | | | | ✔ |
| 5.2–5.3 Goles y tarjetas | ✔ | | | |
| 5.4 Sustituciones | | | | ✔ |
| 5.5 Cierre de acta | ✔ | penales | | |
| 6.1–6.3 Sanciones | ✔ (básico) | multas redimibles | | |
| 7.1–7.2 Finanzas | | | ✔ | |
| 7.3 Auditoría | (created_by) | | | audit_log |

---

## 6. Próximos pasos inmediatos
1. Decidir el stack (recomendado: TypeScript con Next.js + Prisma, NestJS más adelante).
2. Aprobar el alcance del MVP (o mover cosas entre "dentro" y "fuera").
3. Conseguir la liga piloto.
4. Después: escribir el `schema.prisma` del MVP con las correcciones y crear el repositorio.
