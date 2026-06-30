---
name: performance-measurement
description: >
  Next.js App Router 프로젝트의 성능 지표를 측정하고 분석하는 스킬.
  번들 사이즈, Web Vitals(FCP/LCP/TTI), TTFB, Lighthouse 점수 측정이 필요할 때 반드시 사용.
  "성능 측정", "번들 크기", "FCP/LCP 확인", "Lighthouse", "TTFB 느려", "왜 느려",
  "최적화하고 싶어", "빌드 분석" 같은 키워드가 나오면 즉시 이 스킬을 참조.
---

# Performance Measurement — Next.js App Router

Next.js App Router 프로젝트에서 **번들 사이즈 / Web Vitals / TTFB / Lighthouse** 를
측정하는 전체 플로우를 다룬다.

---

## 1. 번들 사이즈 측정

### @next/bundle-analyzer (가장 빠른 방법)

```bash
pnpm add @next/bundle-analyzer
```

```js
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer({})
```

```bash
ANALYZE=true pnpm build
# → 브라우저에서 트리맵 자동 열림
# client.html  : 클라이언트 번들
# server.html  : 서버 번들
# edge.html    : Edge 런타임 번들
```

### 빌드 출력으로 빠른 확인

```bash
pnpm build
# Route (app)          Size    First Load JS
# ┌ ○ /               5.2 kB        87.4 kB
# └ ○ /about          1.1 kB        83.3 kB
# + First Load JS shared by all: 83.3 kB
```

**판단 기준**
| First Load JS | 평가 |
|---|---|
| < 100 kB | 🟢 좋음 |
| 100–200 kB | 🟡 주의 |
| > 200 kB | 🔴 개선 필요 |

### 자동화 — CI에서 번들 크기 추적

```bash
pnpm add -D bundlesize
```

```json
// package.json
"bundlesize": [
  { "path": ".next/static/chunks/pages/*.js", "maxSize": "150 kB" }
]
```

---

## 2. Web Vitals 측정 (FCP / LCP / TTI / CLS / INP)

### 코드에서 직접 수집 — `web-vitals` 라이브러리

```bash
pnpm add web-vitals
```

```tsx
// app/layout.tsx  (또는 별도 WebVitals 컴포넌트)
'use client'
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric)
    // metric.name: 'FCP' | 'LCP' | 'CLS' | 'INP' | 'TTFB'
    // metric.value: 측정값 (ms 또는 점수)
    // metric.rating: 'good' | 'needs-improvement' | 'poor'
  })
  return null
}
```

> **TTI 주의**: TTI는 web-vitals v3+에서 제거됨.
> 대신 **INP (Interaction to Next Paint)** 가 Core Web Vitals 대체 지표.
> TTI 개념적 확인은 DevTools Performance 탭에서 한다.

### 페이지별 측정 — `usePathname()` 조합

pathname을 같이 붙여서 어느 페이지가 느린지 특정할 수 있다.

```tsx
// app/_components/WebVitals.tsx
'use client'
import { useReportWebVitals } from 'next/web-vitals'
import { usePathname } from 'next/navigation'

export function WebVitals() {
  const pathname = usePathname()

  useReportWebVitals((metric) => {
    console.log({
      page: pathname,         // '/dashboard', '/home' 등
      metric: metric.name,   // 'FCP' | 'LCP' | 'TTFB' | 'INP' | 'CLS'
      value: metric.value,   // ms 또는 점수
      rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    })

    // 외부 엔드포인트로 전송 (선택)
    fetch('/api/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: pathname,
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
      }),
    })
  })

  return null
}
```

```tsx
// app/layout.tsx — 루트에 한 번만 추가
import { WebVitals } from './_components/WebVitals'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebVitals />
        {children}
      </body>
    </html>
  )
}
```

콘솔 출력 예시:
```
{ page: '/dashboard', metric: 'LCP', value: 3200, rating: 'needs-improvement' }
{ page: '/home',      metric: 'LCP', value: 1800, rating: 'good' }
{ page: '/dashboard', metric: 'TTFB', value: 820, rating: 'poor' }
```

> **주의**: `usePathname`은 클라이언트 컴포넌트에서만 동작. `'use client'` 필수.
> SPA 내비게이션(Link 클릭) 후 측정값은 다음 페이지 마운트 시 새로 수집됨.

---

### 외부 서비스로 전송 (선택)

```ts
useReportWebVitals((metric) => {
  // Vercel Analytics (무료)
  if (window.va) window.va('event', { name: metric.name, value: metric.value })

  // 직접 엔드포인트
  fetch('/api/vitals', {
    method: 'POST',
    body: JSON.stringify(metric),
  })
})
```

### Vercel Analytics (배포 환경 전용)

```bash
pnpm add @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />  {/* FCP, LCP, TTFB 자동 수집 */}
      </body>
    </html>
  )
}
```

**Good 기준 (Core Web Vitals 2024)**
| 지표 | Good | Needs Improvement | Poor |
|---|---|---|---|
| FCP | < 1.8s | 1.8–3s | > 3s |
| LCP | < 2.5s | 2.5–4s | > 4s |
| INP | < 200ms | 200–500ms | > 500ms |
| CLS | < 0.1 | 0.1–0.25 | > 0.25 |

---

## 3. TTFB 측정

### 브라우저 DevTools

```
Network 탭 → 요청 클릭 → Timing 탭
→ "Waiting for server response" = TTFB
```

### 코드로 측정

```ts
useReportWebVitals((metric) => {
  if (metric.name === 'TTFB') {
    console.log(`TTFB: ${metric.value}ms`) // 600ms 이하 목표
  }
})
```

### curl로 서버 측 측정

```bash
curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s\n" https://your-site.com
```

**TTFB 판단 기준**
| TTFB | 평가 |
|---|---|
| < 200ms | 🟢 좋음 |
| 200–600ms | 🟡 주의 |
| > 600ms | 🔴 개선 필요 (서버 렌더링 비용 의심) |

> App Router에서 TTFB가 높으면 → `loading.tsx` + Suspense로 스트리밍 고려

---

## 4. Lighthouse 측정

### CLI (CI/자동화에 적합)

```bash
pnpm add -g lighthouse

# 기본 측정
lighthouse https://your-site.com --output html --output-path ./report.html

# 성능만 측정 (빠름)
lighthouse https://your-site.com \
  --only-categories=performance \
  --output json \
  --output-path ./perf.json

# 모바일 / 데스크탑 분리
lighthouse https://your-site.com --preset desktop
lighthouse https://your-site.com --form-factor mobile
```

### 로컬 개발 서버 측정

```bash
# 1. 프로덕션 빌드로 로컬 서버 띄우기 (dev 서버 측정은 부정확)
pnpm build && pnpm start

# 2. 측정
lighthouse http://localhost:3000 --output html
```

### CI 자동화 (GitHub Actions)

```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse
  uses: treosh/lighthouse-ci-action@v10
  with:
    urls: |
      https://your-site.com
      https://your-site.com/about
    budgetPath: ./budget.json
    uploadArtifacts: true
```

```json
// budget.json — 점수 하한선 설정
[{
  "path": "/*",
  "scores": [
    { "id": "performance", "minScore": 0.8 },
    { "id": "accessibility", "minScore": 0.9 }
  ]
}]
```

**Lighthouse 점수 기준**
| 점수 | 평가 |
|---|---|
| 90–100 | 🟢 Good |
| 50–89 | 🟡 Needs Improvement |
| 0–49 | 🔴 Poor |

---

## 5. 측정 순서 (추천 플로우)

```
1. pnpm build          → 번들 사이즈 + 라우트별 First Load JS 확인
2. ANALYZE=true pnpm build  → 큰 의존성 트리맵으로 시각화
3. pnpm start → lighthouse  → 전체 성능 점수 + FCP/LCP/TTFB 한번에
4. useReportWebVitals          → 실사용자 데이터 수집 (배포 후)
5. Vercel Speed Insights       → 프로덕션 장기 모니터링
```

---

## 6. 자주 나오는 병목 패턴 (App Router)

| 증상 | 원인 | 해결 |
|---|---|---|
| First Load JS 큼 | 서버 컴포넌트에 `'use client'` 남용 | Client Component를 말단으로 내리기 |
| LCP 느림 | 히어로 이미지 늦게 발견 | `<Image priority />` + `preload` |
| TTFB 높음 | 서버 컴포넌트에서 DB 직렬 호출 | `Promise.all()` 병렬 패칭 |
| FCP-TTI 구간 김 | 큰 JS 번들 Hydration | `dynamic(() => import(...))` lazy load |
| CLS 발생 | 이미지 크기 미지정 | `width` / `height` 명시 또는 `fill` 사용 |