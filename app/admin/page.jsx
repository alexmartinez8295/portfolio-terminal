"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Admin() {
  const [unread, setUnread] = useState(0);

  const loadMessages = async () => {
    const res = await fetch("/api/contact");
    const data = await res.json();
    const unreadCount = data.filter((m) => m.read === false).length;
    setUnread(unreadCount);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div>
      <h1 className="text-2xl mb-6 glow">Panel de Administración</h1>

      <p className="mt-4 mb-8">
        📬 Mensajes sin leer:{" "}
        <span className="text-green-400">{unread}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/profile" className="border border-neon px-4 py-4 hover:bg-neon hover:text-black flex flex-col items-center justify-center transition-all">
          <span className="text-xl">👤</span>
          <span className="mt-2">Gestionar Perfil</span>
        </Link>

        <Link href="/admin/projects" className="border border-neon px-4 py-4 hover:bg-neon hover:text-black flex flex-col items-center justify-center transition-all">
          <span className="text-xl">💼</span>
          <span className="mt-2">Gestionar Experiencia</span>
        </Link>

        <Link href="/admin/posts" className="border border-neon px-4 py-4 hover:bg-neon hover:text-black flex flex-col items-center justify-center transition-all">
          <span className="text-xl">📝</span>
          <span className="mt-2">Gestionar Blog</span>
        </Link>

        <Link href="/admin/sections" className="border border-neon px-4 py-4 hover:bg-neon hover:text-black flex flex-col items-center justify-center transition-all">
          <span className="text-xl">🏠</span>
          <span className="mt-2">Secciones Inicio</span>
        </Link>

        <Link href="/admin/contact" className="border border-neon px-4 py-4 hover:bg-neon hover:text-black flex flex-col items-center justify-center transition-all">
          <span className="text-xl">📩</span>
          <span className="mt-2">Inbox ({unread})</span>
        </Link>
      </div>
    </div>
  );
}