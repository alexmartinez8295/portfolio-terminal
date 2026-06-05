"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      if (!scrolled) setIsOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: 'inicio', path: '/' },
    { name: 'experiencia', path: '/experiencia' },
    { name: 'blog', path: '/blog' },
    { name: 'contacto', path: '/contacto' }
  ];

  return (
    <nav className={`
  fixed top-0 left-0 w-full z-[100] pointer-events-none flex justify-start px-6 py-2 transition-all duration-700
  ${!isScrolled ? 'bg-[#5C5959]' : 'bg-transparent'}
`}>
      <div className={`
        relative flex items-center transition-all duration-700 pointer-events-auto ease-in-out
        ${isScrolled 
          ? 'w-14 h-14 justify-center rounded-full border border-neon/50 bg-black/80 backdrop-blur-md shadow-[0_0_20px_rgba(57,255,20,0.3)]' 
          : 'w-auto px-8 py-3 bg-black/60 backdrop-blur-xl border border-neon/20 cyber-panel shadow-[0_0_30px_rgba(57,255,20,0.1)]'}
      `}>
        
        {/* Full Menu (Visible only when not scrolled) */}
        <div className={`flex gap-1 md:gap-8 transition-all duration-500 ${isScrolled ? 'opacity-0 scale-90 pointer-events-none absolute' : 'opacity-100 scale-100'}`}>
          {navLinks.map((item) => (
            <Link 
              key={item.name}
              href={item.path} 
              className="group relative px-2 py-1"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neon/60 group-hover:text-neon group-hover:glow transition-all duration-300">
                {item.name}
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-neon group-hover:w-full transition-all duration-300 shadow-[0_0_8px_var(--neon)]" />
            </Link>
          ))}
        </div>

        {/* Hamburger Icon (Visible only when scrolled) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`
            text-neon focus:outline-none z-[110] transition-all duration-500
            ${isScrolled ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none absolute'}
          `}
        >
          <div className="relative w-6 h-6">
            <span className={`absolute block h-0.5 w-full bg-neon transition-all duration-300 ${isOpen ? 'rotate-45 top-3' : 'top-1'}`} />
            <span className={`absolute block h-0.5 w-full bg-neon transition-all duration-300 top-3 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`absolute block h-0.5 w-full bg-neon transition-all duration-300 ${isOpen ? '-rotate-45 top-3' : 'top-5'}`} />
          </div>
        </button>

        {/* Floating Menu (When scrolled and open) */}
        <div className={`
          absolute top-20 left-0 bg-black/90 border border-neon/30 p-6 cyber-panel backdrop-blur-2xl flex flex-col gap-4 min-w-[220px] transition-all duration-500
          ${isScrolled && isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-10 pointer-events-none'}
          shadow-[0_0_50px_rgba(57,255,20,0.2)]
        `}>
          <div className="text-[8px] uppercase tracking-[0.4em] text-neon/40 mb-2 border-b border-neon/10 pb-2 font-bold">
            DIRECTORIOS
          </div>
          {navLinks.map((item) => (
            <Link 
              key={item.name} 
              href={item.path} 
              onClick={() => setIsOpen(false)}
              className="text-[11px] uppercase tracking-[0.3em] font-bold text-neon/60 hover:text-neon hover:glow transition-all py-2 border-l-2 border-transparent hover:border-neon pl-4 bg-neon/[0.02] hover:bg-neon/10"
            >
              {item.name}
            </Link>
          ))}
          <div className="mt-2 text-[7px] text-neon/20 uppercase tracking-widest text-center italic">
            AlxSite_Navigation_v1.0
          </div>
        </div>

        {/* Decorative corner for hamburger circle */}
        {isScrolled && !isOpen && (
          <div className="absolute inset-0 rounded-full border-2 border-neon/10 animate-ping pointer-events-none" />
        )}
      </div>
    </nav>
  );
}