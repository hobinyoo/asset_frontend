'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const TABS = [
  { label: '전체 요약', href: '/investments' },
  { label: '계좌 정보', href: '/investments/accounts' },
  { label: '투자상세', href: '/investments/detail' },
  { label: '실시간 현황', href: '/investments/realtime' },
]

export default function InvestmentTabBar() {
  const pathname = usePathname()

  return (
    <div className="mb-4 flex items-center justify-between border-b">
      <div className="flex gap-2">
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
      <span className="hidden pb-2 text-xs text-muted-foreground sm:inline">
        30초마다 현재가를 반영해 자동으로 갱신돼요
      </span>
    </div>
  )
}
