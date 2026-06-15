"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const WELCOME = {
  role: "assistant",
  content:
    "Hola 👋 Soy el asistente de este portafolio. Puedo contarte sobre la **experiencia**, los **proyectos** y el **blog**, o ayudarte a **cotizar** un proyecto de desarrollo web, apps o Salesforce. ¿En qué te ayudo?",
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll al final cuando llegan mensajes o tokens.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Enfoca el input al abrir.
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg = { role: "user", content: text };
    // Historial que se envía a la API (sin el saludo inicial generado en cliente).
    const history = [...messages.filter((m) => m !== WELCOME), userMsg];

    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) {
        const errText =
          res.status === 503
            ? "El asistente no está disponible en este momento."
            : "Hubo un problema al contactar al asistente.";
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${errText}` };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "⚠️ Error de conexión. Inténtalo de nuevo.",
        };
        return copy;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente"}
        className="fixed bottom-5 right-5 z-[120] w-14 h-14 rounded-full border border-neon/50 bg-black/80 backdrop-blur-md text-neon flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.35)] hover:bg-neon hover:text-black transition-all duration-300 group"
      >
        {isOpen ? (
          <span className="text-2xl font-bold leading-none">×</span>
        ) : (
          <span className="text-xl leading-none">▣</span>
        )}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full border border-neon/20 animate-ping pointer-events-none" />
        )}
      </button>

      {/* Panel de chat */}
      <div
        className={`fixed bottom-24 right-5 z-[120] w-[92vw] max-w-[420px] transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
      >
        <div className="relative cyber-panel border border-neon/30 bg-black/90 backdrop-blur-xl overflow-hidden shadow-[0_0_30px_rgba(57,255,20,0.15)] flex flex-col h-[70vh] max-h-[600px]">
          {/* Cabecera */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-neon/20 bg-neon/5 shrink-0">
            <div className="flex gap-2 items-center">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <div className="w-2 h-2 rounded-full bg-green-500/50" />
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neon/60">
              Asistente_IA // Online
            </div>
          </div>

          {/* Mensajes */}
          <div
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar text-sm"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl border leading-relaxed ${
                    m.role === "user"
                      ? "bg-neon/10 border-neon/30 text-neon"
                      : "bg-white/[0.03] border-white/10 text-neon/90"
                  }`}
                >
                  {m.role === "assistant" && !m.content && isStreaming ? (
                    <span className="animate-pulse text-neon">█</span>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-neon font-mono">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Entrada */}
          <div className="border-t border-neon/20 p-3 shrink-0 bg-black/60">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Escribe tu mensaje..."
                className="flex-grow bg-transparent outline-none resize-none text-neon caret-white placeholder:text-neon/30 font-mono text-sm max-h-32 px-2 py-1"
              />
              <button
                onClick={sendMessage}
                disabled={isStreaming || !input.trim()}
                className="shrink-0 px-3 py-1.5 border border-neon/40 text-neon text-xs font-bold uppercase tracking-widest hover:bg-neon hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neon transition-all rounded-lg"
              >
                {isStreaming ? "..." : "Enviar"}
              </button>
            </div>
            <div className="text-[8px] text-neon/20 uppercase tracking-widest text-center mt-2">
              Powered by Gemini · Las respuestas pueden contener errores
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
