// Diagnóstico de conexión a Turso: prueba LECTURA y ESCRITURA.
// Úsalo con las credenciales de PRODUCCIÓN (las que pusiste en Vercel):
//
//   TURSO_DATABASE_URL="libsql://portfolio-<org>.turso.io" \
//   TURSO_AUTH_TOKEN="<token>" \
//   node scripts/test-turso.mjs
//
// La prueba de escritura usa una tabla temporal "_write_test" y la elimina al
// final: NO toca tus datos.
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("❌ Falta TURSO_DATABASE_URL en el entorno.");
  process.exit(1);
}

console.log("→ Conectando a:", url);
if (url.startsWith("file:")) {
  console.warn(
    "⚠️  Esta URL es un fichero LOCAL, no Turso. Para probar producción usa la URL libsql:// de Turso."
  );
}

const db = createClient({ url, authToken });

// 1) Lectura
try {
  const r = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log(
    "✅ Lectura OK. Tablas:",
    r.rows.map((x) => x.name).join(", ") || "(ninguna)"
  );
} catch (e) {
  console.error("❌ Falló la LECTURA:", e.message);
  process.exit(1);
}

// 2) Escritura (no toca tus datos)
try {
  await db.execute("CREATE TABLE IF NOT EXISTS _write_test (id INTEGER)");
  await db.execute("INSERT INTO _write_test (id) VALUES (1)");
  await db.execute("DELETE FROM _write_test");
  await db.execute("DROP TABLE _write_test");
  console.log("✅ Escritura OK. El token y la URL SÍ permiten escribir.");
  console.log(
    "→ Si la app aún no guarda cambios: asegúrate de que Vercel use ESTA misma URL\n" +
      "  y token (Production), y haz un redeploy tras cambiar variables."
  );
} catch (e) {
  console.error("❌ Falló la ESCRITURA:", e.message);
  console.error(
    "→ Tu token es de SOLO LECTURA o la URL no permite escribir.\n" +
      "  Genera un token nuevo con permisos de escritura:\n" +
      "    turso db tokens create <tu-db>      (NO uses --read-only)\n" +
      "  y actualízalo en Vercel (TURSO_AUTH_TOKEN) + redeploy."
  );
  process.exit(1);
}

process.exit(0);
