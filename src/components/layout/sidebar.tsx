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
      {/* 모바일 오버레이 */}
      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onClose} />}

      {/* 사이드바 */}
      <aside
        className={`fixed top-14 left-0 z-40 flex h-[calc(100%-3.5rem)] w-56 flex-col border-r border-gray-100 bg-white transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <p className="text-xs text-gray-400">© 2026 YOO❤️JOO</p>
        </div>
      </aside>
    </>
  )
}
