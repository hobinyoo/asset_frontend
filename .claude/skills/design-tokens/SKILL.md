---
  name: design-tokens
  description: >
  Tailwind v4 디자인 토큰 기반 퍼블리싱 스킬.
  CSS/컴포넌트 작업 시 항상 이 스킬을 먼저 읽고,
  토큰 파일을 확인한 뒤 작업하세요.
  refs:
    - https://tailwindcss.com/docs/theme (Theme variables, @theme, 네임스페이스 매핑)
    - https://www.maviklabs.com/blog/design-tokens-tailwind-v4-2026/ (3레이어 구조, 모션 토큰)
    - https://github.com/VoltAgent/awesome-design-md/tree/main (디자인 시스템 명세 레퍼런스)
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

  /* 스페이싱 — 숫자 키만 사용한다 (아래 주의사항 참고) */
  --spacing-1:  var(--size-1);
  --spacing-2:  var(--size-2);
  --spacing-4:  var(--size-4);
  --spacing-6:  var(--size-6);
  --spacing-8:  var(--size-8);
  --spacing-12: var(--size-12);
  --spacing-16: var(--size-16);

  /* 라디우스 — Tailwind 기본값으로 충분하면 생략 가능 */
  --radius-sm: var(--size-radius-sm);
  --radius-md: var(--size-radius-md);
  --radius-lg: var(--size-radius-lg);
  --radius-xl: var(--size-radius-xl);
}
```

**참조 방향: @theme inline → Semantic(:root) → Base(:root). 레이어를 건너뛰지 않는다.**

---

## ⚠️ Tailwind v4 스페이싱 네이밍 충돌 주의

Tailwind v4에서 `--spacing-*`은 `p-*`, `m-*`, `w-*`, `max-w-*` 등 **모든 크기 유틸리티**가 공유하는 통합 스케일이다.

`sm`, `md`, `lg`, `xl` 같은 이름을 `--spacing-*`으로 정의하면 `max-w-sm`, `max-w-md` 등이 덮어씌워진다.

```css
/* ❌ 절대 금지 — max-w-sm이 24rem → 0.75rem으로 깨짐 */
@theme inline {
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
}

/* ✅ 숫자 키 사용 — 기존 유틸리티와 충돌 없음 */
@theme inline {
  --spacing-1: 0.25rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
}
```

Tailwind v4의 기본 4px 배수 스케일이 대부분의 디자인 스펙과 일치하므로, **스페이싱은 `@theme inline`에 추가하지 않고 기본 숫자 클래스(`p-4`, `gap-6`)를 그대로 쓰는 것이 권장된다.**

---

## 타이포그래피 복합 유틸리티

font-size만 있는 `--text-*` 토큰 대신, font-family + size + weight + line-height + letter-spacing을 **한 클래스로 묶으려면 `@utility`를 사용**한다.

```css
/* ❌ --text-* 토큰은 font-size만 설정됨 */
@theme inline {
  --text-display-xl: 4rem;
}
/* 사용 시: text-display-xl font-display font-normal leading-[1.05] tracking-[-1.5px] */

/* ✅ @utility로 복합 클래스 — 하나로 해결 */
@utility text-display-xl {
  font-family: var(--font-display);
  font-size: var(--text-size-display-xl);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.09375rem;
}
/* 사용 시: text-display-xl */
```

**언제 `@utility`를 쓰는가:**
- 여러 CSS 속성이 항상 함께 적용되는 경우 (타이포그래피 스타일)
- `--text-*` 토큰으로는 표현할 수 없는 font-family, font-weight, letter-spacing이 포함된 경우

**주의:** font-weight를 복합 유틸리티에 포함하면 `font-medium` 같은 별도 클래스로 override할 때 cascade 순서에 의존하게 된다. 사용처마다 font-weight가 달라지는 경우(body-sm 등)는 복합 유틸리티에서 font-weight를 빼고 별도로 적용하는 것도 고려한다.

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

## ⚠️ @theme inline 네이밍 충돌 주의

Tailwind v4에서 `@theme inline`에 정의하는 커스텀 토큰 이름이 **Tailwind 내장 유틸리티 키와 겹치면 기존 클래스가 덮어씌워진다.**

```css
/* ❌ --spacing-sm 정의 시 max-w-sm, w-sm, h-sm 등이 모두 0.75rem으로 깨짐 */
@theme inline {
  --spacing-sm: 0.75rem;
  --spacing-lg: 1.5rem;
}

/* ❌ --radius-2xl을 작은 값으로 정의하면 rounded-2xl이 예상보다 작아짐 */
@theme inline {
  --radius-2xl: 0.5rem; /* Tailwind 기본 1rem을 덮어씀 */
}
```

**규칙:**
- `@theme inline`에 토큰을 추가하기 전에 **해당 이름이 Tailwind 내장 키와 겹치지 않는지 확인**한다
- `--spacing-*`은 `p-*`, `m-*`, `w-*`, `max-w-*` 등 모든 크기 유틸리티가 공유하므로 특히 주의
- Tailwind 기본값으로 충분한 경우(스페이싱 숫자 스케일, 라디우스 등)는 `@theme inline`에 추가하지 않는다
- 커스텀 이름이 필요하면 내장 키와 겹치지 않는 이름(`--spacing-section`, `--radius-pill` 등)을 사용한다

---

## 타이포그래피 복합 유틸리티

font-size만 담을 수 있는 `--text-*` 토큰 대신, font-family + size + weight + line-height + letter-spacing을 **한 클래스로 묶으려면 `@utility`를 사용**한다.

```css
/* ❌ --text-* 토큰은 font-size만 */
@theme inline {
  --text-display-xl: 4rem;
}
/* 매번 text-display-xl font-display font-normal leading-[1.05] tracking-[-1.5px] 조합 필요 */

/* ✅ @utility 복합 클래스 */
@utility text-display-xl {
  font-family: var(--font-display);
  font-size: var(--text-size-display-xl);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.09375rem;
}
/* 사용 시: text-display-xl 하나로 끝 */
```

여러 CSS 속성이 항상 함께 적용되는 패턴이라면 `@utility`로 묶는다.

---

## 드리프트 방지 체크리스트

- [ ] 임의값(`[]`) 없이 토큰으로 해결 가능한가?
- [ ] 새 토큰은 Base → Semantic → @theme inline 순서로 추가했는가?
- [ ] 하드코딩된 hex, px 값이 없는가?
- [ ] 다크모드는 `.dark` 안에서 토큰 값만 교체했는가?
- [ ] 런타임 변경이 필요한 값은 `@theme inline`을 사용했는가?
- [ ] `@theme inline` 토큰 이름이 Tailwind 내장 키와 충돌하지 않는가?