import type { Metadata } from 'next'
import QueryProvider from '@/providers/query_provider'
import ConditionalLayout from '@/components/layout/conditional_layout'
import './globals.css'

export const metadata: Metadata = {
  title: 'YOO❤️JOO 자산관리',
  description: '개인 자산 관리 서비스',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50">
        <QueryProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </QueryProvider>
      </body>
    </html>
  )
}
