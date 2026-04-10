import { Bell, Search, Grip, Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import FastOrderModal from './FastOrderModal'
import styles from './Header.module.css'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()

  const titles: Record<string, string> = {
    '/': 'Dashboard Principal',
    '/pedidos': 'Extrato de Pedidos',
    '/subconsultores': 'Equipe (Sub-consultores)',
    '/ciclos': 'Gestão de Ciclos',
  }

  const currentTitle = titles[pathname] || 'Visão Geral'

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div className={styles.title}>{currentTitle}</div>
      </div>

      <div className={styles.actions}>
        <div className={styles.fastOrderWrapper}>
          <FastOrderModal customButton={true} />
        </div>

        <button className={`${styles.iconBtn} ${styles.bellIcon} hidden md:block`}>
          <Bell className={styles.icon} />
          <span className={styles.bellDot} />
        </button>

        <button className={`${styles.iconBtn} hidden md:block`}>
          <Search className={styles.icon} />
        </button>

        <button className={`${styles.iconBtn} ml-2`}>
          <Grip className={styles.icon} />
        </button>
      </div>
    </header>
  )
}
