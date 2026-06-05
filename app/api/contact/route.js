import { prisma } from "@/lib/prisma";

// 📩 GET → obtener mensajes (admin)
export async function GET() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Response.json(messages);
}

// 📤 POST → guardar mensaje (formulario)
export async function POST(req) {
  const data = await req.json();

  const { name, email, message } = data;

  if (!name || !email || !message) {
    return new Response("Campos requeridos", { status: 400 });
  }

  const saved = await prisma.contactMessage.create({
    data: {
      name,
      email,
      message,
    },
  });

  return Response.json(saved);
}