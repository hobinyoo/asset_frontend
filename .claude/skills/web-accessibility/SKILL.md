---
name: web-accessibility
description: >
  Next.js + React 기준 웹 접근성(KWCAG 2.2) 적용 스킬.
  인터랙티브 컴포넌트(탭/드롭다운/슬라이더/메뉴), 폼, 동적 메시지, 페이지 기본 설정을
  작성할 때 반드시 이 스킬을 읽고 올바른 방식을 선택한다.
  모든 웹 접근성 지침이 아닌, 웹 애플리케이션(컴포넌트 단위)에 적용되는 부분만 다룬다.
refs:
  - https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-automatic/
  - https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
  - https://www.w3.org/WAI/ARIA/apg/patterns/carousel/
  - https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/
---

# 웹 접근성(KWCAG) 적용 규칙

## 핵심 원칙

체크할 건 결국 두 가지다: **키보드만으로 사용 가능한가** / **스크린 리더가 의미를 이해할 수 있는가**.
네이티브 요소(`button`, `input`, `a`)는 기본 키보드 동작을 제공하므로 `label`/`alt`만 챙기면 되고,
커스텀 인터랙션(탭, 드롭다운, 슬라이더, 메뉴)을 직접 구현할 때만 아래 패턴이 필요하다.

---

## 1. 인터랙티브 컴포넌트 만들 때 — 키보드 + ARIA

| 컴포넌트 | 키보드 동작 | 핵심 ARIA |
|---|---|---|
| Tab | ArrowLeft/Right(이동), Home/End(처음/끝) | `role="tablist"/"tab"`, `aria-selected`, `aria-controls` |
| Dropdown/Combobox | ArrowDown(열기), ArrowUp/Down(이동), Enter/Space(선택), Escape(닫기) | `role="listbox"/"option"`, `aria-selected` |
| Slider(Carousel) | 컨트롤 버튼을 콘텐츠보다 먼저 배치 | `aria-label`(현재/전체 포함), `inert`(비활성 슬라이드) |
| Navigation Menu | Tab/Shift+Tab, Enter | `aria-expanded`, `aria-haspopup` |

> ⚠️ onKeyDown은 onClick보다 먼저 트리거되고, Enter 키는 onClick도 함께 발생시킨다.
> ⚠️ Swiper 슬라이더는 Tab만으로는 슬라이드 자체 이동이 불가능(버튼 클릭/포커스로만 이동) — 케이스별로 치명적인지 판단.

**Tab 예시**

```tsx
<ul role="tablist" aria-label="탭 메뉴">
  {tabs.map((tab, index) => (
    <li key={tab.id}>
      <button
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-controls={`panel-${tab.id}`}
        id={`tab-${tab.id}`}
        tabIndex={activeTab === tab.id ? 0 : -1}
        ref={(el) => (tabRefs.current[index] = el)}
      >
        {tab.label}
      </button>
    </li>
  ))}
</ul>
```

```ts
// ArrowLeft/Right/Home/End로 탭 간 이동 → setTabFocus + tabRefs.current[newFocus]?.focus()
case 'ArrowLeft': newFocus = tabFocus === 0 ? tabs.length - 1 : tabFocus - 1; break
case 'ArrowRight': newFocus = tabFocus === tabs.length - 1 ? 0 : tabFocus + 1; break
case 'Home': newFocus = 0; break
case 'End': newFocus = tabs.length - 1; break
```

**Dropdown 예시 (listbox 패턴)**

```ts
if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
  toggleDropdown(); setActiveIndex(0)
}
if (isOpen) {
  switch (e.key) {
    case 'ArrowUp': setActiveIndex(prev => prev > 0 ? prev - 1 : items.length - 1); break
    case 'ArrowDown': setActiveIndex(prev => prev < items.length - 1 ? prev + 1 : 0); break
    case 'Enter': case ' ': onSelect(items[activeIndex]); toggleDropdown(); break
    case 'Escape': toggleDropdown(); break
  }
}
```

```tsx
<ul role="listbox" aria-labelledby="combo-label" tabIndex={-1}>
  {items.map((item, index) => (
    <li role="option" aria-selected={index === activeIndex} key={index}>{item.title}</li>
  ))}
</ul>
```

**Slider(Swiper) 예시**

```tsx
<div aria-labelledby={titleId}>
  <h2 id={titleId} className="sr-only">{title}</h2> {/* 시각적으로 숨기되 스크린 리더는 읽음 */}
  <button
    aria-label={`이전 슬라이드, 현재 ${activeSlideIndex + 1}번, 전체 ${totalSlides}개`}
    aria-controls={swiperId}
    disabled={isBeginning}
  >
    <LeftArrowSliderSVG aria-hidden="true" />
  </button>
  {/* 컨트롤을 슬라이드보다 먼저 배치 → 키보드 사용자가 컨트롤에 먼저 접근 */}
  <Swiper a11y={{ enabled: true, containerRoleDescriptionMessage: 'carousel' }} ... />
</div>
```

```ts
// 보이지 않는 슬라이드는 inert + aria-hidden으로 포커스/상호작용 차단
slide.setAttribute('inert', '')
slide.setAttribute('aria-hidden', 'true')
```

**Navigation Menu 예시**

```tsx
<NavLink
  href={path}
  aria-expanded={menuState?.isOpen && menuState.activeIndex === index}
  aria-haspopup={!!megamenu}
>
  {title}
</NavLink>
```

---

## 2. 폼 만들 때 — label 연결 + 오류 시 focus 이동

모든 입력 요소(`Input`, `Textarea`, `Checkbox`, `Radio`)는 `label`+`id`를 `htmlFor`로 연결한다.
디자인상 라벨을 숨겨야 하면 `sr-only`로 시각적으로만 숨긴다(스크린 리더에는 남김).

```tsx
<Textarea id="description" label="유튜브 설명" labelClassName="sr-only" />
```

검증 실패 시 단순 alert가 아니라 **오류 필드로 포커스 이동**까지 해야 한다.

```tsx
// 1. ref로 입력 참조
<Input ref={emailRef} label="이메일" id="email" />

// 2. 검증 실패 시 명확한 메시지 반환
if (!email || !isEmail(email)) {
  return { message: '유효한 이메일 주소를 입력해주세요.', success: false }
}

// 3. 서버 액션 결과를 useEffect로 받아 해당 필드에 focus
useEffect(() => {
  if (!focusOnError) return
  if (state.message?.includes('이메일')) {
    alert(state.message)
    emailRef.current?.focus()
  }
  setFocusOnError(false)
}, [state.message, focusOnError])
```

필수 입력은 `aria-required`와 별도 안내 텍스트("* 표시는 필수 입력 사항입니다")를 함께 제공한다.

---

## 3. 동적 메시지 보여줄 때 — `role="alert"` vs `role="status"`

| | `role="alert"` | `role="status"` |
|---|---|---|
| 용도 | 긴급한 정보(오류) | 긴급하지 않은 업데이트(완료 안내) |
| 기본 aria-live | `assertive` (즉시 안내, 현재 읽던 내용 중단) | `polite` (방해 없이 적절한 시점에 안내) |
| 예시 | 폼 제출 에러 | 평가 등록 완료 |

```tsx
<div role="alert">{errorMessage}</div>
<div role="status">{successMessage}</div>
```

> 페이지 로드 시 이미 존재하는 콘텐츠는 자동 안내되지 않는다 — 동적으로 추가/변경될 때만 발화.

---

## 4. 페이지/레이아웃 기본

```tsx
// 기본 언어
<html lang="kr">

// 페이지 제목 — Next.js metadata
export const metadata: Metadata = { title: '듀코위드 | 메인페이지', description: '...' }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lecture } = await getMyLectureById(params.lectureId)
  return { title: `${lecture.title} | 강의 학습 편집 | Duco With` }
}

// 반복 영역 건너뛰기 (헤더/내비게이션이 크거나 메가메뉴가 있을 때만 고려 — 짧은 내비게이션이면 생략 가능)
const SKIP_LINKS = [
  { href: '#main-content', text: '메인 콘텐츠로 바로가기' },
  { href: '#primary-nav', text: '주 메뉴로 바로가기' },
]
```

이미지는 `alt`, 아이콘 전용 버튼은 `aria-label` + 아이콘 자체엔 `aria-hidden="true"`.
링크 텍스트는 "여기를 클릭" 대신 목적지를 알 수 있게 작성한다.

---

## 선택 기준

```
어떤 작업을 하는가?
  ├→ 새 인터랙티브 컴포넌트(탭/드롭다운/슬라이더/메뉴) → 섹션 1
  ├→ 폼 입력 요소 → 섹션 2
  ├→ 동적으로 메시지 표시 → 섹션 3 (긴급=alert, 비긴급=status)
  └→ 페이지/레이아웃 단위 설정 → 섹션 4
```

> 견고성(마크업 문법 오류 없음, 웹 애플리케이션 자체의 접근성)은 별도 항목이 아니라
> 위 1~4를 빠짐없이 지켰는지로 충족된다.