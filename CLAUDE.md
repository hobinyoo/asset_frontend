# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (http://localhost:3000)
pnpm build      # Production build
pnpm lint       # ESLint
```

백엔드 API가 `NEXT_PUBLIC_API_URL` (기본값 `http://localhost:8080`)에서 실행 중이어야 한다.

## Architecture

Next.js App Router 기반의 개인 자산관리 앱. 백엔드 Spring Boot API와 연동된다.

### 레이어 구조

```
API 함수 (src/api/)
    ↓
React Query 훅 (src/queries/)
    ↓
컴포넌트 (src/components/)
    ↓
페이지 (src/app/)
```

- **`src/api/`** — axios 인스턴스(`api`)를 사용하는 순수 fetch 함수. 쿼리 키나 상태 없음.
- **`src/queries/`** — React Query의 `useQuery` / `useMutation` 훅. `*_KEYS` 객체로 쿼리 키 관리. mutation 성공 시 관련 키를 `invalidateQueries`로 일괄 무효화.
- **`src/components/`** — UI 컴포넌트. 모두 Client Component(`'use client'`). 단, 일부 페이지는 Server Component에서 prefetch 후 `HydrationBoundary`로 전달.
- **`src/app/`** — Next.js App Router 페이지. Server Component에서 React Query prefetch 패턴 사용.

### 주요 도메인

| 도메인 | 설명 |
|--------|------|
| Asset | 자산 (주택자금/청약/노후/투자). `linkedToInvestment` 플래그로 투자 계좌 연동 |
| Debt | 부채. 타입: FIXED(거치) / REGULAR(정기) / VARIABLE(변동) |
| Investment | 투자 종목. Asset에 `assetId`로 연결. 티커는 국내 `.KS`/`.KQ` 접미사 포함 |
| Report | AI 생성 일별 투자 리포트 |

### 공통 컴포넌트 (`src/components/common/`)

새 모달/테이블 작성 시 반드시 활용:

- **`FormField`** / **`FormInput`** / **`FormSelect`** / **`FormTextarea`** — 통일된 폼 스타일
- **`WonInput`** — 한국 원화 입력 (`₩` 접두사, 천단위 콤마 자동 포맷)
- **`ModalActions`** — 취소/저장 버튼 (`color="blue"|"red"`, `disabled` 지원)
- **`TablePagination`** — 페이지네이션 (`page`, `totalPages`, `onPageChange` props)
- **`OwnerSelect`** — 소유자 드롭다운 (유호빈 / 허선주 / 공통)
- **`ConfigSelectField`** — 서버 목록 기반 셀렉트 + 직접 추가 + 항목 삭제. shadcn `Select` 사용. props: `label`, `value`, `onChange`, `items: ConfigItem[]`, `onAdd(value, onSuccess)`, `onDelete?(id)`, `isPending`, `placeholder`
  - 삭제 버튼은 `SelectItem` 바깥 wrapper div에 배치 (`[&_svg]:pointer-events-none` 우회, `SelectPrimitive.ItemText` 오염 방지)
  - `onPointerDown` + `preventDefault/stopPropagation`으로 Radix Select 선택 이벤트 차단

### Config 도메인 (`src/api/config.ts`, `src/queries/config.ts`)

멤버별 커스텀 목록(카테고리, 소유자)을 관리하는 레이어:

- **`CONFIG_KEYS`** — `{ assetCategories(), assetOwners(), investmentCategories() }`
- 조회: `useAssetCategories()` / `useAssetOwners()` / `useInvestmentCategories()`
- 추가: `useAddAssetCategory()` / `useAddAssetOwner()` / `useAddInvestmentCategory()` — 성공 시 해당 키 invalidate
- 삭제: `useDeleteAssetCategory()` / `useDeleteAssetOwner()` / `useDeleteInvestmentCategory()`
- `ConfigItem` 타입: `{ id: number; value: string }` (`src/types/config.ts`)

### 파일 네이밍

- 모든 파일명은 `snake_case.tsx`
- 컴포넌트 함수명은 `PascalCase`

### 환경변수

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_API_URL` | 백엔드 API base URL |
| `TEST_LOGIN_ID` | Playwright E2E 테스트용 로그인 ID |
| `TEST_PASSWORD` | Playwright E2E 테스트용 비밀번호 |

## E2E 테스트 (Playwright)

```bash
npx playwright test          # 전체 실행
npx playwright test auth     # 특정 파일
npx playwright test --ui     # UI 모드
npx playwright show-report   # 결과 리포트
```

### 구조

```
tests/
├── global.setup.ts       ← 로그인 후 .auth/user.json 에 storageState 저장
├── fixtures/
│   └── auth.fixture.ts   ← apiCall() 헬퍼 + createTestAsset/clean* fixture
├── auth.spec.ts
├── assets.spec.ts
├── debts.spec.ts
├── investments.spec.ts
└── snapshots.spec.ts
```

### 컨벤션
- 인증 상태: `storageState: '.auth/user.json'` (쿠키 포함) — 매 테스트마다 로그인 불필요
- 미인증 테스트: `test.use({ storageState: { cookies: [], origins: [] } })`
- 테스트 데이터 생성: `apiCall(page, 'POST', ...)` 헬퍼 (쿠키 자동 추가)
- 테스트 후 정리: `cleanAsset/cleanDebt/cleanInvestment` fixture
- 테스트 데이터 이름에 `Date.now()` 접미사로 충돌 방지
- `workers: 1` — 순차 실행으로 백엔드 상태 충돌 방지
