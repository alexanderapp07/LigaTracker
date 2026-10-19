import { Prisma, type PrismaClient } from "@prisma/client";

// Modelos con columna tenantId. Role queda fuera porque mezcla roles
// globales (tenantId nulo) con roles propios de la liga.
export const TENANT_SCOPED_MODELS: ReadonlySet<string> = new Set(
  Prisma.dmmf.datamodel.models
    .filter((m) => m.name !== "Role" && m.fields.some((f) => f.name === "tenantId"))
    .map((m) => m.name),
);

export class TenantScopeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantScopeError";
  }
}

const WHERE_OPERATIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "update",
  "updateMany",
  "updateManyAndReturn",
  "delete",
  "deleteMany",
  "count",
  "aggregate",
  "groupBy",
]);

type Data = Record<string, unknown>;

function isRelationWrite(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    ("connect" in value || "create" in value || "connectOrCreate" in value)
  );
}

function connectedTenantId(tenant: unknown): unknown {
  return (tenant as { connect?: { id?: unknown } } | undefined)?.connect?.id;
}

// Acepta datos que ya traen la liga (escalar o `tenant: { connect }`) solo si
// coincide con la del contexto; si no la traen, la agrega.
function withTenant(data: Data, tenantId: string): Data {
  if (data.tenantId !== undefined && data.tenantId !== tenantId) {
    throw new TenantScopeError("No se puede escribir en otra liga");
  }
  if (data.tenant !== undefined) {
    if (connectedTenantId(data.tenant) !== tenantId) {
      throw new TenantScopeError("No se puede escribir en otra liga");
    }
    return data;
  }
  // Prisma no permite mezclar FKs escalares con relaciones anidadas en el mismo
  // `data`, así que la liga se asigna con la misma forma que usa el resto.
  if (Object.values(data).some(isRelationWrite)) {
    return { ...data, tenant: { connect: { id: tenantId } } };
  }
  return { ...data, tenantId };
}

function assertNoTenantChange(data: unknown, tenantId: string) {
  if (typeof data !== "object" || data === null) return;
  const { tenantId: value, tenant } = data as Data;
  if ((value !== undefined && value !== tenantId) || (tenant !== undefined && connectedTenantId(tenant) !== tenantId)) {
    throw new TenantScopeError("No se puede mover un registro a otra liga");
  }
}

/**
 * Devuelve un cliente que solo ve y escribe datos de `tenantId`.
 *
 * Cubre las operaciones de primer nivel. Las escrituras anidadas (create
 * dentro de create) no se filtran: usa FKs escalares en el código de la app.
 * El aislamiento definitivo llegará con RLS en PostgreSQL (v1.3).
 */
export function forTenant(client: PrismaClient, tenantId: string) {
  return client.$extends({
    name: "tenant-scope",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!TENANT_SCOPED_MODELS.has(model)) return query(args);

          const a = { ...(args as Data) };

          if (operation === "create") {
            a.data = withTenant(a.data as Data, tenantId);
          } else if (operation === "createMany" || operation === "createManyAndReturn") {
            a.data = Array.isArray(a.data)
              ? (a.data as Data[]).map((d) => withTenant(d, tenantId))
              : withTenant(a.data as Data, tenantId);
          } else if (operation === "upsert") {
            a.where = { ...(a.where as Data), tenantId };
            a.create = withTenant(a.create as Data, tenantId);
            assertNoTenantChange(a.update, tenantId);
          } else if (WHERE_OPERATIONS.has(operation)) {
            a.where = { ...((a.where as Data | undefined) ?? {}), tenantId };
            if (operation.startsWith("update")) assertNoTenantChange(a.data, tenantId);
          }

          return query(a as typeof args);
        },
      },
    },
  });
}

export type TenantClient = ReturnType<typeof forTenant>;
