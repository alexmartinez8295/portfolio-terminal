import { prisma } from "@/lib/prisma";

// GET uno
export async function GET(_, { params }) {
  const resolvedParams = await params;
  const project = await prisma.project.findUnique({
    where: { id: Number(resolvedParams.id) },
  });

  return Response.json(project);
}

// PUT - actualizar
export async function PUT(req, { params }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    
    // Destructure to ensure we only update expected fields
    const { title, description, tech, image } = body;
    const data = { title, description, tech, image };

    const project = await prisma.project.update({
      where: { id: Number(resolvedParams.id) },
      data,
    });

    return Response.json(project);
  } catch (error) {
    console.error("Project Update Error:", error);
    return new Response(JSON.stringify({ error: "Error updating project" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE
export async function DELETE(_, { params }) {
  const resolvedParams = await params;
  await prisma.project.delete({
    where: { id: Number(resolvedParams.id) },
  });

  return Response.json({ ok: true });
}