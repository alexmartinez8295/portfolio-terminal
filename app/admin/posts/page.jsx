"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);

  const loadPosts = async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  const deletePost = async (id) => {
    if (!confirm("¿Eliminar post?")) return;

    await fetch(`/api/posts/${id}`, {
      method: "DELETE",
    });

    loadPosts();
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div>
      <h1 className="text-xl mb-4">Posts</h1>

      <Link
        href="/admin/posts/new"
        className="border px-4 py-2 mb-4 inline-block"
      >
        + Nuevo Post
      </Link>

      <div className="grid gap-4">
        {posts.map((p) => (
          <div key={p.id} className="border p-4">
            <h2>{p.title}</h2>

            <div className="flex gap-4 mt-2">
              <Link
                href={`/admin/posts/edit/${p.id}`}
                className="text-yellow-400"
              >
                Editar
              </Link>

              <button
                onClick={() => deletePost(p.id)}
                className="text-red-400"
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