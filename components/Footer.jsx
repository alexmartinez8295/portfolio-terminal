"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then(setProfile);
  }, []);

  return (
    <footer className="relative mt-32 overflow-hidden border-t border-neon/10 bg-black/40 backdrop-blur-xl">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_50%_50%,var(--neon)_0%,transparent_70%)]" />
      
      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1: Brand/Logo */}
          <div className="col-span-1 md:col-span-1 space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-black glow uppercase tracking-tighter text-white italic">
                {profile?.name?.split(' ')[0] || 'TERMINAL'}_OS
              </h3>
              <div className="h-0.5 w-12 bg-neon/50" />
            </div>
            <p className="opacity-50 text-xs font-mono leading-relaxed max-w-xs italic">
              "Construyendo el futuro digital a través del código y la imaginación. Conexión segura establecida."
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-neon/40 italic">Directorios_principales</h4>
            <ul className="space-y-3">
              {[
                { name: 'Inicio', path: '/' },
                { name: 'Blog', path: '/blog' },
                { name: 'Experiencia', path: '/experiencia' },
                { name: 'Contacto', path: '/contacto' }
              ].map(link => (
                <li key={link.name}>
                  <Link href={link.path} className="text-xs font-mono opacity-60 hover:opacity-100 hover:text-neon transition-all flex items-center gap-2 group">
                    <span className="text-neon/30 group-hover:translate-x-1 transition-transform">❱</span> {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social/External */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-neon/40 italic">Enlaces_Externos</h4>
            <ul className="space-y-3">
              {[
                { name: 'GitHub', url: 'https://github.com/alexmartinez8295' },
                { name: 'LinkedIn', url: 'https://www.linkedin.com/in/alexis-mart%C3%ADnez-223077148/' },
                { name: 'X', url: 'https://x.com/alxismh' }
              ].map(link => (
                <li key={link.name}>
                  <a href={link.url} className="text-xs font-mono opacity-60 hover:opacity-100 hover:text-neon transition-all flex items-center gap-2 group">
                    <span className="text-neon/30 group-hover:translate-x-1 transition-transform">❱</span> {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: System Info */}
          <div className="cyber-panel border border-neon/10 p-6 bg-neon/[0.02] space-y-4">
             <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-neon/40 italic">Zona_Restringida</h4>
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono opacity-40">
                   <span>Location:</span>
                   <span>Area_51</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono opacity-40">
                   <span>Estatus:</span>
                   <span className="text-green-500 animate-pulse">Encriptado</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono opacity-40">
                   <span>Uptime:</span>
                   <span>99.99%</span>
                </div>
             </div>
             <h4 className="text-[9px] uppercase tracking-[0.4em] font-bold text-neon/40 italic">Dios termina aquí</h4>
             <Link href="/admin" className="block w-full py-2 border border-neon/20 text-center text-[10px] uppercase font-bold hover:bg-neon hover:text-black transition-all mt-4">
                NO_ENTRAR
             </Link>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] font-mono opacity-30 uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} {profile?.name || "Terminal Portfolio"} // All protocols reserved.
          </div>
          <div className="text-[8px] font-mono opacity-20 uppercase tracking-[0.5em] animate-pulse">
            Connection secure // end_to_end_encryption_active
          </div>
        </div>
      </div>
    </footer>
  );
}
