"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function Post() {
  const { id } = useParams(); // 🔥 aquí está la clave
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/posts/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Error API");
        return res.json();
      })
      .then(setPost)
      .catch(err => console.error(err));
  }, [id]);

  if (!post) return <p>Cargando...</p>;

  return (
    <div className="space-y-8 pb-32 max-w-7xl mx-auto pt-24">
      <h1 className="text-2xl mb-4">{post.title}</h1>

      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <h2 className="mt-6">Comentarios</h2>

      {post.comments?.map((c) => (
        <div key={c.id} className="border p-2 mb-2">
          <strong>{c.author}</strong>
          <p>{c.content}</p>
        </div>
      ))}
    </div>
  );
}