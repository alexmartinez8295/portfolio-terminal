import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Background from "@/components/Background";
import ThreeBackground from "@/components/ThreeBackground";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "AlxDev!",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="bg-black text-neon font-mono">
        {/* Capas de fondo (z-0). El contenido va en una capa relative z-10
            por encima; así el fondo se ve también en iOS/Safari, donde un
            z-index negativo fijo queda tapado por el fondo del body. */}
        <Background />
        <ThreeBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="p-4 sm:p-7 flex-grow pt-20 sm:pt-24">{children}</main>
          <Footer />
          <ChatWidget />
        </div>
      </body>
    </html>
  );
}