'use client'

import { usePathname } from 'next/navigation'
import LayoutWrapper from '@/components/layout/layout_wrapper'

const AUTH_PATHS = ['/login', '/signup']

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PATHS.includes(pathname)

  if (isAuthPage) return <>{children}</>

  return <LayoutWrapper>{children}</LayoutWrapper>
}
