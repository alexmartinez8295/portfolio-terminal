# Manual Técnico — Portfolio Terminal

Documentación técnica del proyecto: arquitectura, despliegue, decisiones y
cambios realizados para dejar el portafolio **listo para producción**.

- **Proyecto:** `portfolio-terminal` (portafolio personal con estética de terminal sci‑fi)
- **Despliegue:** Vercel + Turso (libSQL) + Vercel Blob
- **Última actualización del manual:** 2026-06-05

---

## 1. Stack tecnológico

| Capa | Tecnología | Versión |
| --- | --- | --- |
| Framework | Next.js (App Router, Turbopack) | 16.2.3 |
| UI | React | 19.2.4 |
| Estilos | Tailwind CSS | 4.2.2 |
| ORM | Prisma | 5.22.0 |
| Base de datos | SQLite vía **Turso / libSQL** | adapter 5.22 · client 0.8.1 |
| Autenticación | NextAuth (Credentials + JWT) | 4.24.14 |
| Almacenamiento de imágenes | Vercel Blob | 2.4.0 |
| Editor de contenido | TipTap / react-markdown | — |

> **Nota sobre Next.js 16:** este proyecto usa Next 16, que trae cambios de
> ruptura respecto a versiones previas (Turbopack por defecto, `params`
> asíncronos, convención `proxy` en lugar de `middleware`). Antes de tocar
> código, conviene leer las guías en `node_modules/next/dist/docs/`.

---

## 2. Arquitectura de despliegue

```
                          ┌──────────────────────────┐
   Navegador  ──HTTPS──▶  │        Vercel            │
                          │  (Next.js 16 SSR/Serverless)
                          └──────────┬───────────────┘
                                     │
                 ┌───────────────────┼────────────────────┐
                 ▼                   ▼                    ▼
        ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐
        │  Turso (libSQL)│  │  Vercel Blob    │  │  /public/uploads │
        │  Base de datos │  │  Imágenes nuevas│  │  Imágenes previas│
        │  (SQLite mgst.)│  │  (CDN)          │  │  (estáticas)     │
        └────────────────┘  └─────────────────┘  └──────────────────┘
```

- **Turso** aloja la base SQLite. La app se conecta en runtime mediante el
  **driver adapter** de Prisma (`@prisma/adapter-libsql`).
- **Vercel Blob** almacena las imágenes subidas desde el panel admin en
  producción (el sistema de archivos de Vercel es efímero/solo lectura).
- Las imágenes **ya existentes** en `public/uploads/` siguen sirviéndose como
  archivos estáticos.

---

## 3. Modelo de datos (Prisma)

Definido en `prisma/schema.prisma`. Provider `sqlite`, con `previewFeatures = ["driverAdapters"]`.

| Modelo | Descripción |
| --- | --- |
| `Profile` | Perfil principal (nombre, bio, about, imagen) |
| `HomeSection` | Secciones dinámicas del home (carrusel), con orden y alineación |
| `Project` | Proyectos / experiencia |
| `Post` | Entradas del blog |
| `Comment` | Comentarios de un post |
| `ContactMessage` | Mensajes del formulario de contacto |

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

> ⚠️ **Dato importante descubierto durante el proyecto:** los datos reales viven
> en **`prisma/dev.db`** (Prisma resuelve `file:./dev.db` relativo a la carpeta
> del schema). Había un `dev.db` vacío y obsoleto en la raíz que se eliminó.

---

## 4. Conexión a la base de datos

`lib/prisma.js` crea un cliente libSQL y lo envuelve con el adaptador de Prisma.
Usa un *singleton* en desarrollo para no agotar conexiones con el hot-reload.

```js
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:./prisma/dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const adapter = new PrismaLibSQL(libsql);
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

**Detalle de rutas (gotcha):** el Prisma CLI resuelve la ruta SQLite relativa a
`/prisma`, mientras que el adaptador libSQL la resuelve relativa al *cwd* (raíz).
Por eso en local conviven dos valores apuntando al mismo archivo:

- `DATABASE_URL="file:./dev.db"` → CLI → `prisma/dev.db`
- `TURSO_DATABASE_URL="file:./prisma/dev.db"` → runtime → `prisma/dev.db`

---

## 5. Migración de datos a Turso

Se creó el script **`scripts/seed-turso.mjs`**, que copia schema + datos desde
`prisma/dev.db` a Turso usando **parámetros vinculados**.

> **Por qué no `sqlite3 .dump`:** las versiones de sqlite3 ≥ 3.46 codifican los
> textos con emojis/acentos usando la función `unistr()`, **no soportada por
> libSQL** (`Error: no such function: unistr`). El script evita el problema por
> completo y es idempotente (`INSERT OR REPLACE`).

**Uso:**

```bash
# 1) Crear la base en Turso
turso db create portfolio
turso db show portfolio --url        # → libsql://portfolio-<org>.turso.io
turso db tokens create portfolio     # → token

# 2) Migrar datos (variables inline, NO en .env)
export TURSO_DATABASE_URL="libsql://portfolio-<org>.turso.io"
export TURSO_AUTH_TOKEN="<token>"
node scripts/seed-turso.mjs
```

**Migraciones futuras de schema** (sin perder datos):

```bash
npx prisma migrate dev            # desarrolla contra prisma/dev.db en local
npx prisma migrate diff \
  --from-url "file:./prisma/dev.db" \
  --to-schema-datamodel prisma/schema.prisma \
  --script > cambios.sql
turso db shell portfolio < cambios.sql
```

---

## 6. Subida de imágenes (Vercel Blob)

`app/api/upload/route.js` usa `put()` de `@vercel/blob`:

```js
import { put } from "@vercel/blob";
export const runtime = "nodejs";

export async function POST(req) {
  const data = await req.formData();
  const file = data.get("file");
  if (!file) return new Response("No file", { status: 400 });

  const fileName = `${Date.now()}-${file.name}`;
  const blob = await put(`uploads/${fileName}`, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return Response.json({ url: blob.url });
}
```

- El token `BLOB_READ_WRITE_TOKEN` se **inyecta automáticamente** en Vercel al
  conectar un store de Blob (Storage → Create → Blob).
- En local se obtiene con `vercel env pull`.
- `next.config.ts` autoriza el dominio del CDN para `next/image`:

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
  ],
}
```

---

## 7. Autenticación y seguridad

- **NextAuth** con proveedor *Credentials* y estrategia JWT
  (`app/api/auth/[...nextauth]/route.js`).
- Credenciales del admin movidas a variables de entorno
  (`ADMIN_USERNAME` / `ADMIN_PASSWORD`) — antes estaban hardcodeadas.
- `NEXTAUTH_SECRET` debe ser un valor aleatorio fuerte
  (`openssl rand -base64 32`).
- Las rutas `/admin/**` se protegen mediante **`proxy.js`** (ver §8): redirige a
  `/login` si no hay sesión.

```js
// authorize() — núcleo de la validación
const adminUser = process.env.ADMIN_USERNAME;
const adminPass = process.env.ADMIN_PASSWORD;
if (adminUser && adminPass &&
    credentials.username === adminUser &&
    credentials.password === adminPass) {
  return { id: "1", name: "Admin" };
}
return null;
```

> 🔒 Si un login falla con "credenciales incorrectas" en producción, revisar en
> este orden: (1) ¿se hizo **Redeploy** tras añadir las variables?, (2)
> `NEXTAUTH_URL` coincide con el dominio actual, (3) valores sin comillas ni
> espacios, (4) `NEXTAUTH_SECRET` definido.

---

## 8. Cambios por compatibilidad con Next.js 16

| Cambio | Detalle |
| --- | --- |
| `middleware` → `proxy` | `middleware.js` renombrado a `proxy.js`; la función exportada ahora se llama `proxy`. La convención `middleware` quedó deprecada. |
| `params` asíncronos | Las rutas dinámicas (`[id]`) ya usaban `await params` correctamente. |
| Turbopack por defecto | `next build` usa Turbopack; no hay configuración de webpack que migrar. |
| Tipos en `layout.tsx` | Se tipó `children` como `Readonly<{ children: React.ReactNode }>` (el `strict` de TS rompía el build). |
| Tipos en `page.tsx` | Se tiparon los `useState` (`Profile`, `Project[]`, `HomeSection[]`) y parámetros implícitos. |

`proxy.js`:

```js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (req.nextUrl.pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
```

---

## 9. Mejoras responsive (móvil / iPad)

Breakpoints: `sm` ≥640px · `md` ≥768px (iPad vertical) · `lg` ≥1024px (iPad horizontal / desktop).

| Componente | Mejora |
| --- | --- |
| **Home — Hero** | Cambia a fila en `lg` (antes `md`): apilado en iPad vertical. Foto de perfil escalable `w-64 → sm:w-80 → lg:w-96` (antes `md:w-150` = 600px, se desbordaba). |
| **Home — Secciones** | Panel e imagen cambian a fila en `lg`; padding reducido en móvil. |
| **Home — Carrusel** | Flechas dejan de usar `-translate-x-16` (quedaban fuera de pantalla). |
| **Home — Proyectos** | Título y tracking reducidos en móvil; grid `1 → sm:2 → lg:3`. |
| **Navbar** | Menos padding/tracking en móvil para que los 4 enlaces quepan en <375px. |
| **Terminal** | `text-xs` y padding menor en móvil (el arte ASCII no se rompe). |
| **Footer** | Columnas `1 → sm:2 → md:4`; márgenes verticales reducidos. |
| **Blog / Experiencia / Contacto** | Títulos legibles, espaciados corregidos, formulario con campos táctiles `p-3 text-base` (evita el zoom de iOS). |
| **Layout** | Padding lateral `p-4` en móvil, `p-7` en desktop. |

### 9.1 Fix del carrusel (título tapado + desborde)

Dos problemas resueltos en el carrusel de secciones del home:

1. **Título "MI_EXPERIENCIA" tapado en móvil:** las slides eran `absolute`
   dentro de un contenedor con `min-h-[450px]` fijo; en móvil (slides apiladas)
   el contenido desbordaba y cubría el título de la sección siguiente.
2. **Carrusel más ancho que el resto:** al pasar a grid, la columna implícita se
   dimensionaba al contenido (*grid blowout*).

**Solución:** convertir las slides en un **grid de una celda compartida**:

```jsx
<div className="grid grid-cols-1 w-full">
  {sections.map((section, index) => (
    <div className={`[grid-area:1/1] w-full min-w-0 transition-all ...`}>
      ...
    </div>
  ))}
</div>
```

- `[grid-area:1/1]` → todas las slides en la misma celda; el contenedor crece
  con la slide más alta (sin desbordes verticales).
- `grid-cols-1` (= `minmax(0, 1fr)`) + `min-w-0` → impiden el desborde
  horizontal.

---

## 10. Componente Terminal — comando `kari`

`components/Terminal.jsx` incluye un comando *easter egg* `kari`:

1. Muestra un mensaje con **efecto de tecleo** (reutiliza `typeText`).
2. Al terminar, indica *"Presiona ENTER para cerrar el mensaje"*.
3. El siguiente **Enter limpia la consola** (estado `pendingClear`).

El texto se edita en la constante `KARI_MESSAGE` al inicio del archivo. El
comando es secreto (no aparece en la ayuda del comando `hola`).

Otros comandos del terminal: `hola`, `info`, `experiencia`, `blog`, `contacto`,
`clear`.

---

## 11. Otros cambios

- **Título de la pestaña:** definido con `export const metadata` en
  `app/layout.tsx` → `"AlxDev!"`.
- **Limpieza:** eliminado `postcss.config.mjs` duplicado y `dev.db` obsoleto de
  la raíz.
- **`package.json`:** añadido `"postinstall": "prisma generate"` (necesario para
  que Vercel genere el cliente Prisma en cada build).

---

## 12. Variables de entorno

| Variable | Local (`.env`) | Vercel (producción) | Para qué |
| --- | --- | --- | --- |
| `DATABASE_URL` | `file:./dev.db` | `file:./prisma/dev.db` (dummy) | Prisma CLI (`generate`/`migrate`) |
| `TURSO_DATABASE_URL` | `file:./prisma/dev.db` | `libsql://...turso.io` | Conexión runtime (adaptador) |
| `TURSO_AUTH_TOKEN` | *(vacío)* | *(token de Turso)* | Auth de Turso |
| `NEXTAUTH_SECRET` | aleatorio | aleatorio | Firma de sesiones JWT |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://<dominio>.vercel.app` | Callbacks de NextAuth |
| `ADMIN_USERNAME` | a elección | a elección | Usuario del panel admin |
| `ADMIN_PASSWORD` | a elección | fuerte | Contraseña del panel admin |
| `BLOB_READ_WRITE_TOKEN` | `vercel env pull` | *(auto al crear el store)* | Subida a Vercel Blob |

> `.env` está en `.gitignore`; `.env.example` es la plantilla versionada.
> `DATABASE_URL` en Vercel es un valor `file:` "dummy" porque `prisma generate`
> exige una URL válida del provider `sqlite`, aunque en runtime la conexión real
> use el adaptador libSQL.

---

## 13. Flujos de trabajo

### Desarrollo local

```bash
npm install
npx prisma generate
npm run dev            # http://localhost:3000  (usa prisma/dev.db)
```

### Build de producción (verificación local)

```bash
npm run build
npm run start
```

### Despliegue

1. `git push origin main` → Vercel redespliega automáticamente.
2. Tras cambiar variables de entorno: **Deployments → ⋯ → Redeploy**
   (las variables solo aplican a builds nuevos).

Ver la guía paso a paso completa en **`DEPLOY.md`**.

---

## 14. Estructura del proyecto (resumen)

```
portfolio-terminal/
├── app/
│   ├── admin/            # Panel de administración (protegido)
│   ├── api/              # Route Handlers (profile, projects, posts, contact, upload, auth)
│   ├── blog/ experiencia/ contacto/ login/
│   ├── layout.tsx        # Layout raíz + metadata (título de pestaña)
│   └── page.tsx          # Home (hero, carrusel de secciones, proyectos)
├── components/           # Navbar, Footer, Terminal, Background, Editor, ...
├── lib/prisma.js         # Cliente Prisma + adaptador libSQL
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── dev.db            # Base local (semilla para Turso)
├── public/uploads/       # Imágenes previas (estáticas)
├── scripts/seed-turso.mjs# Migración de datos a Turso
├── proxy.js              # Protección de rutas /admin (ex middleware)
├── next.config.ts        # remotePatterns para Vercel Blob
├── DEPLOY.md             # Guía de despliegue
└── MANUAL_TECNICO.md     # Este documento
```

---

## 15. Solución de problemas (FAQ)

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| `no such function: unistr` al migrar | `sqlite3 .dump` con emojis | Usar `scripts/seed-turso.mjs` |
| `no such table: Profile` en runtime | Ruta SQLite apuntando al `dev.db` vacío | `TURSO_DATABASE_URL=file:./prisma/dev.db` |
| Login "credenciales incorrectas" en prod | Variables no redeployadas o `NEXTAUTH_URL` incorrecta | Revisar §7 y hacer Redeploy |
| Imágenes nuevas no se guardan | Store de Blob no creado | Storage → Create → Blob |
| Build falla por tipos TS | `noImplicitAny` / `children` sin tipar | Tipar como en §8 |
| `Cannot add <x>.vercel.app` | Subdominio global ya ocupado | Elegir otro subdominio |

---

*Documento generado como referencia técnica del proyecto. Mantener actualizado
ante cambios de arquitectura o despliegue.*
