---
name: design-tokens
description: >
  Tailwind v4 디자인 토큰 기반 퍼블리싱 스킬.
  CSS/컴포넌트 작업 시 항상 이 스킬을 먼저 읽고,
  토큰 파일을 확인한 뒤 작업하세요.
refs:
  - https://tailwindcss.com/docs/theme (Theme variables, @theme, 네임스페이스 매핑)
  - https://www.maviklabs.com/blog/design-tokens-tailwind-v4-2026/ (3레이어 구조, 모션 토큰)
---

# Tailwind v4 Design Token 퍼블리싱 규칙

## 핵심 원칙

CSS나 컴포넌트를 작성할 때 **반드시** 아래 순서를 따른다:

1. 토큰 파일을 먼저 확인한다
2. 필요한 값이 **이미 있으면** → 그 토큰을 그대로 사용한다
3. 필요한 값이 **없으면** → 토큰을 먼저 추가하고, 그 토큰을 사용한다
4. 임의의 하드코딩 값(`pl-[17px]`, `#3b82f6`, `rounded-[7px]`)은 **절대 사용하지 않는다**

---

## @theme vs @theme inline vs :root

```css
/* :root — 런타임에 바꿀 수 있는 값 저장소 */
:root {
  --primary: oklch(0.5 0.2 250);
}
.dark {
  --primary: oklch(0.7 0.2 250); /* 다크모드 때 교체 */
}

/* @theme — 값을 빌드 타임에 고정. 유틸리티 클래스 생성됨 */
/* 단, var() 참조 시 중간 단계가 생겨 런타임 교체가 불안정할 수 있음 */
@theme {
  --color-primary: oklch(0.5 0.2 250);
}
/* .bg-primary { background-color: var(--color-primary) } */

/* @theme inline — :root 변수를 직접 참조. 런타임 교체 안전 */
@theme inline {
  --color-primary: var(--primary);
}
/* .bg-primary { background-color: var(--primary) } ← 중간 단계 없음 */
```

**규칙:**
- 다크모드/브랜드 테마 전환이 필요한 값 → `:root` + `@theme inline`
- 절대 바뀌지 않는 값 → `@theme` 직접 정의

---

## 3레이어 토큰 구조

### Layer 1 — Base (원시값, 팔레트)

`:root`에 정의. 의미 없는 순수한 값.

```css
:root {
  /* 색상 팔레트 (OKLCH) */
  --color-brand-50:  oklch(98% 0.01 250);
  --color-brand-100: oklch(95% 0.02 250);
  --color-brand-500: oklch(60% 0.16 250);
  --color-brand-600: oklch(50% 0.14 250);
  --color-brand-900: oklch(20% 0.08 250);

  /* 스페이싱 */
  --size-1: 0.25rem;
  --size-2: 0.5rem;
  --size-4: 1rem;
  --size-6: 1.5rem;
  --size-8: 2rem;
  --size-12: 3rem;
  --size-16: 4rem;

  /* 라디우스 */
  --size-radius-sm: 0.25rem;
  --size-radius-md: 0.375rem;
  --size-radius-lg: 0.5rem;
  --size-radius-xl: 0.75rem;
}
```

### Layer 2 — Semantic (의도 표현)

`:root`와 `.dark`에 정의. Base 토큰을 참조.

```css
:root {
  --background:           var(--color-gray-50);
  --foreground:           var(--color-gray-900);
  --muted:                var(--color-gray-500);
  --border:               var(--color-gray-200);

  --primary:              var(--color-brand-600);
  --primary-foreground:   var(--color-white);

  --destructive:          var(--color-red-600);

  --success:              var(--color-green-600);
  --warning:              var(--color-amber-500);
  --error:                var(--color-red-600);
  --info:                 var(--color-blue-500);
}

.dark {
  --background:           var(--color-gray-950);
  --foreground:           var(--color-gray-50);
  --border:               var(--color-gray-800);
  --primary:              var(--color-brand-400);
}
```

### Layer 3 — @theme inline (Tailwind 연결 브릿지)

Semantic 토큰을 Tailwind 유틸리티 클래스로 연결.

```css
@theme inline {
  /* 색상 → bg-*, text-*, border-* 클래스 생성 */
  --color-background:         var(--background);
  --color-foreground:         var(--foreground);
  --color-primary:            var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-destructive:        var(--destructive);
  --color-border:             var(--border);
  --color-muted:              var(--muted);

  /* 스페이싱 → p-*, m-*, gap-* 클래스 생성 */
  --spacing-1:  var(--size-1);
  --spacing-2:  var(--size-2);
  --spacing-4:  var(--size-4);
  --spacing-6:  var(--size-6);
  --spacing-8:  var(--size-8);
  --spacing-12: var(--size-12);
  --spacing-16: var(--size-16);

  /* 라디우스 → rounded-* 클래스 생성 */
  --radius-sm: var(--size-radius-sm);
  --radius-md: var(--size-radius-md);
  --radius-lg: var(--size-radius-lg);
  --radius-xl: var(--size-radius-xl);
}
```

**참조 방향: @theme inline → Semantic(:root) → Base(:root). 레이어를 건너뛰지 않는다.**

---

## Tailwind v4 네임스페이스 → 유틸리티 클래스 매핑

토큰 이름을 지을 때 아래 네임스페이스 규칙을 따른다.
`--color-{이름}` 으로 정의하면 `bg-{이름}`, `text-{이름}` 등이 자동 생성된다.

| 네임스페이스 | 생성되는 클래스 |
|---|---|
| `--color-*` | `bg-*`, `text-*`, `border-*`, `fill-*` 등 |
| `--spacing-*` | `p-*`, `m-*`, `gap-*`, `w-*`, `h-*` 등 |
| `--text-*` | `text-xs`, `text-xl` 등 |
| `--font-*` | `font-sans`, `font-mono` 등 |
| `--font-weight-*` | `font-bold`, `font-medium` 등 |
| `--radius-*` | `rounded-sm`, `rounded-lg` 등 |
| `--shadow-*` | `shadow-md`, `shadow-xl` 등 |
| `--ease-*` | `ease-out`, `ease-in-out` 등 |
| `--animate-*` | `animate-spin`, `animate-pulse` 등 |
| `--breakpoint-*` | `sm:*`, `md:*`, `lg:*` 등 |

---

## 모션 토큰

```css
:root {
  --duration-fast:   100ms;
  --duration-normal: 200ms;
  --duration-slow:   300ms;
}

@theme inline {
  --ease-in:     cubic-bezier(0.4, 0, 1, 1);
  --ease-out:    cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

| 요소 | duration | easing |
|---|---|---|
| hover | fast | ease-out |
| 버튼 클릭 | normal | ease-out |
| 드롭다운 | normal | ease-out |
| 모달 | slow | ease-spring |

---

## 드리프트 방지 체크리스트

- [ ] 임의값(`[]`) 없이 토큰으로 해결 가능한가?
- [ ] 새 토큰은 Base → Semantic → @theme inline 순서로 추가했는가?
- [ ] 하드코딩된 hex, px 값이 없는가?
- [ ] 다크모드는 `.dark` 안에서 토큰 값만 교체했는가?
- [ ] 런타임 변경이 필요한 값은 `@theme inline`을 사용했는가?