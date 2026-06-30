---
name: component-design
description: >
  컴포넌트 설계 원칙. 새 컴포넌트/모달/폼 작성 또는 리팩터링 시 사용.
  shadcn + cva + cn 스택 기준.
---

# 컴포넌트 설계 원칙

## 1. 단일 책임 — 컴포넌트는 하나의 일만

데이터 패칭은 React Query 훅, UI는 컴포넌트. 절대 섞지 않는다.

```tsx
// ❌ 컴포넌트가 직접 fetch
function ProductModal() {
  useEffect(() => { fetch('/api/products')... }, [])
}

// ✅ 훅이 데이터, 컴포넌트는 UI만
function ProductModal() {
  const { data } = useProducts()
  const postProduct = usePostProduct()
}
```

컴포넌트가 길어지면 역할 기준으로 분리:
- 데이터 로직 → 커스텀 훅으로
- 반복되는 UI 조각 → 공통 컴포넌트로

---

## 2. props는 필요한 것만

객체 전체를 넘기지 말고, 실제로 쓰는 필드만 받는다.

```tsx
// ❌ 객체 전체
function ProductRow({ product }: { product: Product }) {
  return <div>{product.name}</div>
}

// ✅ 필요한 것만
function ProductRow({ name }: { name: string }) {
  return <div>{name}</div>
}
```

---

## 3. 불변성 — 원본 데이터를 직접 바꾸지 않는다

React는 참조가 바뀌었는지로 리렌더링을 감지한다.

```tsx
// ❌ 원본 변경 → 리렌더링 안 됨
user.age = 21
setUser(user)

// ✅ 새 객체 생성 → 리렌더링 됨
setUser({ ...user, age: 21 })

// ❌ 배열 직접 변경
items.push(newItem)

// ✅ 새 배열
setItems([...items, newItem])
setItems(items.filter(item => item.id !== id))
setItems(items.map(item => item.id === id ? { ...item, done: true } : item))
```

---

## 4. 순수 컴포넌트 — 같은 props면 항상 같은 UI

컴포넌트는 순수 함수처럼. 사이드 이펙트는 useEffect 안으로 격리.

```tsx
// ✅ 순수한 컴포넌트 — 같은 props → 항상 같은 UI
function UserCard({ name, score }: { name: string; score: number }) {
  return <div>{name}: {score.toLocaleString()}점</div>
}

// ✅ 사이드 이펙트는 useEffect 안으로
function ProductTable() {
  useEffect(() => {
    document.title = '상품 목록'
    return () => { document.title = '홈' }
  }, [])
}
```

---

## 5. Strategy 패턴 — if/else 대신 객체 lookup

조건이 많아지면 if/else 체인 대신 객체로 매핑한다.

```tsx
// ❌ if/else 체인
function StatusBadge({ status }: { status: Status }) {
  if (status === 'PENDING')  return <Badge variant="warning">대기</Badge>
  if (status === 'ACTIVE')   return <Badge variant="success">활성</Badge>
  if (status === 'INACTIVE') return <Badge variant="secondary">비활성</Badge>
  if (status === 'DELETED')  return <Badge variant="destructive">삭제</Badge>
}

// ✅ 객체 lookup
const STATUS_MAP: Record<Status, { label: string; variant: BadgeVariant }> = {
  PENDING:  { label: '대기',   variant: 'warning' },
  ACTIVE:   { label: '활성',   variant: 'success' },
  INACTIVE: { label: '비활성', variant: 'secondary' },
  DELETED:  { label: '삭제',   variant: 'destructive' },
}

function StatusBadge({ status }: { status: Status }) {
  const { label, variant } = STATUS_MAP[status]
  return <Badge variant={variant}>{label}</Badge>
}
```

새 상태 추가 시 객체에만 추가하면 됨. 컴포넌트 수정 불필요.

---

## 6. 훅 합성 — 로직은 커스텀 훅으로 분리

컴포넌트가 길어지면 관련 로직을 커스텀 훅으로 추출한다.

```tsx
// ❌ 컴포넌트 안에 로직 혼재
function ProductTable() {
  const [page, setPage] = useState(1)
  const { data } = useProducts({ page })
  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE)
  // + UI 렌더링...
}

// ✅ 로직은 훅으로
function useProductTable() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useProducts({ page })
  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE)
  return { data, isLoading, page, setPage, totalPages }
}

function ProductTable() {
  const { data, isLoading, page, setPage, totalPages } = useProductTable()
  // UI만
}
```

---

## 7. shadcn + cva — variant는 토큰 기반으로

컴포넌트 variant는 cva로 정의하고, 색상은 반드시 shadcn 토큰을 참조한다.
하드코딩 색상(`color="blue"`)은 사용하지 않는다.

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badge = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default:     "bg-primary text-primary-foreground",
        secondary:   "bg-secondary text-secondary-foreground",
        success:     "bg-success text-success-foreground",
        warning:     "bg-warning text-warning-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// VariantProps로 타입 자동 추론
interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {}

export function Badge({ variant, className, ...props }: BadgeProps) {
  return <span className={cn(badge({ variant }), className)} {...props} />
}
```

```tsx
// ✅ 사용
<Badge variant="success">활성</Badge>
<Badge variant="warning">대기</Badge>

// ❌ 하드코딩
<Badge color="green">활성</Badge>
```

---

## 8. cn — 외부 className은 항상 cn으로 병합

외부에서 className을 받을 때 반드시 cn으로 병합한다.
클래스 충돌을 tailwind-merge가 자동으로 해결한다.

```tsx
// ❌ 단순 문자열 병합 — 충돌 발생
className={`bg-primary ${className}`}

// ✅ cn으로 병합 — 충돌 해결
className={cn("bg-primary", className)}
```

---

## 9. 클린 코드

**Early return으로 중첩 줄이기**
```tsx
// ❌
if (isLoading) {
  if (data) { return <List /> }
  else { return <Empty /> }
}

// ✅
if (isLoading && !data) return <Spinner />
if (!data?.length) return <Empty />
return <List data={data} />
```

**이름은 의도가 드러나게**
```tsx
const [f, setF] = useState(false)                              // ❌
const [isModalOpen, setIsModalOpen] = useState(false)          // ✅

const d = new Date()                                           // ❌
const currentDate = new Date()                                 // ✅
```

**매직 넘버는 상수로**
```tsx
if (value < 1 || value > 31)                                   // ❌

const MIN_DAY = 1
const MAX_DAY = 31
if (value < MIN_DAY || value > MAX_DAY)                        // ✅
```

**주석은 Why만**
```tsx
// ❌ 코드 설명 (필요 없음)
// 카테고리 선택 필드 렌더링

// ✅ 이유가 비명백할 때만
// Radix Select가 이 클릭을 선택 이벤트로 처리하지 못하게 막음
onPointerDown={(e) => { e.preventDefault(); e.stopPropagation() }}
```