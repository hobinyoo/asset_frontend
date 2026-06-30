import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import QueryProvider from '@/providers/query_provider'
import ConditionalLayout from '@/components/layout/conditional_layout'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-family-display',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-family-sans',
})

export const metadata: Metadata = {
  title: '부자되기❤️',
  description: '개인 자산 관리 서비스',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
        >
          본문 바로가기
        </a>
        <QueryProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </QueryProvider>
      </body>
    </html>
  )
}
