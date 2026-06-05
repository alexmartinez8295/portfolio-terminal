import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let profile = await prisma.profile.findFirst();

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          name: "Tu Nombre",
          bio: "Tu Bio corta aquí",
          about: "Tu historia completa aquí",
          image: null,
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("GET Profile Error:", error);
    return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    
    // Extract only the fields we want to update to avoid Prisma errors with extra fields like 'id'
    const { name, bio, about, image } = body;
    const data = { name, bio, about, image };

    const profile = await prisma.profile.findFirst();

    if (profile) {
      const updated = await prisma.profile.update({
        where: { id: profile.id },
        data,
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.profile.create({
        data,
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("PUT Profile Error:", error);
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 });
  }
}