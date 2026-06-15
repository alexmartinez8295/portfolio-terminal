# Despliegue en Vercel (Turso + Vercel Blob)

Esta guía publica el portafolio en **Vercel**, usando **Turso (libSQL)** como base de
datos SQLite gestionada y **Vercel Blob** para las imágenes que se suben desde el panel
admin.

> La fuente de datos local es `prisma/dev.db`. El sitio en producción usa Turso.

---

## 0. Requisitos

- Cuenta de [GitHub](https://github.com) (para subir el repo).
- Cuenta de [Vercel](https://vercel.com).
- Cuenta de [Turso](https://turso.tech) (capa gratuita).
- [Turso CLI](https://docs.turso.tech/cli/installation) instalada.
- (Opcional) [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`.

---

## 1. Crear la base de datos en Turso

```bash
# Instalar la CLI (Linux/macOS)
curl -sSfL https://get.tur.so/install.sh | bash

# Iniciar sesión / registrarse
turso auth signup     # o: turso auth login

# Crear la base
turso db create portfolio

# Obtener la URL de conexión (libsql://...)
turso db show portfolio --url

# Crear un token de autenticación (guárdalo)
turso db tokens create portfolio
```

Apunta los dos valores:

- `TURSO_DATABASE_URL` → `libsql://portfolio-<tu-org>.turso.io`
- `TURSO_AUTH_TOKEN`   → el token recién creado

### Sembrar schema + datos desde tu BD local

Usa el script `scripts/seed-turso.mjs`, que copia el schema **y** los datos actuales
(perfil, proyectos, secciones, posts) desde `prisma/dev.db` a Turso:

```bash
TURSO_DATABASE_URL="libsql://portfolio-<org>.turso.io" \
TURSO_AUTH_TOKEN="<token>" \
node scripts/seed-turso.mjs
```

> **No uses `sqlite3 .dump`**: las versiones recientes de sqlite3 (≥ 3.46) codifican
> los textos con emojis/acentos usando la función `unistr()`, que **Turso no soporta**
> (error `no such function: unistr`). El script usa parámetros vinculados y evita ese
> problema por completo. Es idempotente (`INSERT OR REPLACE`), así que puedes
> re-ejecutarlo sin duplicar datos.

Verificar:

```bash
turso db shell portfolio "SELECT name FROM sqlite_master WHERE type='table';"
turso db shell portfolio "SELECT name, bio FROM Profile;"
```

---

## 2. Crear el almacén de imágenes (Vercel Blob)

1. En el dashboard de Vercel → tu proyecto → **Storage** → **Create Database** → **Blob**.
2. Al conectarlo, Vercel inyecta automáticamente la variable `BLOB_READ_WRITE_TOKEN`
   en los despliegues (no hace falta copiarla a mano).
3. Para probar subidas **en local**, trae el token:
   ```bash
   vercel link        # vincula la carpeta al proyecto de Vercel
   vercel env pull     # crea .env.local con BLOB_READ_WRITE_TOKEN
   ```

> Las imágenes que ya estaban en `public/uploads/` se siguen sirviendo como estáticas.
> Solo las **nuevas** subidas van a Vercel Blob.

---

## 3. Variables de entorno en Vercel

Project → **Settings** → **Environment Variables** (entorno *Production* y *Preview*):

| Variable               | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`         | `file:./prisma/dev.db`  *(dummy; solo para `prisma generate`)* |
| `TURSO_DATABASE_URL`   | `libsql://portfolio-<org>.turso.io`                          |
| `TURSO_AUTH_TOKEN`     | *(token de Turso)*                                           |
| `NEXTAUTH_SECRET`      | *(genera uno: `openssl rand -base64 32`)*                   |
| `NEXTAUTH_URL`         | `https://<tu-dominio>.vercel.app`                            |
| `ADMIN_USERNAME`       | *(usuario del panel admin)*                                 |
| `ADMIN_PASSWORD`       | *(contraseña fuerte)*                                       |
| `BLOB_READ_WRITE_TOKEN`| *(se añade solo al crear el store de Blob)*                 |
| `GEMINI_API_KEY`       | *(clave gratuita del chatbot: https://aistudio.google.com/apikey)* |

> **Chatbot IA:** el asistente flotante usa Google Gemini y lee el contexto
> (perfil, proyectos, blog) desde la misma BD de Turso. Sin `GEMINI_API_KEY` el
> widget responde con un aviso de "no configurado" pero el resto del sitio funciona
> normal. Las cotizaciones que genera se guardan como mensajes en `/admin/contact`.

> **Por qué `DATABASE_URL` es un fichero "dummy":** en producción la app se conecta a
> Turso mediante el adaptador libSQL (`lib/prisma.js`), no por la `datasource`. Pero
> `prisma generate` (que corre en `postinstall`) exige una URL `file:` válida para el
> provider `sqlite`. No se conecta a ella, solo la valida.

---

## 4. Desplegar

**Opción A — Git (recomendada):**

```bash
git add -A
git commit -m "Preparar despliegue (Turso + Vercel Blob)"
git push origin main
```

Luego en Vercel: **Add New → Project → Import** tu repo de GitHub. Detecta Next.js
automáticamente. Pulsa **Deploy**.

**Opción B — Vercel CLI:**

```bash
vercel --prod
```

---

## 5. Comprobaciones post-deploy

- Home carga perfil, proyectos y secciones desde Turso.
- `/login` con `ADMIN_USERNAME` / `ADMIN_PASSWORD` entra al panel.
- En `/admin` puedes crear/editar y **subir una imagen nueva** (se aloja en Blob; la URL
  será `https://<...>.public.blob.vercel-storage.com/...`).
- `/admin` redirige a `/login` si no hay sesión (lo hace `proxy.js`).

---

## Notas técnicas

- **Migraciones futuras**: desarrolla en local contra `prisma/dev.db`
  (`npx prisma migrate dev`), genera el SQL del cambio y aplícalo a Turso:
  ```bash
  npx prisma migrate diff \
    --from-url "file:./prisma/dev.db" \
    --to-schema-datamodel prisma/schema.prisma \
    --script > cambios.sql
  turso db shell portfolio < cambios.sql
  ```
- **Local**: `npm run dev` usa `prisma/dev.db` vía el adaptador (variable
  `TURSO_DATABASE_URL=file:./prisma/dev.db` en `.env`).
- **Secretos**: `.env` está en `.gitignore`; usa `.env.example` como plantilla.
