---
name: rendering-strategy
description: >
  Next.js App Router 기준 렌더링 전략 의사결정 스킬.
  새 페이지나 기능을 만들기 전에 반드시 이 스킬을 읽고
  올바른 렌더링 전략을 선택한다.
refs:
  - https://nextjs.org/docs/app/guides/rendering-philosophy
  - https://nextjs.org/docs/app/building-your-application/rendering/server-components
  - https://nextjs.org/docs/app/getting-started/server-and-client-components
  - https://tanstack.com/query/v5/docs/framework/react/guides/advanced-ssr
  - https://tanstack.com/query/v5/docs/framework/react/guides/invalidations-from-mutations
---

# 렌더링 전략 의사결정

## 핵심 원칙

모든 컴포넌트는 기본적으로 Server Component다.
`'use client'`는 반드시 필요한 경우에만 추가한다.

---

## 의사결정 흐름

```
이 데이터가 모든 유저에게 동일한가?
  ├→ YES → Static Rendering
  │         예: 블로그, 마케팅, 문서
  │
  └→ NO  → Dynamic RSC
            예: 마이페이지, 대시보드, 개인화 피드
            cookies(), headers(), searchParams 사용 시 자동 전환

인터랙션이 필요한가? (onClick, useState, 브라우저 API)
  ├→ NO  → Server Component 유지
  └→ YES → 해당 부분만 Client Component로 분리

mutation / refetch가 필요한가?
  └→ YES → RSC prefetch + React Query 조합
```

---

## Server Component vs Client Component

```
Server Component 유지:           Client Component 필요:
→ API 호출 (토큰 노출 없음)      → useState, useReducer
→ 개인화 데이터 (쿠키 기반)      → onClick, onChange
→ 번들 크기 줄여야 할 때         → useEffect
                                 → localStorage, window
```

---

## RSC prefetch + React Query 패턴

서버에서 초기 데이터를 prefetch하고 클라이언트에 캐시를 전달한다.
`queryOptions`로 key를 한 곳에서 관리해 서버/클라이언트 key를 통일한다.

```tsx
// features/user/queries.ts
export const userQueryOptions = (token?: string) => queryOptions({
  queryKey: ['user'],                          // 서버/클라이언트 동일한 key
  queryFn: () => apiClient.get('/user', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }),
})

// Server Component — 최초 prefetch
export default async function MyPage() {
  const session = await getSession()
  const queryClient = new QueryClient()        // 요청마다 새로 생성
  await queryClient.prefetchQuery(userQueryOptions(session.token))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyPageClient />
    </HydrationBoundary>
  )
}

// Client Component — 캐시에서 즉시 읽음 + mutation
'use client'
export function MyPageClient() {
  const { data: user } = useQuery(userQueryOptions())
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: (nickname: string) => apiClient.patch('/user', { nickname }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] }) // 동기화
    },
  })

  return <Profile user={user} onSave={mutate} />
}
```

---

## 주의사항

```
1. QueryClient는 요청마다 새로 생성
   → 파일 루트에 생성하면 모든 유저가 캐시 공유 → 개인 데이터 노출

2. staleTime을 0보다 크게 설정
   → 기본값 0이면 prefetch한 데이터를 클라이언트가 즉시 다시 요청

3. key에 토큰 포함 금지
   → 서버/클라이언트 key가 달라져 캐시 매칭 실패
   → queryKey: ['user'] ✅  /  queryKey: ['user', token] ❌
```