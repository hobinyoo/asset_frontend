# 부자되기 ❤️

개인 자산 관리 웹 애플리케이션. 자산·부채·투자를 한곳에서 관리하고, AI가 매일 포트폴리오를 분석해 인사이트를 제공합니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4, shadcn/ui |
| 상태 관리 | TanStack Query v5 |
| 폼 | TanStack Form |
| 테이블 | TanStack Table |
| HTTP | Axios |
| 차트 | Recharts |
| E2E 테스트 | Playwright |

## 주요 기능

### 자산 관리
- 주택자금·청약·노후·투자 계좌 등 자산 유형별 등록
- 월 납입일 설정 시 매월 자동으로 금액 반영
- 드래그로 순서 변경, 소유자별 필터링

### 부채 관리
- 거치(FIXED)·정기(REGULAR)·변동(VARIABLE) 대출 유형 지원
- 월 상환일 설정 시 잔액 자동 차감
- 총자산 - 총부채 = 순자산 실시간 계산

### 투자 관리
- 종목 티커 입력 시 현재가 자동 조회 (국내: `.KS`/`.KQ`)
- 해외 주식 실시간 환율 적용 원화 환산
- 카테고리별 비중·수익률 차트 (Recharts)

### 데일리 리포트 (AI)
- SSE(Server-Sent Events) 기반 실시간 생성 진행률 표시
- 보유 종목별 뉴스 수집 → 임베딩 → AI 리포트 순 파이프라인
- 오늘의 시장 동향 요약, 카테고리별 이슈 분석, 투자 액션 1가지 제안

## 시작하기

### 요구사항

- Node.js 18+
- pnpm
- 백엔드 Spring Boot API (`http://localhost:8080` 기본값)

### 환경변수

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
TEST_LOGIN_ID=your_login_id       # Playwright E2E 테스트용
TEST_PASSWORD=your_password       # Playwright E2E 테스트용
```

### 설치 및 실행

```bash
pnpm install
pnpm dev       # http://localhost:3000
```

```bash
pnpm build     # 프로덕션 빌드
pnpm lint      # ESLint
```

## 프로젝트 구조

```
asset_front/
├── src/
│   ├── api/              # Axios 기반 순수 fetch 함수
│   ├── queries/          # TanStack Query 훅 (useQuery / useMutation)
│   ├── components/
│   │   ├── common/       # 공통 UI 컴포넌트
│   │   ├── asset/        # 자산 도메인 컴포넌트
│   │   ├── debt/         # 부채 도메인 컴포넌트
│   │   ├── investment/   # 투자 도메인 컴포넌트
│   │   ├── report/       # 리포트 도메인 컴포넌트
│   │   ├── layout/       # 레이아웃 (사이드바, 헤더)
│   │   └── ui/           # shadcn/ui 기본 컴포넌트
│   ├── app/              # Next.js App Router 페이지
│   ├── hooks/            # 커스텀 훅
│   ├── providers/        # React Context Provider
│   ├── types/            # TypeScript 타입 정의
│   ├── lib/              # 라이브러리 설정 및 유틸
│   ├── utils/            # 순수 유틸리티 함수
│   ├── constants/        # 상수 및 옵션 목록
│   └── styles/tokens/    # 디자인 토큰 CSS
├── tests/                # Playwright E2E 테스트
├── public/               # 정적 파일
└── .claude/              # Claude Code 설정
```

---

## 레이어별 역할 상세

### `src/api/` — 순수 fetch 함수

백엔드 API와 통신하는 함수만 작성한다. React Query나 컴포넌트 상태를 포함하지 않는다.

| 파일 | 역할 |
|------|------|
| `axios.ts` | Axios 인스턴스 생성. 기본 URL, 쿠키 인증(`withCredentials`), 401 시 로그인 리다이렉트 처리 |
| `auth.ts` | 로그인 / 회원가입 / 로그아웃 API |
| `asset.ts` | 자산 목록 조회, 생성, 수정, 삭제, 순서 변경 API |
| `debt.ts` | 부채 목록 조회, 생성, 수정, 삭제 API |
| `investment.ts` | 투자 종목 목록 조회, 생성, 수정, 삭제 API |
| `report.ts` | AI 리포트 목록 조회, SSE 생성 요청 API |
| `snapshot.ts` | 날짜별 자산·부채·순자산 스냅샷 조회 API |
| `config.ts` | 멤버별 커스텀 카테고리·소유자 목록 조회, 추가, 삭제 API |

---

### `src/queries/` — TanStack Query 훅

`src/api/`의 함수를 `useQuery` / `useMutation`으로 감싼다. `*_KEYS` 객체로 쿼리 키를 관리하고, mutation 성공 시 관련 키를 `invalidateQueries`로 무효화한다.

| 파일 | 역할 |
|------|------|
| `auth.ts` | `useLogin`, `useSignup`, `useLogout`, `useMe` 훅 |
| `asset.ts` | `useAssets`, `useCreateAsset`, `useUpdateAsset`, `useDeleteAsset`, `useReorderAssets` 훅 |
| `debt.ts` | `useDebts`, `useCreateDebt`, `useUpdateDebt`, `useDeleteDebt` 훅 |
| `investment.ts` | `useInvestments`, `useCreateInvestment`, `useUpdateInvestment`, `useDeleteInvestment` 훅 |
| `report.ts` | `useReports`, `useGenerateReport` 훅 |
| `snapshot.ts` | `useSnapshots` 훅 (자산 추이 차트용) |
| `config.ts` | `useAssetCategories`, `useAssetOwners`, `useInvestmentCategories` 및 추가/삭제 훅 |

---

### `src/components/common/` — 공통 UI 컴포넌트

새 폼이나 모달 작성 시 반드시 이 컴포넌트를 재사용한다.

| 파일 | 역할 |
|------|------|
| `form_field.tsx` | 라벨 + 인풋을 묶는 폼 행 레이아웃 (`FormField`, `FormInput`, `FormSelect`, `FormTextarea`) |
| `won_input.tsx` | 한국 원화 입력 필드. `₩` 접두사, 천단위 콤마 자동 포맷 |
| `modal_actions.tsx` | 취소/저장 버튼 묶음. `color="blue"|"red"`, `disabled` 지원 |
| `table_pagination.tsx` | 페이지네이션 UI. `page`, `totalPages`, `onPageChange` props |
| `owner_select.tsx` | 소유자 드롭다운 (유호빈 / 허선주 / 공통) |
| `config_select_field.tsx` | 서버 목록 기반 셀렉트 + 직접 추가 + 항목 삭제. shadcn `Select` 기반 |
| `tab_bar.tsx` | 탭 전환 UI (자산 대시보드 / 테이블 등) |

---

### `src/components/asset/` — 자산 도메인

| 파일 | 역할 |
|------|------|
| `dashboard_view.tsx` | 자산 대시보드. 요약 카드 4개 (총자산·총부채·순자산·투자평가) + 스냅샷 차트 |
| `asset_table.tsx` | 자산 목록 테이블. 드래그 순서 변경, 행 클릭으로 수정 모달 오픈 |
| `asset_modal.tsx` | 자산 생성/수정 모달. 자산 유형에 따라 투자 계좌 연동 옵션 표시 |
| `snapshot_chart.tsx` | 자산·부채·순자산 월별 추이 Recharts 라인 차트 |

---

### `src/components/debt/` — 부채 도메인

| 파일 | 역할 |
|------|------|
| `debt_table.tsx` | 부채 목록 테이블. 대출 유형 배지, 잔액 표시 |
| `debt_modal.tsx` | 부채 생성/수정 모달. 대출 유형(FIXED/REGULAR/VARIABLE)에 따라 필드 동적 변경 |

---

### `src/components/investment/` — 투자 도메인

| 파일 | 역할 |
|------|------|
| `investment_dashboard.tsx` | 투자 대시보드. 총평가액·수익률 요약 + 카테고리별 파이 차트 |
| `investment_table.tsx` | 투자 종목 목록 테이블. 현재가·수익률·평가금액 표시 |
| `investment_modal.tsx` | 투자 종목 생성/수정 모달. 티커 입력 시 현재가 자동 조회 |
| `investment_tab_bar.tsx` | 투자 대시보드 / 테이블 탭 전환 |

---

### `src/components/report/` — AI 리포트 도메인

| 파일 | 역할 |
|------|------|
| `report_view.tsx` | 리포트 목록 + 생성 버튼. SSE 진행률 표시 |
| `report_card.tsx` | 리포트 목록 카드 한 항목. 날짜·요약 표시, 클릭 시 상세 오픈 |
| `report_detail.tsx` | 리포트 상세 내용 렌더링 (마크다운) |

---

### `src/components/layout/` — 레이아웃

| 파일 | 역할 |
|------|------|
| `layout_wrapper.tsx` | 사이드바 + 헤더 + 메인 콘텐츠 영역을 조합하는 최상위 레이아웃 |
| `sidebar.tsx` | 좌측 네비게이션 사이드바. 메뉴 링크, 현재 경로 강조 |
| `header.tsx` | 상단 헤더. 로그아웃 버튼 |
| `conditional_layout.tsx` | 로그인·회원가입 페이지는 사이드바/헤더 없이, 나머지는 `layout_wrapper` 적용 |

---

### `src/components/ui/` — shadcn/ui 기본 컴포넌트

shadcn CLI로 생성된 기본 컴포넌트. 직접 수정하지 않고 `components/common/`에서 조합해 사용한다.

`badge`, `button`, `card`, `dialog`, `input`, `pagination`, `select`, `separator`, `table`, `tabs`

---

### `src/app/` — Next.js App Router 페이지

| 경로 | 파일 | 역할 |
|------|------|------|
| `/` | `page.tsx` | 루트. `/assets`로 리다이렉트 |
| `/login` | `login/page.tsx` | 로그인 페이지 |
| `/signup` | `signup/page.tsx` | 회원가입 페이지 |
| `/assets` | `assets/page.tsx` | 자산 대시보드 (Server Component, React Query prefetch) |
| `/assets/table` | `assets/table/page.tsx` | 자산 테이블 뷰 |
| `/assets` | `assets/layout.tsx` | 자산 탭바(대시보드/테이블) 레이아웃 |
| `/debts` | `debts/page.tsx` | 부채 관리 페이지 |
| `/investments` | `investments/page.tsx` | 투자 대시보드 |
| `/investments/table` | `investments/table/page.tsx` | 투자 종목 테이블 |
| `/investments` | `investments/layout.tsx` | 투자 탭바 레이아웃 |
| `/reports` | `reports/page.tsx` | AI 데일리 리포트 페이지 |
| — | `layout.tsx` | 루트 레이아웃. `QueryProvider`, `ConditionalLayout` 적용 |
| — | `globals.css` | 전역 스타일. 디자인 토큰 CSS import |

---

### `src/hooks/` — 커스텀 훅

| 파일 | 역할 |
|------|------|
| `use_generate_report_sse.ts` | AI 리포트 SSE 스트림 연결. 생성 진행 단계·퍼센트 상태 관리, 완료 시 `reports` 쿼리 무효화 |

---

### `src/providers/` — Provider

| 파일 | 역할 |
|------|------|
| `query_provider.tsx` | `QueryClientProvider` 래퍼. `ReactQueryDevtools` 포함. 클라이언트 컴포넌트 |

---

### `src/lib/` — 라이브러리 설정

| 파일 | 역할 |
|------|------|
| `query_client.ts` | `QueryClient` 싱글톤 팩토리. 서버/클라이언트 환경 분기, `staleTime` 기본값 설정 |
| `utils.ts` | `cn()` 함수 (`clsx` + `tailwind-merge`). shadcn/ui 클래스 병합용 |

---

### `src/types/` — TypeScript 타입

| 파일 | 역할 |
|------|------|
| `auth.ts` | `LoginRequest`, `SignupRequest`, `User` 타입 |
| `asset.ts` | `Asset`, `AssetType`, `AssetCreateRequest`, `AssetUpdateRequest` 타입 |
| `debt.ts` | `Debt`, `DebtType`, `DebtCreateRequest`, `DebtUpdateRequest` 타입 |
| `investment.ts` | `Investment`, `InvestmentCreateRequest`, `InvestmentUpdateRequest` 타입 |
| `report.ts` | `DailyReport`, `ProgressState` 타입 |
| `snapshot.ts` | `Snapshot` 타입 (날짜별 자산·부채·순자산 스냅샷) |
| `config.ts` | `ConfigItem` 타입 (`{ id: number; value: string }`) |
| `response.ts` | 백엔드 공통 응답 래퍼 타입 (`ApiResponse<T>`, `PageResponse<T>`) |

---

### `src/utils/` — 유틸리티 함수

| 파일 | 역할 |
|------|------|
| `format.ts` | 금액 원화 포맷 (`formatAmount`), 자산 유형 라벨 변환, 날짜 포맷 등 순수 함수 모음 |

---

### `src/constants/` — 상수

| 파일 | 역할 |
|------|------|
| `options.ts` | `OWNER_OPTIONS` (소유자 목록), `CATEGORY_COLORS` (차트 색상 팔레트) 등 앱 전역 상수 |

---

### `src/styles/tokens/` — 디자인 토큰

Tailwind v4 `@theme` 기반 3계층 토큰 시스템. `globals.css`에서 import된다.

| 파일 | 역할 |
|------|------|
| `base.css` | Layer 1 — 팔레트 원시값 정의 (색상 HEX, 크기 수치). 직접 사용 금지 |
| `semantic.css` | Layer 2 — 의미 기반 토큰 (`--color-primary`, `--color-bg-surface` 등). shadcn 호환 변수명 유지 |
| `motion.css` | Motion 토큰 — 인터랙션 easing, duration 변수 정의 |

---

### `src/middleware.ts`

Next.js Edge Middleware. 미인증 사용자가 보호된 경로 접근 시 `/login`으로 리다이렉트. 로그인된 사용자가 `/login`/`/signup` 접근 시 `/assets`로 리다이렉트.

---

### `tests/` — Playwright E2E 테스트

| 파일 | 역할 |
|------|------|
| `global.setup.ts` | 테스트 전 로그인 후 `.auth/user.json`에 인증 상태 저장 |
| `fixtures/auth.fixture.ts` | `apiCall()` 헬퍼 + 테스트 데이터 생성/정리 fixture |
| `auth.spec.ts` | 로그인·회원가입·로그아웃 시나리오 |
| `assets.spec.ts` | 자산 CRUD 시나리오 |
| `debts.spec.ts` | 부채 CRUD 시나리오 |
| `investments.spec.ts` | 투자 종목 CRUD 시나리오 |
| `snapshots.spec.ts` | 스냅샷 차트 렌더링 시나리오 |

```bash
npx playwright test          # 전체 실행
npx playwright test auth     # 특정 파일
npx playwright test --ui     # UI 모드
npx playwright show-report   # 결과 리포트
```

인증 상태는 `tests/global.setup.ts`에서 `.auth/user.json`에 저장되며, 이후 테스트에서 재사용합니다.

---

### `.claude/` — Claude Code 설정

AI 코딩 어시스턴트 Claude Code의 프로젝트별 설정 디렉토리.

| 경로 | 역할 |
|------|------|
| `CLAUDE.md` | Claude가 읽는 이 폴더 지침 |
| `settings.json` | 허용 명령, 훅 등록, 환경변수 설정 |
| `settings.local.json` | 로컬 전용 설정 (gitignore됨) |
| `settings.md` | 설정 상세 문서 |
| `skills/` | 도메인별 코딩 지침 (`/skill-name`으로 호출) |
| `commands/` | 슬래시 커맨드 정의 (`/커맨드명`으로 호출) |
| `hooks/` | 메시지 입력 시 관련 스킬 자동 추천 스크립트 |
| `agents/` | 서브에이전트 정의 (코드 리뷰어, GitHub 워크플로 등) |

---

### 루트 설정 파일

| 파일 | 역할 |
|------|------|
| `next.config.ts` | Next.js 설정 (이미지 도메인, 리다이렉트 등) |
| `tailwind.config.ts` | Tailwind CSS 설정 (v4에서는 최소화, 토큰은 CSS로 관리) |
| `components.json` | shadcn/ui CLI 설정 (경로, 스타일 테마) |
| `eslint.config.mjs` | ESLint 규칙 설정 |
| `.prettierrc` | Prettier 포맷 규칙 |
| `playwright.config.ts` | Playwright 테스트 설정 (baseURL, `workers: 1`, storageState) |
| `postcss.config.mjs` | PostCSS 설정 (Tailwind CSS 플러그인) |
| `tsconfig.json` | TypeScript 컴파일러 옵션 및 경로 별칭 (`@/` → `src/`) |
