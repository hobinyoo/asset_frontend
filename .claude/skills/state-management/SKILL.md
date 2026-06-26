---
name: state-management
description: >
  클라이언트/서버 상태 관리 도구 선택 기준.
  Zustand, Jotai, Context API, React Query 언제 무엇을 쓸지 결정할 때 사용.
---

# 상태 관리 가이드

## 서버 상태 vs 클라이언트 상태

상태를 두 가지로 먼저 분류한다.

```
서버 상태        — API에서 오는 데이터. 캐싱, 동기화, 재검증이 필요
클라이언트 상태  — 서버와 무관한 순수 UI 상태
```

---

## 도구 선택 기준

```
API 데이터, 캐시, 비동기    → React Query
모달 open/close, 폼 입력    → useState (로컬)
앱 전체 공유 클라이언트 상태 → Zustand (전역)
서브트리 독립 상태           → Zustand + Context 패턴
인스턴스 주입               → Context API (DI 전용)
atom 단위 세밀한 구독        → Jotai
```

---

## React Query — 서버 상태 전담

모든 API 데이터는 React Query로 관리한다.
로딩/에러/캐시/재검증을 자동으로 처리해준다.

```tsx
// queries/product.ts
export const PRODUCT_KEYS = {
  all: () => ['products'] as const,
  list: (params) => [...PRODUCT_KEYS.all(), params] as const,
  detail: (id: string) => [...PRODUCT_KEYS.all(), id] as const,
}

export function useProducts(params) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () => fetchProducts(params),
  })
}

export function usePostProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all() })
    },
  })
}
```

---

## useState — 로컬 UI 상태

한 컴포넌트 안에서만 쓰이는 UI 상태. 끌어올릴 필요 없으면 useState로 충분하다.

```tsx
// 모달 열림 상태, 현재 페이지, 선택된 탭 등
const [isOpen, setIsOpen] = useState(false)
const [page, setPage] = useState(1)
const [activeTab, setActiveTab] = useState('overview')
```

---

## Zustand — 전역 클라이언트 상태

앱 전체에서 공유하는 클라이언트 상태에 사용. 로그인 유저, 테마 등.

```tsx
// store/auth.ts
const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  actions: {
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),
  },
}))

// atomic selector — 필요한 것만 구독해서 리렌더링 최소화
export const useUser = () => useAuthStore((state) => state.user)
export const useAuthActions = () => useAuthStore((state) => state.actions)
```

---

## Zustand + Context — 서브트리 독립 상태

같은 컴포넌트를 여러 번 재사용하거나, props로 초기화가 필요할 때.
전역 store 대신 `createStore()`로 인스턴스를 만들어 Context에 주입한다.

```tsx
// create()      → 전역 store + hook 한번에
// createStore() → store 인스턴스만 (컴포넌트 안에서 사용 가능)

const FilterStoreContext = createContext(null)

function FilterStoreProvider({ children, initialFilter }) {
  const [store] = useState(() =>
    createStore((set) => ({
      filter: initialFilter,  // props로 진짜 초기화 가능
      setFilter: (filter) => set({ filter }),
    }))
  )

  return (
    <FilterStoreContext.Provider value={store}>
      {children}
    </FilterStoreContext.Provider>
  )
}

// 각 인스턴스가 독립적인 store
<FilterStoreProvider initialFilter="all">
  <FilterPanel />  // 자신만의 store
</FilterStoreProvider>

<FilterStoreProvider initialFilter="active">
  <FilterPanel />  // 독립적인 store
</FilterStoreProvider>
```

**언제 이 패턴?**
- 같은 컴포넌트를 한 페이지에 여러 번 렌더링
- store를 props로 초기화해야 할 때
- 테스트 격리가 필요할 때

---

## Context API — DI(의존성 주입) 전용

Context는 상태 저장 용도가 아니다.
store 인스턴스, QueryClient 같은 **인스턴스를 서브트리에 주입**하는 용도로만 쓴다.

```tsx
// ✅ Context의 올바른 용도 — 인스턴스 주입
<QueryClientProvider client={queryClient}>
<ThemeProvider theme={theme}>

// ❌ Context의 잘못된 용도 — 자주 바뀌는 상태 저장
const [count, setCount] = useState(0)
<CountContext.Provider value={{ count, setCount }}>
// count 바뀔 때마다 모든 consumer 리렌더링
```

**Context로 상태 관리하면 안 되는 이유:**
- selector 패턴 없음 — 일부만 써도 전체 바뀌면 리렌더링
- 객체 리터럴 직접 넣으면 매 렌더마다 새 참조 → 항상 리렌더링

```tsx
// ❌ 매 렌더링마다 새 객체 → 항상 리렌더링
<MyContext.Provider value={{ user, theme }}>

// ✅ 참조 고정
const [ctx] = useState({ user, theme })
<MyContext.Provider value={ctx}>
```

---

## 한눈에 정리

| 상황 | 도구 |
|---|---|
| API 데이터, 서버 동기화 | React Query |
| 컴포넌트 내부 UI 상태 | useState |
| 앱 전체 공유 (로그인, 테마) | Zustand `create()` |
| 재사용 컴포넌트 독립 상태 | Zustand + Context |
| 인스턴스 주입 | Context API |