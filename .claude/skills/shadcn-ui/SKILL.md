---
name: shadcn-tokens
description: >
  shadcn/ui + Tailwind v4 + cva + cn 기반 퍼블리싱 스킬.
  shadcn 컴포넌트 작업 시 항상 이 스킬을 먼저 읽고,
  토큰과 variant 구조를 확인한 뒤 작업하세요.
refs:
  - https://ui.shadcn.com/docs/theming (@theme inline 구조, 토큰 컨벤션, 다크모드)
  - https://ui.shadcn.com/docs/installation/manual (globals.css 기본 구조)
  - https://cva.style/docs (cva variant 정의)
  - https://github.com/dcastil/tailwind-merge (tailwind-merge, cn 유틸)
---

# shadcn/ui 컴포넌트 퍼블리싱 규칙

## 전체 스택 흐름

```
:root / .dark          →  토큰 값 저장 (Base + Semantic)
@theme inline          →  Tailwind 유틸리티 클래스로 연결
cva                    →  variant props로 추상화
cn (clsx + twMerge)    →  클래스 충돌 해결
shadcn 컴포넌트        →  실제 사용
```

---

## 핵심 원칙

1. shadcn 컴포넌트 소스를 **직접 수정하지 않는다** — 토큰 값만 바꾼다
2. 새 토큰은 `:root`, `.dark`, `@theme inline` **세 곳 모두** 추가한다
3. 색상은 항상 `base + base-foreground` **쌍**으로 정의한다
4. variant 분기는 **cva**로, 클래스 충돌은 **cn**으로 처리한다

---

## globals.css 기본 구조

```css
@import "tailwindcss";
@import "tw-animate-css";

/* Tailwind 유틸리티 ↔ shadcn 토큰 연결 */
@theme inline {
  --color-background:           var(--background);
  --color-foreground:           var(--foreground);
  --color-card:                 var(--card);
  --color-card-foreground:      var(--card-foreground);
  --color-popover:              var(--popover);
  --color-popover-foreground:   var(--popover-foreground);
  --color-primary:              var(--primary);
  --color-primary-foreground:   var(--primary-foreground);
  --color-secondary:            var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted:                var(--muted);
  --color-muted-foreground:     var(--muted-foreground);
  --color-accent:               var(--accent);
  --color-accent-foreground:    var(--accent-foreground);
  --color-destructive:          var(--destructive);
  --color-border:               var(--border);
  --color-input:                var(--input);
  --color-ring:                 var(--ring);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

/* 라이트 모드 */
:root {
  --background:             oklch(1 0 0);
  --foreground:             oklch(0.145 0 0);
  --card:                   oklch(1 0 0);
  --card-foreground:        oklch(0.145 0 0);
  --popover:                oklch(1 0 0);
  --popover-foreground:     oklch(0.145 0 0);
  --primary:                oklch(0.205 0 0);
  --primary-foreground:     oklch(0.985 0 0);
  --secondary:              oklch(0.97 0 0);
  --secondary-foreground:   oklch(0.205 0 0);
  --muted:                  oklch(0.97 0 0);
  --muted-foreground:       oklch(0.556 0 0);
  --accent:                 oklch(0.97 0 0);
  --accent-foreground:      oklch(0.205 0 0);
  --destructive:            oklch(0.577 0.245 27.325);
  --border:                 oklch(0.922 0 0);
  --input:                  oklch(0.922 0 0);
  --ring:                   oklch(0.708 0 0);
  --radius:                 0.625rem;
}

/* 다크 모드 */
.dark {
  --background:             oklch(0.145 0 0);
  --foreground:             oklch(0.985 0 0);
  --card:                   oklch(0.205 0 0);
  --card-foreground:        oklch(0.985 0 0);
  --popover:                oklch(0.269 0 0);
  --popover-foreground:     oklch(0.985 0 0);
  --primary:                oklch(0.922 0 0);
  --primary-foreground:     oklch(0.205 0 0);
  --secondary:              oklch(0.269 0 0);
  --secondary-foreground:   oklch(0.985 0 0);
  --muted:                  oklch(0.269 0 0);
  --muted-foreground:       oklch(0.708 0 0);
  --accent:                 oklch(0.371 0 0);
  --accent-foreground:      oklch(0.985 0 0);
  --destructive:            oklch(0.704 0.191 22.216);
  --border:                 oklch(1 0 0 / 10%);
  --input:                  oklch(1 0 0 / 15%);
  --ring:                   oklch(0.556 0 0);
}
```

---

## 토큰 컨벤션

shadcn은 `base + base-foreground` 쌍으로 동작한다.

| 토큰 | 용도 |
|---|---|
| `--background` / `--foreground` | 페이지 전체 배경/텍스트 |
| `--primary` / `--primary-foreground` | 주요 버튼, 강조 요소 |
| `--secondary` / `--secondary-foreground` | 보조 버튼, 서브 요소 |
| `--muted` / `--muted-foreground` | 비활성 배경, 힌트 텍스트 |
| `--accent` / `--accent-foreground` | hover 상태, 강조 배경 |
| `--destructive` | 삭제/위험 액션 |
| `--card` / `--card-foreground` | 카드 컴포넌트 |
| `--popover` / `--popover-foreground` | 드롭다운, 툴팁 |
| `--border` | 테두리 |
| `--input` | 인풋 테두리 |
| `--ring` | 포커스 링 |

---

## 새 토큰 추가하는 법

예: `warning` 색상 추가

```css
/* 1. :root와 .dark에 값 정의 */
:root {
  --warning:            oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}
.dark {
  --warning:            oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}

/* 2. @theme inline에 Tailwind 브릿지 추가 */
@theme inline {
  --color-warning:            var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

이후 `bg-warning text-warning-foreground` 클래스로 바로 사용 가능.

---

## cva로 variant 만들기

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const button = cva(
  /* base 클래스 — 모든 variant 공통 */
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        primary:   "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:   "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost:     "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  className?: string
}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(button({ variant, size }), className)}
      {...props}
    />
  )
}
```

---

## 새 색상이 여러 variant에 필요한 경우 — compoundVariants

단일 축 variant로는 색상이 늘어날수록 조합이 폭발한다. `variant`(스타일) × `color`(색상) 두 축으로 분리하고 `compoundVariants`로 조합한다.

```tsx
const buttonVariants = cva("...", {
  variants: {
    variant: {
      default: "",   // 채운 버튼
      outline: "border bg-transparent",
      ghost:   "bg-transparent",
    },
    color: {
      primary:     "",
      destructive: "",
      warning:     "",
    },
  },
  compoundVariants: [
    { variant: "default", color: "primary",     class: "bg-primary text-primary-foreground active:bg-primary-active" },
    { variant: "outline", color: "primary",     class: "border-primary text-primary hover:bg-primary/10" },
    { variant: "ghost",   color: "primary",     class: "text-primary hover:bg-primary/10" },

    { variant: "default", color: "destructive", class: "bg-destructive text-white active:bg-destructive/90" },
    { variant: "outline", color: "destructive", class: "border-destructive text-destructive hover:bg-destructive/10" },
    { variant: "ghost",   color: "destructive", class: "text-destructive hover:bg-destructive/10" },
  ],
  defaultVariants: { variant: "default", color: "primary" },
})
```

새 색상 추가 시: 토큰만 추가하고 `compoundVariants`에 3줄(default/outline/ghost)만 append.

---

## cn 유틸 (lib/utils.ts)

shadcn 설치 시 자동 생성. 클래스 충돌을 해결한다.

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```tsx
/* cn 없으면 */
<Button className="bg-red-500" variant="primary" />
/* bg-primary랑 bg-red-500 충돌 → 예측 불가 */

/* cn 있으면 */
cn("bg-primary", "bg-red-500") → "bg-red-500" /* 나중 값이 이김 */
```

---

## 다크모드 규칙

- 다크모드는 `.dark` 클래스로 제어 (`<html class="dark">`)
- 컴포넌트 안에서 `dark:` prefix로 분기하지 않는다 — 토큰만 바꾼다

```css
/* ✅ 올바른 방식 */
.dark { --background: oklch(0.145 0 0); }

/* ❌ 잘못된 방식 */
<div className="bg-white dark:bg-gray-900">
```

---

## 드리프트 방지 체크리스트

- [ ] shadcn 컴포넌트 소스를 직접 수정하지 않았는가?
- [ ] 새 색상을 `:root`, `.dark`, `@theme inline` 세 곳 모두 추가했는가?
- [ ] `base + base-foreground` 쌍을 지켰는가?
- [ ] variant 분기를 cva로 처리했는가?
- [ ] 외부 className 충돌을 cn으로 처리했는가?
- [ ] 하드코딩 hex/rgb 없이 토큰만 사용했는가?