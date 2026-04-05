import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema - Gestão de Consultores",
  description: "Gerenciador completo de sub-consultores e ciclos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex h-screen bg-[#f4f7f6] overflow-hidden text-[#3a4651] font-sans selection:bg-[#3b82f6]/20">
        
        {/* Nova Layout Global em Grid Flexível */}
        <Sidebar />
        
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto w-full custom-scrollbar">
            {children}
          </main>
        </div>

      </body>
    </html>
  );
}
