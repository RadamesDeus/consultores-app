'use client'

import Link from 'next/link'
import { LayoutDashboard, Users, RefreshCw, FileText, Settings, UserCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

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
    <aside className={styles.sidebar}>
      {/* Área do usuário */}
      <div className={styles.userBox}>
        <div className={styles.avatar}>
          <UserCircle className={styles.avatarIcon} />
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>Rita Rosy</span>
          <span className={styles.userRole}>
            Administrator
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mt-0.5">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </span>
        </div>
      </div>

      {/* Menu de navegação */}
      <div className={styles.nav}>
        <span className={styles.navLabel}>Opções Disponíveis</span>

        {links.map((link) => {
          const isActive = pathname === link.href
          const linkClass = isActive ? styles.navLinkActive : styles.navLink
          const iconClass = isActive ? styles.navIconActive : styles.navIcon

          let badgeClass = styles.badgeDefault
          if (isActive) badgeClass = styles.badgeActive
          else if (link.name === 'Pedidos') badgeClass = styles.badgeAlert

          return (
            <Link key={link.name} href={link.href} className={linkClass}>
              <div className={styles.navLinkInner}>
                <link.icon className={iconClass} />
                <span className={styles.navText}>{link.name}</span>
              </div>
              {link.badge && (
                <div className={badgeClass}>{link.badge}</div>
              )}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
