// ============================================================================
// WhatsApp (Twilio) — DESHABILITADO para un release futuro.
//
// Toda la implementación está comentada abajo. Para REACTIVARLO:
//   1. Descomenta el bloque de código de abajo.
//   2. Crea la tabla WhatsappMessage en Turso (ver DEPLOY.md §6.1).
//   3. Configura TWILIO_AUTH_TOKEN (y opcional TWILIO_WEBHOOK_URL) en Vercel.
//   4. Apunta el webhook del WhatsApp Sandbox de Twilio a /api/whatsapp (POST).
//
// Mientras está comentado, la ruta no expone handlers y queda inerte.
// ============================================================================

/*
import twilio from "twilio";
import { prisma } from "@/lib/prisma";
import {
  construirConfig,
  mensajesAContents,
  ejecutarConversacion,
} from "@/lib/asistente";

// Prisma usa el adaptador libSQL (Node), así que forzamos runtime Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cuántos mensajes previos del mismo número cargamos como contexto.
const MAX_HISTORY = 20;

// Construye una respuesta TwiML (XML) que Twilio enviará al usuario.
function twimlReply(text) {
  const resp = new twilio.twiml.MessagingResponse();
  if (text) resp.message(text);
  return new Response(resp.toString(), {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

// Twilio entrega los mensajes entrantes por POST (form-urlencoded).
export async function POST(req) {
  // 1. Leer los parámetros del formulario de Twilio.
  let params = {};
  try {
    const form = await req.formData();
    for (const [k, v] of form.entries()) {
      params[k] = typeof v === "string" ? v : "";
    }
  } catch {
    return new Response("Petición inválida", { status: 400 });
  }

  const from = params.From || ""; // p. ej. "whatsapp:+5215512345678"
  const bodyText = (params.Body || "").trim();

  // 2. Validar la firma de Twilio (si hay token configurado).
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (authToken && process.env.TWILIO_VALIDATE !== "false") {
    const signature = req.headers.get("x-twilio-signature") || "";
    const url =
      process.env.TWILIO_WEBHOOK_URL ||
      `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get(
        "host"
      )}/api/whatsapp`;
    const valido = twilio.validateRequest(authToken, signature, url, params);
    if (!valido) {
      return new Response("Firma de Twilio inválida", { status: 403 });
    }
  }

  if (!process.env.GEMINI_API_KEY) {
    return twimlReply("El asistente no está disponible en este momento.");
  }
  if (!from) return new Response("Falta el remitente", { status: 400 });
  if (!bodyText) {
    return twimlReply(
      "Por ahora solo puedo procesar mensajes de texto. ¿En qué te puedo ayudar?"
    );
  }

  try {
    // 3. Cargar el historial reciente de este número (orden cronológico).
    const previos = await prisma.whatsappMessage.findMany({
      where: { phone: from },
      orderBy: { createdAt: "desc" },
      take: MAX_HISTORY,
      select: { role: true, content: true },
    });
    previos.reverse();

    const mensajes = [...previos, { role: "user", content: bodyText }];

    // 4. Generar la respuesta con Gemini (sin streaming, texto completo).
    const config = await construirConfig("whatsapp");
    const contents = mensajesAContents(mensajes);
    let reply = (await ejecutarConversacion(contents, config)).trim();
    if (!reply) {
      reply = "Lo siento, no pude generar una respuesta. ¿Puedes reformular?";
    }

    // 5. Persistir el turno del usuario y el del asistente.
    await prisma.whatsappMessage.create({
      data: { phone: from, role: "user", content: bodyText },
    });
    await prisma.whatsappMessage.create({
      data: { phone: from, role: "assistant", content: reply },
    });

    // 6. Responder a Twilio con TwiML.
    return twimlReply(reply);
  } catch (err) {
    console.error("Error en /api/whatsapp:", err);
    return twimlReply(
      "Ocurrió un error al procesar tu mensaje. Inténtalo de nuevo en un momento."
    );
  }
}

// GET simple para comprobar manualmente que la ruta está viva.
export function GET() {
  return new Response("Webhook de WhatsApp activo.", { status: 200 });
}
*/
