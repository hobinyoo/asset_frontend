'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const TABS = [
  { label: '전체 요약', href: '/assets' },
  { label: '자산 구성', href: '/assets/table' },
  // { label: '소유자별', href: '/assets/owner' },
  // { label: '월납입 현황', href: '/assets/monthly' },
]

export default function TabBar() {
  const pathname = usePathname()

  return (
    <div className="flex gap-2 border-b mb-4">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-4 py-2 text-sm font-medium ${
            pathname === tab.href
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
