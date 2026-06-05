import { prisma } from "@/lib/prisma";

// GET - obtener todos
export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { id: "desc" },
  });

  return Response.json(projects);
}

// POST - crear
export async function POST(req) {
  const data = await req.json();

  const project = await prisma.project.create({
    data,
  });

  return Response.json(project);
}