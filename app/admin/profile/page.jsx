"use client";
import { useState, useEffect } from "react";

export default function AdminProfile() {
  const [form, setForm] = useState({
    name: "",
    bio: "",
    about: "",
    image: "",
  });
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setForm({
            name: data.name || "",
            bio: data.bio || "",
            about: data.about || "",
            image: data.image || "",
          });
        }
      });
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatus("UPLOADING_SYSTEM_AVATAR...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setForm({ ...form, image: data.url });
      setStatus("AVATAR_UPLOAD_SUCCESS [OK]");
    } catch {
      setStatus("AVATAR_UPLOAD_FAILURE [FAIL]");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("UPDATING_CORE_PROFILE...");

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setStatus("PROFILE_UPDATE_COMPLETE [DONE]");
    } else {
      setStatus("PROFILE_UPDATE_ERROR [!]");
    }
  };

  return (
    <div className="max-w-2xl font-mono">
      <h1 className="text-2xl mb-6 glow uppercase tracking-tighter">{">"} GESTIÓN_DE_PERFIL</h1>

      <form onSubmit={handleSubmit} className="space-y-6 border border-neon p-6 bg-black/40">
        <div>
          <label className="block mb-2 text-xs uppercase opacity-50 tracking-widest">System_Identity_Asset</label>
          <div className="flex items-center gap-6">
            {form.image && (
              <img
                src={form.image}
                alt="Profile"
                className="w-24 h-24 object-cover border border-neon shadow-[0_0_10px_rgba(57,255,20,0.2)] grayscale hover:grayscale-0 transition-all"
              />
            )}
            <div className="flex flex-col gap-2">
              <input
                type="file"
                onChange={handleImageUpload}
                className="text-xs file:bg-transparent file:border file:border-neon file:text-neon file:px-2 file:py-1 hover:file:bg-neon hover:file:text-black cursor-pointer"
                disabled={uploading}
              />
              {uploading && (
                <div className="text-[10px] text-blue-400 animate-pulse font-bold">
                  LOADING_ASSET: [######------] 50%
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-xs uppercase opacity-50">Identity_Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-black border border-neon p-2 outline-none focus:border-white transition-all text-neon"
              placeholder="Root.User.Name"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs uppercase opacity-50">Short_Bio_String</label>
            <input
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full bg-black border border-neon p-2 outline-none focus:border-white transition-all text-neon"
              placeholder="System.Short.Description"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs uppercase opacity-50">Extended_About_Buffer</label>
            <textarea
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              className="w-full bg-black border border-neon p-2 h-40 outline-none focus:border-white transition-all text-neon"
              placeholder="System.Extended.Info"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center gap-4">
          <button 
            type="submit"
            disabled={uploading}
            className="border border-neon px-8 py-2 hover:bg-neon hover:text-black transition-all disabled:opacity-50 uppercase text-sm font-bold"
          >
            Sincronizar_Data
          </button>
          
          {status && (
            <div className="text-[10px] bg-zinc-900 px-3 py-1 border-l-2 border-neon uppercase">
              <span className="text-neon opacity-50 mr-2">Status:</span> {status}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
