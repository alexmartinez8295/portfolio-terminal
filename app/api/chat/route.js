import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";

// Prisma usa el adaptador libSQL (Node), así que forzamos runtime Node.
export const runtime = "nodejs";
// Nunca cachear las respuestas del chat.
export const dynamic = "force-dynamic";

// Modelo de Gemini. La capa gratuita de Google AI cubre los modelos "flash"
// (con límites de peticiones por minuto/día). gemini-2.5-flash es buen
// equilibrio calidad/coste; gemini-2.0-flash es una alternativa más ligera.
const MODEL = "gemini-2.5-flash";
const MAX_TOKENS = 2048;
// Límite defensivo: cuántos mensajes del historial aceptamos por petición.
const MAX_HISTORY = 30;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Función que el modelo invoca para registrar una solicitud de cotización.
// El resultado se guarda como ContactMessage para que aparezca en /admin/contact.
const QUOTE_FN = {
  name: "guardar_solicitud_cotizacion",
  description:
    "Registra una solicitud de cotización de un proyecto freelance. Úsala SOLO cuando ya tengas el nombre, el email y una descripción clara de lo que el cliente necesita. No la inventes: pide los datos que falten antes de llamarla.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      nombre: { type: "string", description: "Nombre de la persona o empresa." },
      email: { type: "string", description: "Correo de contacto del cliente." },
      tipo_proyecto: {
        type: "string",
        enum: ["desarrollo_web", "desarrollo_apps", "salesforce", "otro"],
        description: "Categoría principal del proyecto.",
      },
      descripcion: {
        type: "string",
        description: "Descripción detallada del proyecto y su alcance.",
      },
      presupuesto: {
        type: "string",
        description: "Presupuesto aproximado, si el cliente lo mencionó.",
      },
      plazo: {
        type: "string",
        description: "Plazo o fecha deseada, si el cliente la mencionó.",
      },
    },
    required: ["nombre", "email", "tipo_proyecto", "descripcion"],
  },
};

const TIPO_LABEL = {
  desarrollo_web: "Desarrollo web",
  desarrollo_apps: "Desarrollo de aplicaciones",
  salesforce: "Desarrollo en Salesforce",
  otro: "Otro",
};

// Ejecuta la herramienta: persiste la cotización como mensaje de contacto.
async function guardarCotizacion(input = {}) {
  const { nombre, email, tipo_proyecto, descripcion, presupuesto, plazo } = input;

  if (!nombre || !email || !descripcion) {
    return { error: "Faltan datos obligatorios (nombre, email o descripción)." };
  }

  const mensaje = [
    `[Solicitud de cotización vía asistente IA]`,
    `Tipo de proyecto: ${TIPO_LABEL[tipo_proyecto] || tipo_proyecto || "Sin especificar"}`,
    ``,
    descripcion,
    presupuesto ? `\nPresupuesto aproximado: ${presupuesto}` : "",
    plazo ? `Plazo deseado: ${plazo}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const saved = await prisma.contactMessage.create({
    data: { name: nombre, email, message: mensaje },
  });

  return { id: saved.id, ok: true };
}

// Construye el bloque de contexto (perfil, proyectos, blog, secciones) que
// alimenta el system prompt.
async function construirContexto() {
  const [profile, projects, posts, sections] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.project.findMany(),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      select: { title: true, content: true, createdAt: true },
    }),
    prisma.homeSection.findMany({ orderBy: { order: "asc" } }),
  ]);

  const partes = [];
  const nombre = profile?.name || "el desarrollador";

  if (profile) {
    partes.push(
      `## Perfil\nNombre: ${profile.name}\nBio: ${profile.bio}\nAcerca de: ${profile.about}`
    );
  }

  if (sections.length) {
    partes.push(
      `## Secciones del sitio\n${sections
        .map((s) => `- ${s.title}: ${s.content}`)
        .join("\n")}`
    );
  }

  if (projects.length) {
    partes.push(
      `## Proyectos / Experiencia\n${projects
        .map((p) => `- ${p.title} (${p.tech}): ${p.description}`)
        .join("\n")}`
    );
  }

  if (posts.length) {
    partes.push(
      `## Blog (entradas publicadas)\n${posts
        .map((p) => {
          const resumen = (p.content || "").replace(/\s+/g, " ").slice(0, 300);
          return `- "${p.title}": ${resumen}`;
        })
        .join("\n")}`
    );
  }

  return { contexto: partes.join("\n\n"), nombre };
}

function systemPrompt(contexto, nombre) {
  return `Eres el asistente virtual del portafolio de ${nombre}, un desarrollador freelance especializado en desarrollo web, desarrollo de aplicaciones y desarrollo en Salesforce.

Tu trabajo es:
1. Responder preguntas sobre su experiencia, proyectos y entradas del blog, usando ÚNICAMENTE la información del contexto de abajo. Si algo no está en el contexto, dilo con honestidad y sugiere usar la página de contacto.
2. Ayudar a quienes quieren cotizar un proyecto: haz preguntas para entender el alcance (tipo de proyecto, objetivo, funcionalidades, presupuesto y plazo si los tienen) y, cuando tengas nombre, email y una descripción clara, llama a la función "guardar_solicitud_cotizacion" para registrar la solicitud. Después confirma al usuario que su solicitud quedó registrada y que recibirá respuesta pronto.

Estilo:
- Responde en el idioma del usuario (por defecto español).
- Sé conciso, cercano y profesional. Respuestas directas, sin relleno ni divagaciones.
- Usa Markdown ligero (listas, negritas) cuando ayude a la legibilidad.
- No inventes datos de contacto, precios ni tecnologías que no estén en el contexto.
- Nunca llames a la función sin tener nombre y email reales proporcionados por el usuario.

=== CONTEXTO DEL PORTAFOLIO ===
${contexto}
=== FIN DEL CONTEXTO ===`;
}

// Normaliza y valida el historial que llega del cliente.
function sanearMensajes(raw) {
  if (!Array.isArray(raw)) return null;
  const mensajes = raw
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim()
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content }));

  // La conversación debe empezar por el usuario.
  while (mensajes.length && mensajes[0].role !== "user") mensajes.shift();
  if (!mensajes.length || mensajes[mensajes.length - 1].role !== "user") return null;
  return mensajes;
}

// Convierte el historial a "contents" de Gemini (rol assistant → model).
function aContents(mensajes) {
  return mensajes.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

export async function POST(req) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "El asistente no está configurado (falta GEMINI_API_KEY)." },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }

  const mensajes = sanearMensajes(body?.messages);
  if (!mensajes) {
    return new Response("Historial de mensajes inválido", { status: 400 });
  }

  const { contexto, nombre } = await construirContexto();
  const config = {
    systemInstruction: systemPrompt(contexto, nombre),
    maxOutputTokens: MAX_TOKENS,
    tools: [{ functionDeclarations: [QUOTE_FN] }],
  };

  const contents = aContents(mensajes);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Loop manual: streamea texto y resuelve las llamadas a la función.
        while (true) {
          const respStream = await ai.models.generateContentStream({
            model: MODEL,
            contents,
            config,
          });

          let accText = "";
          const calls = [];

          for await (const chunk of respStream) {
            const t = chunk.text;
            if (t) {
              accText += t;
              controller.enqueue(encoder.encode(t));
            }
            if (chunk.functionCalls?.length) calls.push(...chunk.functionCalls);
          }

          if (!calls.length) break;

          // Registra el turno del modelo (texto + llamadas).
          const modelParts = [];
          if (accText) modelParts.push({ text: accText });
          for (const c of calls) modelParts.push({ functionCall: c });
          contents.push({ role: "model", parts: modelParts });

          // Ejecuta cada función y devuelve los resultados.
          const respParts = [];
          for (const c of calls) {
            let result;
            try {
              result =
                c.name === "guardar_solicitud_cotizacion"
                  ? await guardarCotizacion(c.args)
                  : { error: "Función desconocida" };
            } catch (err) {
              console.error("Error ejecutando función:", err);
              result = { error: "No se pudo registrar la solicitud." };
            }
            respParts.push({
              functionResponse: { name: c.name, response: result },
            });
          }
          contents.push({ role: "user", parts: respParts });
        }
      } catch (err) {
        console.error("Error en /api/chat:", err);
        controller.enqueue(
          encoder.encode("\n\n⚠️ Ocurrió un error al procesar tu mensaje.")
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
