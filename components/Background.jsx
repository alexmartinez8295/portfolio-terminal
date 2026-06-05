"use client";
import { useEffect, useState } from "react";

export default function Background() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#050505]">
      {/* Dynamic Grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--neon) 1px, transparent 1px),
            linear-gradient(to bottom, var(--neon) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          transform: `perspective(500px) rotateX(60deg) translateY(${offset * 0.2}px)`,
          transformOrigin: 'top center',
          transition: 'transform 0.1s ease-out'
        }}
      />

      {/* Floating Blobs / Lights */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon/10 rounded-full blur-[120px] animate-pulse-slow"
        style={{ transform: `translateY(${offset * -0.1}px)` }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow"
        style={{ transform: `translateY(${offset * 0.05}px)` }}
      />
      
      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
