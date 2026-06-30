---
name: performance-optimization
description: >
  Next.js App Router 프로젝트의 성능 최적화 기법을 다루는 스킬.
  preload/prefetch/preconnect, Code Splitting, LCP/FCP/TTFB 개선이 필요할 때 반드시 사용.
  "왜 느려", "LCP 개선", "번들 줄이기", "preload", "prefetch", "Link 컴포넌트",
  "lazy load", "dynamic import", "이미지 최적화", "폰트 최적화" 키워드가 나오면 즉시 참조.
---

# Performance Optimization — Next.js App Router

지표 측정(→ performance-measurement 스킬)으로 병목을 발견했다면,
이 스킬에서 **어떤 기법으로 고치는지** 찾는다.

---

## 전체 지도 — 증상별 기법 찾기

| 증상 | 원인 | 기법 |
|---|---|---|
| LCP 느림 | 히어로 이미지 우선순위 낮음 | `<Image priority />` + `fetchpriority` |
| LCP 느림 | CSS background-image | `preload`로 직접 알림 |
| FCP/TTFB 느림 | 외부 폰트/CDN 연결 지연 | `preconnect` |
| TTFB 높음 | DB 직렬 호출 | `Promise.all()` 병렬 패칭 |
| First Load JS 큼 | 모든 코드 한 번에 로드 | `dynamic()` lazy load |
| First Load JS 큼 | `'use client'` 남용 | Server Component로 전환 |
| 페이지 전환 느림 | JS 청크 미리 없음 | `<Link>` prefetch 활용 |
| 서드파티 도메인 많음 | DNS 조회 반복 | `dns-prefetch` |

---

## 1. 연결 최적화 — preconnect / dns-prefetch

React 앱은 번들을 받고 나서 외부 서버(폰트, API, CDN)에 요청을 시작한다.
이때 DNS + TCP + TLS 연결 비용이 추가로 붙는다.
`preconnect`는 이 연결을 미리 맺어둬서 그 대기 시간을 없앤다.

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* 크리티컬 외부 서버 — DNS + TCP + TLS 미리 연결 */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* 우선순위 낮은 서드파티 — DNS 조회만 */}
        <link rel="dns-prefetch" href="https://cdn.analytics.com" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

**언제 무엇을 쓰는가**

| | preconnect | dns-prefetch |
|---|---|---|
| 하는 일 | DNS + TCP + TLS | DNS 조회만 |
| 비용 | 중간 | 저렴 |
| 쓸 때 | Google Fonts, API 서버 등 크리티컬 | analytics, 광고 등 나중에 쓰이는 도메인 |

> `crossOrigin="anonymous"` — 폰트처럼 CORS로 fetch되는 리소스는 이게 없으면
> 미리 맺어둔 연결을 재사용 안 하고 새 연결을 따로 연다. 반드시 붙일 것.

> preconnect를 너무 많이 쓰면 오히려 대역폭 낭비. 진짜 크리티컬한 곳에만.

---

## 2. LCP 이미지 최적화

### Next.js `<Image>` 컴포넌트 — 히어로 이미지

```tsx
import Image from 'next/image'

// priority → fetchpriority="high" + preload 자동 처리
// LCP 후보 이미지에는 반드시 priority 붙이기
<Image
  src="/hero.jpg"
  priority          // ← 이것만 추가하면 됨
  alt="히어로"
  width={1200}
  height={600}
/>
```

`priority` prop 하나로 Next.js가 알아서:
- `fetchpriority="high"` 설정
- `<link rel="preload">` 자동 삽입
- `loading="lazy"` 제거

### CSS background-image — Next.js가 못 잡는 케이스

`<Image>`로 처리 못 하는 CSS 배경 이미지 LCP 후보는 직접 preload 추가.

```tsx
// app/layout.tsx 또는 해당 페이지
<head>
  <link rel="preload" href="/hero.jpg" as="image" fetchPriority="high" />
</head>
```

```css
/* 이 이미지가 LCP 후보면 위의 preload가 필요 */
.hero {
  background-image: url('/hero.jpg');
}
```

---

## 3. Code Splitting — dynamic()

Next.js는 라우트 기반 Code Splitting을 자동으로 해준다.
그 위에 `dynamic()`으로 컴포넌트 단위 lazy load를 추가한다.

```tsx
import dynamic from 'next/dynamic'

// 모달 — 클릭할 때만 로드
const LoginModal = dynamic(() => import('./LoginModal'), {
  loading: () => <p>Loading...</p>,
})

// 브라우저 전용 라이브러리 (window, document 사용)
const Chart = dynamic(() => import('./Chart'), { ssr: false })

// 무거운 에디터 — 뷰포트 진입 시 로드
const RichEditor = dynamic(() => import('./RichEditor'))
```

**언제 dynamic()을 쓰는가**

```plain text
✅ 클릭/인터랙션 후에만 나타나는 컴포넌트 (모달, 드로어)
✅ 브라우저 전용 라이브러리 (지도, 차트, 에디터)
✅ 초기 뷰포트에 없는 무거운 컴포넌트

❌ 항상 보이는 컴포넌트 (오히려 로딩 깜빡임 생김)
❌ 작은 컴포넌트 (HTTP 요청 오버헤드가 더 큼)
```

### 'use client' 남용 줄이기

First Load JS를 줄이는 가장 효과적인 방법.

```tsx
// ❌ 페이지 전체가 클라이언트 번들에 포함됨
'use client'
export default function Page() {
  const data = await fetch('/api/data') // 이것 때문에 'use client' 아님
  return (
    <div>
      <HeavyStaticContent data={data} />
      <LikeButton />  {/* 이것 때문에 'use client' 붙인 경우 */}
    </div>
  )
}

// ✅ 'use client'를 말단 컴포넌트로 내리기
// page.tsx — Server Component 유지
export default async function Page() {
  const data = await fetch('/api/data')
  return (
    <div>
      <HeavyStaticContent data={data} />
      <LikeButton />  {/* LikeButton 내부에서만 'use client' */}
    </div>
  )
}
```

---

## 4. `<Link>` prefetch — 페이지 전환 최적화

```tsx
import Link from 'next/link'

// viewport에 들어오면 /dashboard 청크 자동 prefetch
<Link href="/dashboard">대시보드</Link>

// 데이터 절약이 필요한 경우만 비활성화
<Link href="/dashboard" prefetch={false}>대시보드</Link>
```

```plain text
사용자가 Link를 보는 순간  → /dashboard 청크 미리 다운로드 (백그라운드)
사용자가 Link를 클릭하는 순간 → 이미 받아둔 청크 즉시 사용 → 즉각 전환
```

> 개발 환경에서는 prefetch 동작 안 함. `npm run build && npm run start`로 확인.

---

## 5. TTFB 개선 — 서버 컴포넌트 데이터 패칭

```tsx
// ❌ 직렬 호출 — user 끝나야 posts 시작
async function Page() {
  const user = await getUser()       // 200ms
  const posts = await getPosts()     // 200ms
  // 총 400ms
}

// ✅ 병렬 호출
async function Page() {
  const [user, posts] = await Promise.all([
    getUser(),    // 200ms
    getPosts(),   // 200ms 동시 실행
  ])
  // 총 200ms
}
```

TTFB가 여전히 높으면 → `loading.tsx` + Suspense로 스트리밍:

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />
}

// app/dashboard/page.tsx
export default async function Page() {
  const data = await getSlowData() // 느려도 스켈레톤 먼저 보임
  return <Dashboard data={data} />
}
```

---

## 6. 최적화 적용 순서

```plain text
1. 측정 먼저 (performance-measurement 스킬)
   → Lighthouse로 어느 지표가 문제인지 확인

2. LCP 느리면
   → <Image priority /> 붙었는지 확인
   → CSS background-image면 preload 추가
   → 외부 폰트/CDN이면 preconnect 추가

3. First Load JS 크면
   → 'use client' 위치 확인 → 말단으로 내리기
   → dynamic()으로 무거운 컴포넌트 lazy load

4. TTFB 높으면
   → Promise.all() 병렬 패칭으로 전환
   → loading.tsx + Suspense 스트리밍

5. 페이지 전환 느리면
   → <Link prefetch={false}>로 꺼뒀는지 확인

6. 다시 측정 → 개선 확인
```