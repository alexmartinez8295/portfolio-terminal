"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("/api/posts")
      .then(res => {
        if (!res.ok) throw new Error("Error API");
        return res.json();
      })
      .then(setPosts)
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-32 pb-32 max-w-6xl mx-auto pt-24">
      <h1 className="text-xl mb-4 glow">Blog</h1>

      {posts.length === 0 && (
        <p>No hay publicaciones aún...</p>
      )}

      {posts.map((p) => (
        <div key={p.id} className="border border-neon p-4 mb-4">
          <h2 className="text-lg">{p.title}</h2>

          <Link href={`/blog/${p.id}`} className="text-blue-400">
            Leer más →
          </Link>
        </div>
      ))}
    </div>
  );
}