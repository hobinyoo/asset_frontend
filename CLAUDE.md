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

### 파일 네이밍

- 모든 파일명은 `snake_case.tsx`
- 컴포넌트 함수명은 `PascalCase`

### 환경변수

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_API_URL` | 백엔드 API base URL |
