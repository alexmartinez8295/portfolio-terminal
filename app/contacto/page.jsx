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
      <h1 className="text-xl mb-4 glow">Contacto</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Nombre"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="block mb-2 bg-black border border-neon p-2 w-full"
        />

        <input
          placeholder="Correo"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          className="block mb-2 bg-black border border-neon p-2 w-full"
        />

        <textarea
          placeholder="Mensaje"
          value={form.message}
          onChange={(e) =>
            setForm({ ...form, message: e.target.value })
          }
          className="block mb-2 bg-black border border-neon p-2 w-full"
        />

        <button className="border border-neon px-4 py-2">
          Enviar
        </button>
      </form>

      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}