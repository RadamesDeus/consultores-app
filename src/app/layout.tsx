import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import styles from './layout.module.css'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Sistema - Gestão de Consultores",
  description: "Gerenciador completo de sub-consultores e ciclos.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className={styles.body}>
        <Sidebar />
        <div className={styles.contentWrapper}>
          <Header />
          <main className={styles.main}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
