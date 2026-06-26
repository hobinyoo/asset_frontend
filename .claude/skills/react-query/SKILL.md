---
name: react-query
description: 이 프로젝트의 React Query 패턴. 쿼리 키 관리, useQuery/useMutation 작성, invalidate 규칙. src/queries/ 작업 시 사용.
---

# React Query 패턴

## 레이어 구조

```
src/api/       ← axios 기반 순수 fetch 함수. 상태 없음
    ↓
src/queries/   ← React Query 훅. useQuery / useMutation
    ↓
src/components/ ← 훅 호출해서 UI 렌더링
```

`src/api/`는 React Query를 모른다. 단순히 API를 호출하고 결과를 반환한다.
`src/queries/`가 `src/api/`를 감싸서 캐싱/상태를 추가한다.

---

## 쿼리 키 패턴 (*_KEYS)

모든 도메인은 `*_KEYS` 객체로 쿼리 키를 중앙 관리한다.

```ts
// src/queries/asset.ts
export const ASSET_KEYS = {
  all: ['assets'] as const,
  list: (page?: number) => [...ASSET_KEYS.all, 'list', page] as const,
  detail: (id: number) => [...ASSET_KEYS.all, 'detail', id] as const,
  summary: () => [...ASSET_KEYS.all, 'summary'] as const,
}
```

**계층 구조 규칙:**
```
ASSET_KEYS.all                     → ['assets']
ASSET_KEYS.list(0)                 → ['assets', 'list', 0]
ASSET_KEYS.detail(1)               → ['assets', 'detail', 1]
```

`invalidateQueries({ queryKey: ASSET_KEYS.all })` 하면 하위 키 전체 무효화된다.

---

## useQuery

```ts
export const useGetAssets = (page = 0, size = 10) =>
  useQuery({
    queryKey: ASSET_KEYS.list(page),
    queryFn: () => getAssets(page, size),
  })

export const useGetAsset = (id: number) =>
  useQuery({
    queryKey: ASSET_KEYS.detail(id),
    queryFn: () => getAsset(id),
  })
```

---

## useMutation + invalidateQueries

mutation 성공 시 관련 키를 `invalidateQueries`로 무효화한다.
**범위는 항상 `all` 키로** — 관련 목록/상세/요약 전부 자동 갱신된다.

```ts
export const usePostAsset = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AssetCreateRequest) => postAsset(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
    },
  })
}

export const useDeleteAsset = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
    },
  })
}
```

---

## 새 도메인 추가 템플릿

```ts
// src/queries/[domain].ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getItems, postItem, putItem, deleteItem } from '@/api/[domain]'
import type { ItemCreateRequest, ItemUpdateRequest } from '@/types/[domain]'

export const ITEM_KEYS = {
  all: ['items'] as const,
  list: (page?: number) => [...ITEM_KEYS.all, 'list', page] as const,
  detail: (id: number) => [...ITEM_KEYS.all, 'detail', id] as const,
}

export const useGetItems = (page = 0) =>
  useQuery({
    queryKey: ITEM_KEYS.list(page),
    queryFn: () => getItems(page),
  })

export const usePostItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ItemCreateRequest) => postItem(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.all })
    },
  })
}
```

---

## 컴포넌트에서 사용

```tsx
'use client'

export default function AssetTable() {
  const { data, isLoading } = useGetAssets(page)
  const deleteAsset = useDeleteAsset()

  if (isLoading) return <Skeleton />

  return (
    <>
      {data?.content.map(asset => (
        <AssetRow
          key={asset.id}
          onDelete={() => deleteAsset.mutate(asset.id)}
        />
      ))}
    </>
  )
}
```

---

## 규칙 요약

| 규칙 | 내용 |
|------|------|
| 키 관리 | `*_KEYS` 객체로 중앙화, `as const` 필수 |
| invalidate 범위 | `all` 키로 — 관련 쿼리 전체 무효화 |
| api/ vs queries/ | api/는 순수 fetch, queries/가 React Query 래핑 |
| 컴포넌트 | 훅 호출만. queryClient 직접 사용 금지 |
