import { put } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(req) {
  const data = await req.formData();
  const file = data.get("file");

  if (!file) {
    return new Response("No file", { status: 400 });
  }

  // Nombre único para evitar colisiones, conservando el original.
  const fileName = `${Date.now()}-${file.name}`;

  // Sube a Vercel Blob. El token (BLOB_READ_WRITE_TOKEN) se inyecta
  // automáticamente en Vercel; en local hay que traerlo con `vercel env pull`.
  const blob = await put(`uploads/${fileName}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return Response.json({
    url: blob.url, // URL pública del CDN de Vercel Blob
  });
}
