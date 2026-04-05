'use client'

import { Bell, Search, Grip, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'
import FastOrderModal from './FastOrderModal'

export default function Header() {
  const pathname = usePathname()
  
  // Mapping paths to titles
  const titles: Record<string, string> = {
    '/': 'Dashboard Principal',
    '/pedidos': 'Extrato de Pedidos',
    '/subconsultores': 'Equipe (Sub-consultores)',
    '/ciclos': 'Gestão de Ciclos',
  }
  
  const currentTitle = titles[pathname] || 'Visão Geral'

  return (
    <header className="h-[72px] bg-[#3b82f6] text-white flex items-center justify-between px-8 shrink-0">
      <div className="text-lg tracking-wide opacity-90 drop-shadow-sm font-medium">
        {currentTitle}
      </div>

      <div className="flex items-center gap-6">
        
        {/* Usando o FastOrderModal aqui com design mais integrado ao header */}
        <div className="hidden md:block">
           <FastOrderModal customButton={true} />
        </div>

        <button className="relative bg-transparent hover:bg-white/10 p-2 rounded-full transition-colors hidden md:block">
          <Bell className="w-5 h-5 text-white/90" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff5252] rounded-full border border-[#3b82f6]"></span>
        </button>
        <button className="bg-transparent hover:bg-white/10 p-2 rounded-full transition-colors">
          <Search className="w-5 h-5 text-white/90" />
        </button>
        <button className="bg-transparent hover:bg-white/10 p-2 rounded-full transition-colors ml-2">
          <Grip className="w-5 h-5 text-white/90" />
        </button>
      </div>
    </header>
  )
}
