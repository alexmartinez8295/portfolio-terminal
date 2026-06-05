import { prisma } from "@/lib/prisma";

// 🗑️ eliminar mensaje
export async function DELETE(_, { params }) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  await prisma.contactMessage.delete({
    where: { id },
  });

  return Response.json({ ok: true });
}