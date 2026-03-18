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
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
