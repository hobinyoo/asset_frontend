'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const TABS = [
  { label: '전체 요약', href: '/investments' },
  { label: '투자 구성', href: '/investments/table' },
]

export default function InvestmentTabBar() {
  const pathname = usePathname()

  return (
    <div className="mb-4 flex gap-2 border-b">
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
