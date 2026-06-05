"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Terminal({ profile }) {
  const [history, setHistory] = useState([
    '| - - - - - - - - - - - - - - - - - |',
    '|          Hola, amigo!             |',
    '| - - - - - - - - - - - - - - - - - |',
    '              \\ (•◡•) /',
    '               \\    /',
    '                ----',
    '                |  |',
    '               _|  |_',
    ">>> Escribe 'hola' para ver los comandos disponibles.",
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  const typeText = async (text) => {
    setIsTyping(true);
    let currentText = "";
    const lines = text.split("\n");

    for (const line of lines) {
      for (let i = 0; i < line.length; i++) {
        currentText += line[i];
        setHistory((prev) => [...prev.slice(0, -1), currentText]);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      currentText += "\n";
    }
    setIsTyping(false);
  };

  const handleCommand = async (cmd) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    setHistory((prev) => [...prev, `[USER@GUEST]:~$ ${cmd}`]);

    switch (trimmedCmd) {
      case "hola":
        setHistory((prev) => [
          ...prev,
          "Comandos: info | experiencia | blog | contacto | clear",
        ]);
        break;

      case "info":
        setHistory((prev) => [...prev, ""]);
        await typeText(profile?.about || "NO_INFO: No se encontró información.");
        break;

      case "experiencia":
        setHistory((prev) => [...prev, "REDIRECCIONANDO_AL_MODULO_DE_EXPERIENCIA..."]);
        setTimeout(() => router.push("/experiencia"), 800);
        break;

      case "blog":
        setHistory((prev) => [...prev, "INICIANDO_FEED_DEL_BLOG..."]);
        setTimeout(() => router.push("/blog"), 800);
        break;

      case "contacto":
        setHistory((prev) => [...prev, "ESTABLECIENDO_CONEXION_DE_COMUNICACION..."]);
        setTimeout(() => router.push("/contacto"), 800);
        break;

      case "clear":
        setHistory(["BORRANDO_HISTORIAL..."]);
        break;

      default:
        setHistory((prev) => [...prev, `COMANDO_NO_RECONOCIDO: '${cmd}'`]);
    }
  };

  const onEnter = (e) => {
    if (e.key === "Enter" && !isTyping) {
      handleCommand(input);
      setInput("");
    }
  };

  return (
    <div className="relative group">
      {/* Decorative Outer Frame */}
      <div className="absolute -inset-1 bg-gradient-to-r from-neon/20 to-blue-500/20 blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
      
      <div className="relative cyber-panel border border-neon/30 bg-black/80 backdrop-blur-md overflow-hidden shadow-[0_0_20px_rgba(57,255,20,0.1)]">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-neon/20 bg-neon/5">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
            <div className="w-2 h-2 rounded-full bg-green-500/50" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">
            Secure_Terminal // Core_Access
          </div>
        </div>

        <div 
          ref={terminalRef}
          className="p-6 h-[40vh] md:h-[50vh] overflow-y-auto font-mono text-sm md:text-base scroll-smooth custom-scrollbar"
        >
          {history.map((line, i) => (
            <pre key={i} className="text-neon/90 whitespace-pre-wrap mb-2 leading-relaxed selection:bg-neon selection:text-black">
              {line}
            </pre>
          ))}
          {isTyping && <span className="animate-pulse text-neon shadow-[0_0_8px_var(--neon)]">█</span>}

          <div className="flex mt-4 items-center">
            <span className="mr-3 text-neon font-bold opacity-80">anon@~alxSite$</span>
            <input
              className="bg-transparent outline-none w-full text-neon caret-white placeholder:opacity-20"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onEnter}
              disabled={isTyping}
              autoFocus
              placeholder={isTyping ? "PROCESSING..." : "Input command..."}
            />
          </div>
        </div>
        
        {/* Bottom Decorative Edge */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-neon/20 to-transparent opacity-30" />
      </div>
    </div>
  );
}