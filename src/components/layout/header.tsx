'use client'

import Link from 'next/link'
import { useLogout } from '@/queries/auth'
import { Button } from '@/components/ui/button'

export default function Header({
  menuOpen,
  onMenuClick,
}: {
  menuOpen: boolean
  onMenuClick: () => void
}) {
  const { mutate: logout, isPending } = useLogout()

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <Link href="/" className="font-display text-base font-medium leading-[1.4] text-foreground">
        부자되기❤️
      </Link>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          disabled={isPending}
          aria-label="로그아웃"
        >
          로그아웃
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
          aria-controls="sidebar-nav"
          className="lg:hidden"
        >
          ☰
        </Button>
      </div>
    </header>
  )
}
