"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Terminal from "@/components/Terminal";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';

type Profile = {
  name: string;
  bio: string;
  about: string;
  image?: string | null;
};

type Project = {
  id: number;
  title: string;
  description: string;
  tech: string;
  image?: string | null;
};

type HomeSection = {
  id: number;
  title: string;
  content: string;
  image?: string | null;
  link?: string | null;
  order: number;
  alignment: string;
};

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Fetch data only once
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then(setProfile);

    fetch("/api/projects")
      .then((res) => res.json())
      .then(setProjects);

    fetch("/api/home-sections")
      .then((res) => res.json())
      .then(setSections);
  }, []);

  // Handle scroll animations when projects, profile or sections change
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".scroll-reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [projects, profile, sections]);

  // Carousel handlers
  const nextSection = () => {
    setCurrentSectionIndex((prev) => 
      prev === sections.length - 1 ? 0 : prev + 1
    );
  };

  const prevSection = () => {
    setCurrentSectionIndex((prev) => 
      prev === 0 ? sections.length - 1 : prev - 1
    );
  };

  const goToSection = (index: number) => {
    setCurrentSectionIndex(index);
  }; 

  return (
    <div className="space-y-32 pb-32 max-w-12xl mx-auto pt-10">
      {/* Hero Section */}
      <section className="min-h-[85vh] flex flex-col md:flex-row items-center gap-16 px-6">
        <div className="w-full md:w-2/5 flex justify-center animate-fade-in relative">
          <div className="absolute -inset-4 bg-neon/10 blur-[60px] rounded-full animate-pulse-slow" />
          <div className="relative group">
            {/* Sci-fi Image Frame */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-neon to-blue-500 rounded-[30px] opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative w-72 h-72 md:w-150 md:h-150 border border-neon/30 p-3 bg-black/40 backdrop-blur-sm rounded-[28px] overflow-hidden shadow-2xl">
              {profile?.image ? (
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="w-full h-full object-cover rounded-[20px] grayscale hover:grayscale-0 transition-all duration-700 scale-105 hover:scale-100"
                />
              ) : (
                <div className="w-full h-full bg-zinc-900/50 flex items-center justify-center text-neon/30 font-mono text-sm border-2 border-dashed border-neon/20 rounded-[20px]">
                  [SIN_FOTO ¬_¬]
                </div>
              )}
              {/* Corner Decorations */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-neon/60 rounded-tl-lg" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-neon/60 rounded-br-lg" />
            </div>
          </div>
        </div>

        <div className="w-full md:w-3/5 space-y-8">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.5em] text-neon/60 font-bold ml-1 animate-pulse">IDENTIDAD_AUTORIZADA</div>
            <h1 className="text-5xl md:text-7xl glow mb-2 font-black uppercase tracking-tighter text-white leading-none">
              {profile?.name || "Cargando..."}
            </h1>
            <div className="h-1 w-20 bg-neon shadow-[0_0_10px_var(--neon)]" />
          </div>
          <p className="text-xl md:text-2xl text-neon/80 font-mono border-l-4 border-neon/20 pl-6 py-2 bg-neon/[0.02]">
            {profile?.bio || "Cargando credenciales encriptadas..."}
          </p>
          <Terminal profile={profile} />
        </div>
      </section>

      {/* Dynamic Sections Carousel from Admin */}
      {sections.length > 0 && (
        <div className="px-6 relative">
          {/* Carousel Container */}
          <div className="relative w-full min-h-[450px]">
            {/* Slides */}
            <div className="relative w-full h-full">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`absolute top-0 left-0 w-full transition-all duration-700 ease-out ${
                    index === currentSectionIndex 
                      ? 'opacity-100 pointer-events-auto' 
                      : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <section 
                    className={`scroll-reveal w-full md:w-4/5 lg:w-5/6 bg-[#5C5959] rounded-xl border
                      ${section.alignment === 'center' ? 'mx-auto' : ''}
                      ${section.alignment === 'left' ? 'mr-auto text-left' : ''}
                      ${section.alignment === 'right' ? 'ml-auto text-right' : ''}
                    `}
                  >
                    <div className={`
                      flex flex-col gap-12 cyber-panel border border-neon/20 py-16 px-10 bg-black/40 backdrop-blur-xl relative overflow-hidden group md:flex-row`}>
                      {/* Animated Background Line */}
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      
                      {section.image && (
                        <div className="w-full md:w-1/3 shrink-0 flex justify-center md:justify-end">
                          
                          <div className="relative w-[220px] h-[220px] md:w-[260px] md:h-[260px] overflow-hidden rounded-xl border border-neon/30 bg-black/60 flex items-center justify-center">
                            
                            {/* Glow effect */}
                            <div className="absolute -inset-2 bg-neon/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            
                            <img 
                              src={section.image} 
                              alt={section.title} 
                              className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-700 relative z-10"
                            />
                            
                          </div>

                        </div>
                      )}
                      
                      <div className="w-full space-y-8 relative z-10">
                        <div className="space-y-4">
                          <h2 className="text-4xl glow uppercase font-black tracking-widest text-white">{section.title}</h2>
                          <div className={`h-0.5 w-12 bg-neon/50 ${section.alignment === 'center' ? 'mx-auto' : section.alignment === 'right' ? 'ml-auto' : ''}`} />
                        </div>
                        
                        <div className="prose prose-invert max-w-none text-lg md:text-xl leading-relaxed opacity-70 font-mono text-neon/90">
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{section.content}</ReactMarkdown>
                        </div>

                        {section.link && (
                          <a 
                            href={section.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="cyber-button inline-flex items-center gap-3 px-8 py-3 border border-neon bg-neon/5 text-neon hover:bg-neon hover:text-black font-bold uppercase text-sm tracking-widest"
                          >
                            Establish_Link <span>❱</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            {sections.length > 1 && (
              <>
                {/* Previous Button */}
                <button
                  onClick={prevSection}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 md:translate-x-0 z-10 p-3 border border-neon/40 bg-black/60 hover:bg-neon hover:text-black text-neon transition-all duration-300 group"
                  aria-label="Previous section"
                >
                  <span className="text-2xl font-bold">‹</span>
                </button>

                {/* Next Button */}
                <button
                  onClick={nextSection}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 md:translate-x-0 z-10 p-3 border border-neon/40 bg-black/60 hover:bg-neon hover:text-black text-neon transition-all duration-300 group"
                  aria-label="Next section"
                >
                  <span className="text-2xl font-bold">›</span>
                </button>
              </>
            )}
          </div>

          {/* Indicator Dots */}
          {sections.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center items-center gap-3 z-10">
              {sections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSection(index)}
                  className={`transition-all duration-500 ${
                    index === currentSectionIndex
                      ? 'w-10 h-2 bg-neon shadow-[0_0_12px_var(--neon)]'
                      : 'w-2 h-2 bg-neon/30 hover:bg-neon/60'
                  } rounded-full`}
                  aria-label={`Go to section ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Projects Section */}
      <section className="space-y-16 px-6">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl glow uppercase font-black tracking-[0.25em] text-white italic">MISIONES_CUMLPIDAS</h2>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-neon to-transparent mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="scroll-reveal group relative bg-[#8F8F8F] rounded-3xl border border-neon/20"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-b from-neon/20 to-blue-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative cyber-panel border border-neon/20 p-6 bg-black/60 backdrop-blur-sm overflow-hidden h-full flex flex-col hover:border-neon/50 transition-colors">
                <div className="overflow-hidden mb-6 border border-white/5 rounded-xl relative aspect-video shadow-inner">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900/50 flex flex-col items-center justify-center text-neon/20 font-mono text-[10px] gap-2">
                      <span className="text-2xl opacity-10">⬢</span>
                      DATA_CORRUPTED_MISSING_ASSET
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 text-[8px] text-white/40 font-mono rounded">
                    MOD_ID: {project.id}
                  </div>
                </div>
                
                <h3 className="text-2xl text-white font-bold uppercase tracking-tight group-hover:text-neon transition-colors mb-3">
                  {project.title}
                </h3>
                <p className="text-sm opacity-60 mb-6 line-clamp-4 leading-relaxed text-neon/80 font-mono flex-grow">
                  {project.description}
                </p>
                
                <div className="pt-4 border-t border-neon/10 flex flex-wrap gap-2">
                  {project.tech.split(',').map((t, i) => (
                    <span key={i} className="text-[9px] uppercase tracking-wider font-bold text-neon/50 px-2 py-0.5 border border-neon/20 rounded-full">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Original About Section fallback */}
      <section className="scroll-reveal max-w-5xl mx-auto px-6 py-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-neon to-transparent opacity-30" />
        <div className="cyber-panel border border-white/5 p-12 bg-white/[0.02] backdrop-blur-3xl text-center space-y-6">
          <h2 className="text-sm uppercase font-black tracking-[0.4em] text-white/30 italic">AlxSite_Terminal_v1.0_Status: Online</h2>
          <div className="text-lg md:text-xl leading-relaxed opacity-50 whitespace-pre-wrap font-mono text-neon italic max-w-3xl mx-auto">
            "{profile?.about}"
          </div>
        </div>
      </section>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .scroll-reveal {
          opacity: 0;
          transform: translateY(60px);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .scroll-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
