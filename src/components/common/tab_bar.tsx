'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSyncAllAssets } from '@/queries/asset'

const TABS = [
  { label: '전체 요약', href: '/assets' },
  { label: '자산 구성', href: '/assets/table' },
  // { label: '소유자별', href: '/assets/owner' },
  // { label: '월납입 현황', href: '/assets/monthly' },
]

export default function TabBar() {
  const pathname = usePathname()
  const syncAllAssets = useSyncAllAssets()

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
      <div className="flex items-center gap-2 pb-2">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          투자 연동 자산의 예수금+주식 평가금액을 다시 계산해 반영해요
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => syncAllAssets.mutate()}
          disabled={syncAllAssets.isPending}
          title="투자 연동 자산 전체를 최신 시세 기준으로 동기화합니다"
        >
          <RefreshCw size={14} className={syncAllAssets.isPending ? 'animate-spin' : ''} />
          동기화
        </Button>
      </div>
    </div>
  )
}
