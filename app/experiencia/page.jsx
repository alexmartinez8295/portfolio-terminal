"use client";
import { useEffect, useState } from "react";

export default function Experiencia() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then(setProjects)
      .catch((err) => console.error("Error cargando proyectos:", err));
  }, []);

  return (
    <div className="space-y-10 md:space-y-16 pb-32 max-w-6xl mx-auto pt-24">
      <h1 className="text-2xl md:text-3xl mb-6 glow">Experiencia / Proyectos</h1>

      {projects.length === 0 && (
        <p className="text-gray-500">No hay proyectos para mostrar aún...</p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((p) => (
          <div
            key={p.id}
            className="border border-neon p-6 rounded bg-black/50 backdrop-blur-sm"
          >
            <h2 className="text-xl text-green-400 mb-2">{p.title}</h2>
            <p className="text-gray-300 mb-4">{p.description}</p>
            <div className="flex flex-wrap gap-2">
              {p.tech.split(",").map((tech, index) => (
                <span
                  key={index}
                  className="bg-neon/10 border border-neon text-neon text-xs px-2 py-1 rounded"
                >
                  {tech.trim()}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}