// Catálogo de claims atómicos. El código valida siempre contra estos
// códigos, nunca contra nombres de rol.
export const PERMISSIONS = {
  "torneo:crear": "Crear torneos",
  "torneo:editar": "Editar torneos y sus reglas",
  "equipo:gestionar": "Registrar y editar equipos",
  "jugador:gestionar": "Registrar y editar jugadores y plantillas",
  "sede:gestionar": "Registrar sedes y canchas",
  "calendario:generar": "Generar el fixture de un torneo",
  "partido:programar": "Asignar fecha, hora y cancha a los partidos",
  "partido:registrar-resultado": "Cerrar el acta de un partido",
  "partido:registrar-gol": "Registrar goles",
  "partido:registrar-tarjeta": "Registrar tarjetas",
  "sancion:gestionar": "Anular o modificar sanciones",
  "liga:gestionar-usuarios": "Invitar usuarios y asignar roles en la liga",
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

// Roles globales (tenant_id nulo) que se crean en el seed y se asignan
// a los usuarios de cada liga.
export const BASE_ROLES = {
  Administrador: ALL_PERMISSIONS,
  "Delegado de mesa": [
    "partido:registrar-resultado",
    "partido:registrar-gol",
    "partido:registrar-tarjeta",
  ],
} as const satisfies Record<string, readonly Permission[]>;

export type BaseRoleName = keyof typeof BASE_ROLES;
