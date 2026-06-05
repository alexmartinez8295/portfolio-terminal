import { prisma } from "@/lib/prisma";

// GET all
export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Response.json(posts);
}

// POST
export async function POST(req) {
  const data = await req.json();

  const post = await prisma.post.create({
    data,
  });

  return Response.json(post);
}