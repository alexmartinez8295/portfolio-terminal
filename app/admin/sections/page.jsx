"use client";
import { useEffect, useState } from "react";

export default function AdminSections() {
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    image: "",
    link: "",
    order: 0,
    alignment: "left",
  });
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadSections = async () => {
    try {
      const res = await fetch("/api/home-sections");
      const data = await res.json();
      setSections(data);
    } catch (error) {
      console.error("Error cargando secciones:", error);
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

  const deleteSection = async (id) => {
    if (!confirm("SYSTEM_PROMPT: Confirma eliminación de sección?")) return;
    await fetch(`/api/home-sections/${id}`, { method: "DELETE" });
    loadSections();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("SYNCING_WITH_DATABASE...");

    try {
      const url = editing ? `/api/home-sections/${editing.id}` : "/api/home-sections";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Database Sync Fail");

      setEditing(null);
      setForm({ title: "", content: "", image: "", link: "", order: 0, alignment: "left" });
      setStatus("DATABASE_UPDATE_SUCCESS [DONE]");
      loadSections();
    } catch (error) {
      setStatus("SYNC_PROCESS_FAILURE [!]");
      console.error(error);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  return (
    <div className="font-mono">
      <h1 className="text-2xl mb-6 glow uppercase tracking-tighter">{">"} GESTIÓN_DE_SECCIONES</h1>

      <form onSubmit={handleSubmit} className="mb-8 border border-neon p-6 max-w-2xl bg-black/40">
        <h2 className="text-lg mb-4 text-neon">{editing ? "[[MODO_EDICIÓN]]" : "[[NUEVA_SECCIÓN]]"}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase opacity-50 block mb-1">Título_Sección</label>
              <input
                placeholder="Section.Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="block bg-black border border-neon p-2 w-full outline-none focus:border-white transition-all text-neon"
              />
            </div>
            
            <div>
              <label className="text-xs uppercase opacity-50 block mb-1">Enlace_Opcional</label>
              <input
                placeholder="https://link.com"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="block bg-black border border-neon p-2 w-full outline-none focus:border-white transition-all text-neon"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs uppercase opacity-50 block mb-1">Orden</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                  className="block bg-black border border-neon p-2 w-full outline-none focus:border-white transition-all text-neon"
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="text-xs uppercase opacity-50 block mb-1">Alineación del Contenedor</label>
                <div className="flex gap-2">
                  {[
                    { id: 'left', icon: '◧', label: 'Izquierda' },
                    { id: 'center', icon: '■', label: 'Centro' },
                    { id: 'right', icon: '◨', label: 'Derecha' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({ ...form, alignment: opt.id })}
                      className={`flex-1 border p-2 text-xs flex flex-col items-center gap-1 transition-all ${
                        form.alignment === opt.id 
                          ? 'border-neon bg-neon/20 text-white' 
                          : 'border-white/10 opacity-50 hover:opacity-100'
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-xs uppercase opacity-50 tracking-widest">Multimedia_Asset</label>
            <div className="flex flex-col gap-4">
              {form.image && (
                <img src={form.image} alt="Preview" className="w-full h-32 object-cover border border-neon shadow-[0_0_10px_rgba(57,255,20,0.3)]" />
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
        </div>

        <div>
          <label className="text-xs uppercase opacity-50 block mb-1">Contenido_Markdown</label>
          <textarea
            placeholder="Support for **Bold**, *Italic*, # Titles, etc."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="block bg-black border border-neon p-2 w-full outline-none focus:border-white h-48 transition-all text-neon font-mono"
          />
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
                setForm({ title: "", content: "", image: "", link: "", order: 0, alignment: "left" });
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
        <h3 className="text-xs uppercase opacity-30 tracking-[0.3em]">Directorio_de_Secciones</h3>
        {sections.map((s) => (
          <div key={s.id} className="border border-neon/30 p-4 hover:border-neon transition-all flex justify-between items-center bg-black/20 group">
            <div className="flex gap-6 items-center">
              <div className="text-neon opacity-50 font-bold w-12 text-[10px]">ORD:{s.order} <br/> ALIGN:{s.alignment}</div>
              {s.image && <img src={s.image} alt={s.title} className="w-16 h-16 object-cover border border-zinc-800" />}
              <div>
                <h2 className="text-lg text-neon glow uppercase font-bold">{s.title}</h2>
                <div className="text-[10px] opacity-40 uppercase">ID: {s.id} // Content: {s.content.substring(0, 30)}...</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditing(s);
                  setForm({ 
                    title: s.title, 
                    content: s.content, 
                    image: s.image || "", 
                    link: s.link || "", 
                    order: s.order,
                    alignment: s.alignment || "left"
                  });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-1 border border-yellow-500/50 text-yellow-500 text-xs hover:bg-yellow-500 hover:text-black transition-all uppercase"
              >
                Modificar
              </button>
              <button
                onClick={() => deleteSection(s.id)}
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
