"use client";
import { useState } from "react";

export default function CommentForm({ postId, reload }) {
  const [form, setForm] = useState({
    author: "",
    content: "",
  });

  const submit = async (e) => {
    e.preventDefault();

    await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        postId,
      }),
    });

    reload();
  };

  return (
    <form onSubmit={submit} className="mt-4">
      <input
        placeholder="Nombre"
        className="block mb-2"
        onChange={e => setForm({ ...form, author: e.target.value })}
      />

      <textarea
        placeholder="Comentario"
        className="block mb-2"
        onChange={e => setForm({ ...form, content: e.target.value })}
      />

      <button>Comentar</button>
    </form>
  );
}