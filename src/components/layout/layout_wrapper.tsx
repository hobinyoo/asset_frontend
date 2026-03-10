'use client'

import { useState } from 'react'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen((v) => !v)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-h-screen pt-14 lg:pl-56">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </>
  )
}
