---
name: loading-error-handling
description: >
  Next.js App Router + TanStack Query 기준 로딩/에러 처리 스킬.
  로딩과 에러 UI를 작성할 때 반드시 이 스킬을 읽고
  올바른 방식을 선택한다.
refs:
  - https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
  - https://tanstack.com/query/v5/docs/framework/react/guides/suspense
---

# 로딩/에러 처리 규칙

## 핵심 원칙

Next.js는 `loading.tsx`와 `error.tsx`로 route 단위 로딩/에러를 자동 처리해준다.
페이지 일부 영역만 처리할 때는 `Suspense` + `ErrorBoundary`를 직접 쓴다.

---

## loading.tsx / error.tsx — route 단위 자동 처리

Next.js가 자동으로 Suspense, ErrorBoundary로 감싸준다.
별도 설정 없이 파일만 추가하면 동작한다.

```
app/
├── dashboard/
│   ├── loading.tsx   ← 페이지 전체 로딩 스켈레톤
│   ├── error.tsx     ← 페이지 전체 에러 UI
│   └── page.tsx
```

단, 페이지 전체가 로딩/에러 UI로 교체된다.
Header, Sidebar 같은 공통 UI도 함께 사라진다.

---

## Suspense + ErrorBoundary — 영역 단위 직접 처리

공통 UI는 유지하면서 특정 영역만 로딩/에러 처리할 때 사용한다.

```tsx
// ❌ loading.tsx 방식 — Header까지 사라짐
// loading.tsx: return <Skeleton />  → 페이지 전체 교체

// ✅ Suspense 방식 — Header는 유지
function Dashboard() {
  return (
    <>
      <Header />                           // 항상 유지
      <Sidebar />                          // 항상 유지
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Suspense fallback={<TableSkeleton />}>
          <DataTable />                    // 여기만 로딩/에러 처리
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
```

`ErrorBoundary`는 항상 `Suspense` 바깥에 감싼다.
`react-error-boundary` 패키지를 사용한다.

---

## useQuery vs useSuspenseQuery

기본은 `useQuery`다. 컴포넌트 안에서 `isLoading`, `isError`로 직접 처리한다.

```tsx
// 기본 — useQuery
function UserProfile() {
  const { data, isLoading, isError } = useQuery(userQueryOptions())
  if (isLoading) return <Skeleton />
  if (isError) return <Error />
  return <div>{data.name}</div>
}
```

레이아웃이 복잡하고 여러 영역을 각각 로딩/에러 처리해야 할 때
`useSuspenseQuery` 사용을 고려한다.
로딩/에러를 throw해서 바깥의 Suspense, ErrorBoundary가 잡게 한다.

```tsx
// 고려 — useSuspenseQuery (Suspense + ErrorBoundary 세트 필요)
function UserProfile() {
  const { data } = useSuspenseQuery(userQueryOptions())
  return <div>{data.name}</div>  // data가 항상 있음이 보장됨
}
```

**주의:** `useSuspenseQuery`는 prefetch 없이 쓰면 hydration mismatch가 발생할 수 있다.
Server Component에서 prefetch를 반드시 같이 설정한다.

---

## 선택 기준

```
페이지 전체를 교체해도 되는가?
  ├→ YES → loading.tsx / error.tsx
  └→ NO  → Suspense + ErrorBoundary 직접 사용

Suspense 쓰기로 했다면, 데이터 패칭은?
  ├→ 단순한 경우     → useQuery + isLoading/isError
  └→ 레이아웃 복잡   → useSuspenseQuery 고려
                       (prefetch 세트로 필수)
```

---

## 한눈에 정리

| 상황 | 방식 |
|---|---|
| 페이지 전체 로딩 | `loading.tsx` |
| 페이지 전체 에러 | `error.tsx` |
| 공통 UI 유지 + 일부만 로딩/에러 | `Suspense` + `ErrorBoundary` |
| 기본 데이터 패칭 | `useQuery` + `isLoading/isError` |
| 복잡한 레이아웃 데이터 패칭 | `useSuspenseQuery` (prefetch 필수) |