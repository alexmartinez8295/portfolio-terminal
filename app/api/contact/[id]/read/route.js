import { prisma } from "@/lib/prisma";

export async function PATCH(_, { params }) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  const updated = await prisma.contactMessage.update({
    where: { id },
    data: { read: true },
  });

  return Response.json(updated);
}