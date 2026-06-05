"use client";
import { useState } from "react";

export default function Contacto() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus("Enviando...");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setStatus("Mensaje enviado ✅");
      setForm({ name: "", email: "", message: "" });
    } else {
      setStatus("Error al enviar ❌");
    }
  };

  return (
    <div className="max-w-xl mx-auto pt-24">
      <h1 className="text-2xl md:text-3xl mb-6 glow">Contacto</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Nombre"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="block bg-black border border-neon p-3 w-full text-base rounded outline-none focus:ring-1 focus:ring-neon/50"
        />

        <input
          type="email"
          inputMode="email"
          placeholder="Correo"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          className="block bg-black border border-neon p-3 w-full text-base rounded outline-none focus:ring-1 focus:ring-neon/50"
        />

        <textarea
          placeholder="Mensaje"
          rows={5}
          value={form.message}
          onChange={(e) =>
            setForm({ ...form, message: e.target.value })
          }
          className="block bg-black border border-neon p-3 w-full text-base rounded outline-none focus:ring-1 focus:ring-neon/50 resize-y"
        />

        <button className="w-full sm:w-auto border border-neon px-6 py-3 text-base font-bold uppercase tracking-wider hover:bg-neon hover:text-black transition-all rounded">
          Enviar
        </button>
      </form>

      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}