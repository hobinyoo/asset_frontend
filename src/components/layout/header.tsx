'use client'

import { useLogout } from '@/queries/auth'

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { mutate: logout, isPending } = useLogout()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-gray-100 bg-white px-6">
      <span className="text-base font-bold text-gray-900">자산관리</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => logout()}
          disabled={isPending}
          className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-50"
        >
          로그아웃
        </button>
        {/* 모바일 햄버거 */}
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          ☰
        </button>
      </div>
    </header>
  )
}
