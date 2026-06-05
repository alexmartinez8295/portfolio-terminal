"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Editor from "@/components/Editor";

export default function NewPost() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
      }),
    });

    const data = await res.json();
    router.push(`/blog/${data.id}`);
  };

  return (
    <div>
      <h1 className="text-xl mb-4 glow">Nuevo Post</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block mb-4 bg-black border border-neon p-2 w-full"
        />

        {/* 🔥 EDITOR TIPO NOTION */}
        <Editor content={content} setContent={setContent} />

        <button className="border border-neon px-4 py-2 mt-4">
          Publicar
        </button>
      </form>
    </div>
  );
}