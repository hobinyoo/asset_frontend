'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/assets', label: '자산', icon: '💰' },
  { href: '/debts', label: '부채', icon: '📉' },
  { href: '/investments', label: '투자', icon: '📈' },
  { href: '/reports', label: '리포트', icon: '🤖' },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="sidebar-nav"
        aria-label="주요 메뉴"
        className={`fixed left-0 top-14 z-40 flex h-[calc(100%-3.5rem)] w-56 flex-col border-r border-border bg-background transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        <nav aria-label="내비게이션" className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <footer className="border-t border-border p-4">
          <p className="text-label text-muted-foreground">© 2026 부자되기❤️</p>
        </footer>
      </aside>
    </>
  )
}
