"use client";
import { useEffect, useState } from "react";

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    tech: "",
    image: "",
  });
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Error cargando proyectos:", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatus("UPLOAD_SEQUENCE_STARTED");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setForm({ ...form, image: data.url });
      setStatus("FILE_TRANSFER_COMPLETE [OK]");
    } catch {
      setStatus("ERROR_IN_TRANSFER [FAIL]");
    } finally {
      setUploading(false);
    }
  };

  const deleteProject = async (id) => {
    if (!confirm("SYSTEM_PROMPT: Confirma eliminación de registro?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    loadProjects();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("SYNCING_WITH_DATABASE...");

    try {
      const url = editing ? `/api/projects/${editing.id}` : "/api/projects";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Database Sync Fail");

      setEditing(null);
      setForm({ title: "", description: "", tech: "", image: "" });
      setStatus("DATABASE_UPDATE_SUCCESS [DONE]");
      loadProjects();
    } catch (error) {
      setStatus("SYNC_PROCESS_FAILURE [!]");
      console.error(error);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="font-mono">
      <h1 className="text-2xl mb-6 glow uppercase tracking-tighter">{">"} GESTIÓN_DE_PROYECTOS</h1>

      <form onSubmit={handleSubmit} className="mb-8 border border-neon p-6 max-w-xl bg-black/40">
        <h2 className="text-lg mb-4 text-neon">{editing ? "[[MODO_EDICIÓN]]" : "[[NUEVO_REGISTRO]]"}</h2>
        
        <div className="mb-6">
          <label className="block mb-2 text-xs uppercase opacity-50 tracking-widest">Multimedia_Asset</label>
          <div className="flex items-center gap-6">
            {form.image && (
              <img src={form.image} alt="Preview" className="w-20 h-20 object-cover border border-neon shadow-[0_0_10px_rgba(57,255,20,0.3)]" />
            )}
            <div className="flex flex-col gap-2">
              <input type="file" onChange={handleImageUpload} className="text-xs file:bg-transparent file:border file:border-neon file:text-neon file:px-2 file:py-1 hover:file:bg-neon hover:file:text-black cursor-pointer" />
              {uploading && (
                <div className="text-[10px] text-blue-400 animate-pulse">
                  UPLOADING: [########----] 75%
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase opacity-50 block mb-1">Título_Entry</label>
            <input
              placeholder="System.Project.Name"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="block bg-black border border-neon p-2 w-full outline-none focus:border-white transition-all"
            />
          </div>

          <div>
            <label className="text-xs uppercase opacity-50 block mb-1">Descripción_Buffer</label>
            <textarea
              placeholder="Project.Detailed.Info"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="block bg-black border border-neon p-2 w-full outline-none focus:border-white h-24 transition-all"
            />
          </div>

          <div>
            <label className="text-xs uppercase opacity-50 block mb-1">Stack_Identifier</label>
            <input
              placeholder="React, Next.js, Prisma..."
              value={form.tech}
              onChange={(e) => setForm({ ...form, tech: e.target.value })}
              className="block bg-black border border-neon p-2 w-full outline-none focus:border-white transition-all"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button 
            disabled={uploading}
            className="border border-neon px-6 py-2 hover:bg-neon hover:text-black disabled:opacity-50 uppercase text-sm font-bold transition-all"
          >
            {editing ? "EJECUTAR_UPDATE" : "INSERTAR_DATA"}
          </button>
          
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ title: "", description: "", tech: "", image: "" });
              }}
              className="text-xs opacity-50 hover:opacity-100 uppercase underline decoration-neon"
            >
              Abortar
            </button>
          )}
        </div>
        
        {status && (
          <div className="mt-4 p-2 bg-zinc-900/50 border-l-2 border-neon text-[10px]">
            <span className="text-neon mr-2">SYS_MSG:</span> {status}
          </div>
        )}
      </form>

      <div className="grid gap-6">
        <h3 className="text-xs uppercase opacity-30 tracking-[0.3em]">Directorio_de_Proyectos</h3>
        {projects.map((p) => (
          <div key={p.id} className="border border-neon/30 p-4 hover:border-neon transition-all flex justify-between items-start bg-black/20 group">
            <div className="flex gap-6">
              <div className="relative">
                {p.image ? (
                  <img src={p.image} alt={p.title} className="w-24 h-24 object-cover border border-zinc-800 grayscale group-hover:grayscale-0 transition-all" />
                ) : (
                  <div className="w-24 h-24 bg-zinc-900 flex items-center justify-center text-[10px] text-zinc-700 border border-zinc-800">NO_IMG</div>
                )}
                <div className="absolute top-0 right-0 p-1 bg-black/80 text-[8px]">ID:{p.id}</div>
              </div>
              
              <div className="max-w-md">
                <h2 className="text-xl text-neon glow mb-1 uppercase tracking-tight font-bold">{p.title}</h2>
                <p className="text-gray-400 text-sm line-clamp-2 mb-3 leading-snug">{p.description}</p>
                <div className="inline-block px-2 py-0.5 border border-neon/20 text-[10px] text-neon bg-neon/5 uppercase">
                  {p.tech}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setEditing(p);
                  setForm({ title: p.title, description: p.description, tech: p.tech, image: p.image || "" });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-1 border border-yellow-500/50 text-yellow-500 text-xs hover:bg-yellow-500 hover:text-black transition-all uppercase"
              >
                Modificar
              </button>
              <button
                onClick={() => deleteProject(p.id)}
                className="px-3 py-1 border border-red-500/50 text-red-500 text-xs hover:bg-red-500 hover:text-black transition-all uppercase"
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