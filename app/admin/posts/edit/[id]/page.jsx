"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
});

export default function EditPost() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!id) return;

    fetch(`/api/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title);
        setContent(data.content);
      });
  }, [id]);

  const update = async () => {
    await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });

    router.push("/admin/posts");
  };

  return (
    <div className="space-y-8 pb-32 max-w-7xl mx-auto pt-24">
      <h1 className="mb-4">Editar Post</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="block mb-4 border p-2 w-full"
      />

      <Editor content={content} setContent={setContent} />

      <button onClick={update} className="mt-4 border px-4 py-2">
        Actualizar
      </button>
    </div>
  );
}