import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Background from "@/components/Background";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="bg-black text-neon font-mono flex flex-col min-h-screen">
        <Background />
        <Navbar />
        <main className="p-4 sm:p-7 flex-grow pt-20 sm:pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  );
}