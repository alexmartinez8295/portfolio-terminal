import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sections = await prisma.homeSection.findMany({
      orderBy: { order: "asc" },
    });
    return Response.json(sections);
  } catch (error) {
    console.error("Home Sections GET Error:", error);
    return new Response(JSON.stringify({ error: "Error fetching sections" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, content, image, link, order, alignment } = body;
    
    const section = await prisma.homeSection.create({
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
    console.error("Home Section POST Error:", error);
    return new Response(JSON.stringify({ error: "Error creating section", details: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
