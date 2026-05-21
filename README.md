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
src/
├── api/          # Axios 기반 순수 fetch 함수
├── queries/      # TanStack Query 훅 (useQuery / useMutation)
├── components/
│   ├── common/   # 공통 UI (FormField, WonInput, TablePagination 등)
│   ├── asset/    # 자산 컴포넌트
│   ├── debt/     # 부채 컴포넌트
│   ├── investment/ # 투자 컴포넌트
│   ├── report/   # 리포트 컴포넌트
│   └── layout/   # 사이드바, 헤더
├── app/          # Next.js App Router 페이지
├── hooks/        # 커스텀 훅 (SSE 등)
├── types/        # TypeScript 타입 정의
└── utils/        # 포맷 유틸리티
```

## E2E 테스트

```bash
npx playwright test          # 전체 실행
npx playwright test auth     # 특정 파일
npx playwright test --ui     # UI 모드
npx playwright show-report   # 결과 리포트
```

인증 상태는 `tests/global.setup.ts`에서 `.auth/user.json`에 저장되며, 이후 테스트에서 재사용합니다.
