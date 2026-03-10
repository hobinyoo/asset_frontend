import { QueryClient, isServer } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (isServer) {
    // 서버: 매 요청마다 새 인스턴스 (유저간 데이터 격리)
    return makeQueryClient()
  }
  // 브라우저: 싱글톤 재사용 (Suspense 중 재생성 방지)
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}
