import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const data = await req.json();

  const comment = await prisma.comment.create({
    data,
  });

  return Response.json(comment);
}