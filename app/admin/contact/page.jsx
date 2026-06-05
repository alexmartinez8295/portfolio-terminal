"use client";
import { useEffect, useState } from "react";

export default function AdminContact() {
  const [messages, setMessages] = useState([]);

  const loadMessages = async () => {
    const res = await fetch("/api/contact");
    const data = await res.json();
    setMessages(data);
  };

  const deleteMessage = async (id) => {
    if (!confirm("¿Eliminar mensaje?")) return;
    await fetch(`/api/contact/${id}`, {
      method: "DELETE",
    });
    setMessages(messages.filter((m) => m.id !== id));
  };

  const markAsRead = async (id) => {
    await fetch(`/api/contact/${id}/read`, {
      method: "PATCH",
    });

    setMessages(
      messages.map((m) =>
        m.id === id ? { ...m, read: true } : m
      )
    );
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div>
      <h1 className="text-2xl mb-6 glow">Inbox / Mensajes</h1>

      {messages.length === 0 && <p className="text-gray-500">No hay mensajes aún.</p>}

      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`border p-4 rounded ${m.read ? 'border-gray-800 opacity-75' : 'border-neon'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p><strong>{m.name}</strong> <span className="text-gray-500 text-sm">{m.email}</span></p>
                <p className="text-xs text-gray-600">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
              {!m.read && <span className="bg-neon text-black text-[10px] px-2 py-0.5 rounded font-bold">NUEVO</span>}
            </div>
            
            <p className="my-4 text-gray-300 whitespace-pre-wrap">{m.message}</p>
            
            <div className="flex gap-4 text-sm">
              {!m.read && (
                <button
                  onClick={() => markAsRead(m.id)}
                  className="text-blue-400 hover:underline"
                >
                  Marcar como leído
                </button>
              )}
              <button
                onClick={() => deleteMessage(m.id)}
                className="text-red-400 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}