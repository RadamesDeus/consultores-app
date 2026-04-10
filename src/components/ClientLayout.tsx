'use client'

import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import styles from '@/app/layout.module.css'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className={styles.contentWrapper}>
        <Header onMenuClick={toggleSidebar} />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </>
  )
}
