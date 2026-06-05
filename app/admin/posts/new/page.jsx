"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
});

export default function NewPost() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const save = async () => {
    await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });

    router.push("/admin/posts");
  };

  return (
    <div>
      <h1 className="mb-4">Nuevo Post</h1>

      <input
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="block mb-4 border p-2 w-full"
      />

      <Editor content={content} setContent={setContent} />

      <button onClick={save} className="mt-4 border px-4 py-2">
        Guardar
      </button>
    </div>
  );
}