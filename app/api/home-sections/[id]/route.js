import { prisma } from "@/lib/prisma";

export async function PUT(req, { params }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { title, content, image, link, order, alignment } = body;

    const section = await prisma.homeSection.update({
      where: { id: Number(resolvedParams.id) },
      data: { 
        title, 
        content, 
        image, 
        link, 
        order: Number(order) || 0,
        alignment: alignment || "left"
      },
    });

    return Response.json(section);
  } catch (error) {
    console.error("Home Section Update Error:", error);
    return new Response(JSON.stringify({ error: "Error updating section", details: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(_, { params }) {
  try {
    const resolvedParams = await params;
    await prisma.homeSection.delete({
      where: { id: Number(resolvedParams.id) },
    });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Home Section Delete Error:", error);
    return new Response(JSON.stringify({ error: "Error deleting section" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
