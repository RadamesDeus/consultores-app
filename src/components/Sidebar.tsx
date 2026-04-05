'use client'

import Link from 'next/link'
import { LayoutDashboard, Users, RefreshCw, FileText, Settings, UserCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, badge: null },
    { name: 'Pedidos', href: '/pedidos', icon: FileText, badge: '9' },
    { name: 'Consultores', href: '/subconsultores', icon: Users, badge: '4' },
    { name: 'Ciclos', href: '/ciclos', icon: RefreshCw, badge: null },
    { name: 'Configurações', href: '/configuracoes', icon: Settings, badge: null },
  ]

  return (
    <aside className="w-64 bg-white border-r border-[#eaedf1] flex flex-col h-full shrink-0">
      {/* Box do Usuário (Top Left Corner) */}
      <div className="h-[72px] border-b border-[#eaedf1] flex items-center px-6 gap-3 pt-2 pb-2">
        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center relative shadow-inner">
           <UserCircle className="w-10 h-10 text-slate-400 absolute" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#3a4651] tracking-wider uppercase">Rita Rosy</span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider flex items-center gap-1 cursor-pointer hover:text-slate-600">
            Administrator 
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mt-0.5"><path d="m6 9 6 6 6-6"/></svg>
          </span>
        </div>
      </div>

      {/* Menu Options */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-3 pb-3">Opções Disponíveis</span>
        
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex items-center justify-between px-3 py-3 rounded-md transition-colors ${isActive ? 'text-[#2d7ff9] font-bold bg-[#f4f7f6]' : 'text-[#6b778c] hover:bg-slate-50 font-semibold'}`}
            >
              <div className="flex items-center gap-4">
                <link.icon className={`w-5 h-5 ${isActive ? 'text-[#2d7ff9]' : 'text-slate-400'}`} />
                <span className="tracking-wide text-sm">{link.name}</span>
              </div>
              {link.badge && (
                <div className={`text-[10px] rounded px-1.5 py-0.5 font-bold ${
                  isActive 
                  ? 'bg-[#2d7ff9] text-white' 
                  : (link.name === 'Pedidos' ? 'bg-[#ff9f1a] text-white' : 'bg-[#475569] text-white')
                }`}>
                  {link.badge}
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
