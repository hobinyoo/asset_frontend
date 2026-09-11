'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const TABS = [
  { label: '전체 요약', href: '/investments' },
  { label: '투자 구성', href: '/investments/accounts' },
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
