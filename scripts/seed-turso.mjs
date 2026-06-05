// Copia el schema y los datos de la BD local (prisma/dev.db) a Turso.
//
// Uso:
//   TURSO_DATABASE_URL="libsql://<db>.turso.io" \
//   TURSO_AUTH_TOKEN="<token>" \
//   node scripts/seed-turso.mjs
//
// Es robusto frente a emojis/acentos: usa parámetros vinculados en lugar de
// volcados SQL de texto (que con sqlite3 >= 3.46 usan unistr(), no soportado
// por libSQL).

import { createClient } from "@libsql/client";

const SOURCE_URL = "file:./prisma/dev.db";
const targetUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!targetUrl || targetUrl.startsWith("file:")) {
  console.error(
    "✗ Define TURSO_DATABASE_URL con la URL libsql:// de Turso (no un fichero local)."
  );
  process.exit(1);
}
if (!authToken) {
  console.error("✗ Define TURSO_AUTH_TOKEN con el token de Turso.");
  process.exit(1);
}

const source = createClient({ url: SOURCE_URL });
const target = createClient({ url: targetUrl, authToken });

// Orden con padres antes que hijos (Comment depende de Post).
const TABLE_ORDER = [
  "Profile",
  "Project",
  "Post",
  "Comment",
  "HomeSection",
  "ContactMessage",
  "_prisma_migrations",
];

async function main() {
  // 1) Recrear schema (CREATE TABLE / INDEX) tal cual está en local.
  const ddl = await source.execute(
    `SELECT sql FROM sqlite_master
     WHERE sql IS NOT NULL
       AND name NOT LIKE 'sqlite_%'
     ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END`
  );

  for (const row of ddl.rows) {
    const sql = row.sql.replace(/^CREATE TABLE /i, "CREATE TABLE IF NOT EXISTS ")
      .replace(/^CREATE INDEX /i, "CREATE INDEX IF NOT EXISTS ")
      .replace(/^CREATE UNIQUE INDEX /i, "CREATE UNIQUE INDEX IF NOT EXISTS ");
    await target.execute(sql);
  }
  console.log("✓ Schema creado en Turso");

  // 2) Copiar datos tabla por tabla.
  const tablesRes = await source.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
  );
  const present = new Set(tablesRes.rows.map((r) => r.name));
  const ordered = [
    ...TABLE_ORDER.filter((t) => present.has(t)),
    ...[...present].filter((t) => !TABLE_ORDER.includes(t)),
  ];

  for (const table of ordered) {
    const data = await source.execute(`SELECT * FROM "${table}"`);
    if (data.rows.length === 0) {
      console.log(`  ${table}: 0 filas (omitida)`);
      continue;
    }
    const cols = data.columns;
    const colList = cols.map((c) => `"${c}"`).join(", ");
    const placeholders = cols.map(() => "?").join(", ");
    const insert = `INSERT OR REPLACE INTO "${table}" (${colList}) VALUES (${placeholders})`;

    const batch = data.rows.map((row) => ({
      sql: insert,
      args: cols.map((c) => row[c]),
    }));
    await target.batch(batch, "write");
    console.log(`  ${table}: ${data.rows.length} filas copiadas`);
  }

  console.log("✓ Migración a Turso completada");
}

main()
  .catch((err) => {
    console.error("✗ Error:", err.message);
    process.exit(1);
  })
  .finally(() => {
    source.close();
    target.close();
  });
