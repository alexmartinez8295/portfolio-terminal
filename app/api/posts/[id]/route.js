import { prisma } from "@/lib/prisma";

export async function GET(req, context) {
  const { params } = context;

  const resolvedParams = await params; // 🔥 FIX NEXT 15+

  const id = Number(resolvedParams.id);

  if (!id || isNaN(id)) {
    return Response.json(
      { error: "Invalid ID" },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: { comments: true },
  });

  return Response.json(post);
}