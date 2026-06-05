import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

// Cliente libSQL/Turso. En local apunta a un fichero (file:./dev.db);
// en producción usa la URL libsql:// de Turso con su auth token.
const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:./prisma/dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const adapter = new PrismaLibSQL(libsql);

// Reutilizamos la instancia en desarrollo para no agotar conexiones
// con el hot-reload de Next.js.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
