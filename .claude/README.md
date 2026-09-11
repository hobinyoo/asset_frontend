# .claude 폴더

Claude Code 프로젝트 설정 디렉토리. 스킬, 커맨드, 훅, 에이전트를 정의해 Claude가 이 프로젝트에서 어떻게 동작할지 제어한다.

## 폴더 구조

```
.claude/
├── CLAUDE.md              # Claude가 읽는 이 폴더 지침 (루트 CLAUDE.md와 함께 로드)
├── README.md              # 이 파일 — 사람이 읽는 문서
├── settings.json          # 권한, 훅, 환경변수 설정
├── settings.local.json    # 로컬 전용 설정 (gitignore됨)
├── settings.md            # settings.json 상세 문서
├── skills/                # 도메인별 코딩 지침 (스킬)
│   ├── README.md          # 스킬 추가 방법 안내
│   ├── component-design/SKILL.md
│   ├── design-tokens/SKILL.md
│   ├── loading-error/SKILL.md
│   ├── performance-measurement/SKILL.md
│   ├── performance-optimization/SKILL.md
│   ├── react-query/SKILL.md
│   ├── rendering-skills/SKILL.md
│   ├── security/SKILL.md
│   ├── shadcn-ui/SKILL.md
│   ├── state-management/SKILL.md
│   ├── systematic-debugging/SKILL.md
│   ├── tanstack-form/SKILL.md
│   └── web-accessibility/SKILL.md
├── commands/              # 슬래시 커맨드 정의
│   ├── code-quality.md
│   ├── docs-sync.md
│   ├── onboard.md
│   ├── pr-review.md
│   ├── pr-summary.md
│   └── ticket.md
├── hooks/                 # 자동화 훅 스크립트
│   ├── skill-eval.sh      # 훅 진입점 (bash → Node.js 위임)
│   ├── skill-eval.js      # 스킬 평가 엔진 (Node.js)
│   ├── skill-rules.json   # 스킬 트리거 키워드·패턴 규칙
│   └── skill-rules.schema.json  # 규칙 파일 JSON 스키마
└── agents/                # 서브에이전트 정의
    ├── code-reviewer.md
    └── github-workflow.md
```

---

## settings.json

Claude Code의 핵심 설정 파일. 세 가지 역할을 한다.

### 환경변수 (`env`)

```json
{
  "INSIDE_CLAUDE_CODE": "1",
  "BASH_DEFAULT_TIMEOUT_MS": "420000"
}
```

훅이나 하위 프로세스에서 Claude Code 실행 여부를 감지할 때 `INSIDE_CLAUDE_CODE` 환경변수를 사용한다.

### 자동화 훅 (`hooks`)

| 이벤트 | 매처 | 동작 |
|--------|------|------|
| `UserPromptSubmit` | — | `skill-eval.sh` 실행 → 관련 스킬 자동 추천 |
| `PreToolUse` | `Edit\|Write` | `main` 브랜치에서 파일 수정 시 차단 |
| `PostToolUse` | `Edit\|Write` | `.ts/.tsx` 파일 저장 시 Prettier 자동 포맷 |
| `PostToolUse` | `Edit\|Write` | `package.json` 변경 시 `npm install` 자동 실행 |
| `PostToolUse` | `Edit\|Write` | `.test.ts` 파일 변경 시 관련 테스트 자동 실행 |
| `PostToolUse` | `Edit\|Write` | `.ts/.tsx` 저장 시 `tsc --noEmit` TypeScript 타입 체크 |

### settings.local.json

`.gitignore`에 포함된 로컬 전용 설정. API 키, 로컬 경로 등 민감한 값을 여기에 넣는다. 구조는 `settings.json`과 동일.

---

## skills/ — 스킬

메시지를 입력하면 `skill-eval.sh` 훅이 자동으로 관련 스킬을 추천한다. `/skill-name`으로 직접 호출할 수도 있다.

### 스킬 목록

| 스킬 | 호출 | 역할 |
|------|------|------|
| `component-design` | `/component-design` | shadcn + cva + cn 기반 컴포넌트 설계 원칙. 새 컴포넌트/모달/폼 작성 시 |
| `design-tokens` | `/design-tokens` | Tailwind v4 디자인 토큰 퍼블리싱. `src/styles/tokens/` 작업 시 |
| `loading-error` | `/loading-error` | TanStack Query 기준 로딩/에러 처리 패턴. `loading.tsx`, Suspense 선택 기준 |
| `performance-measurement` | `/performance-measurement` | 번들 사이즈, Web Vitals, Lighthouse 측정 방법 |
| `performance-optimization` | `/performance-optimization` | preload/prefetch, Code Splitting, LCP/FCP 개선 기법 |
| `react-query` | `/react-query` | 쿼리 키 관리, useQuery/useMutation 작성, invalidate 규칙. `src/queries/` 작업 시 |
| `rendering-skills` | `/rendering-skills` | Next.js App Router 렌더링 전략. SSR/RSC/Static, HydrationBoundary 선택 기준 |
| `security` | `/security` | XSS, CSRF, 인증 토큰 저장, 환경변수 노출 방지 |
| `shadcn-ui` | `/shadcn-ui` | shadcn/ui + Tailwind v4 + cva + cn 퍼블리싱. `src/components/ui/`, `common/` 작업 시 |
| `state-management` | `/state-management` | Zustand, Jotai, Context API, React Query 중 무엇을 쓸지 결정 기준 |
| `systematic-debugging` | `/systematic-debugging` | 4단계 근본 원인 분석 디버깅 방법론 |
| `tanstack-form` | `/tanstack-form` | TanStack Form + Zod 유효성 검증 패턴. 폼/모달 작성 시 |
| `web-accessibility` | `/web-accessibility` | KWCAG 2.2 접근성. 인터랙티브 컴포넌트, 폼, aria 작업 시 |

### 스킬 추가 방법

```
skills/my-skill/
└── SKILL.md        ← 프론트매터 + 지침 내용
```

`SKILL.md` 프론트매터:
```yaml
---
name: my-skill
description: 이 스킬이 무엇을 하는지, 언제 트리거되는지.
---
```

스킬 추가 후 `hooks/skill-rules.json`에 트리거 규칙도 추가해야 자동 추천된다.

---

## commands/ — 슬래시 커맨드

`commands/커맨드명.md` 파일 → `/커맨드명`으로 호출.

| 커맨드 | 역할 |
|--------|------|
| `/code-quality` | 특정 디렉토리의 코드 품질 점검 (타입, 패턴, 규칙 준수) |
| `/docs-sync` | 문서(CLAUDE.md, README.md)가 코드와 동기화되어 있는지 확인 |
| `/onboard` | 새 기여자를 위한 프로젝트 온보딩 가이드 생성 |
| `/pr-review` | 프로젝트 표준 기반 PR 리뷰 |
| `/pr-summary` | 현재 브랜치 변경 사항으로 PR 요약 초안 생성 |
| `/ticket` | JIRA/Linear 티켓을 처음부터 끝까지 처리 (분석 → 구현 → 커밋) |

### 커맨드 추가 방법

```
commands/my-command.md
```

파일 내용이 `/my-command` 실행 시 Claude에게 전달되는 지침이 된다.

---

## hooks/ — 훅 스크립트

### skill-eval.sh

`UserPromptSubmit` 이벤트에 등록된 훅 진입점. Node.js가 있으면 `skill-eval.js`에 위임하고, 없으면 조용히 종료한다.

### skill-eval.js

스킬 평가 엔진. 메시지 입력 시 다음 신호를 분석해 관련 스킬을 추천한다.

- **keywords** — 메시지에 특정 단어가 포함될 때
- **keywordPatterns** — 정규식 패턴 매칭
- **pathPatterns** — 메시지에 언급된 파일 경로
- **intentPatterns** — "만들어줘", "수정해줘" 같은 의도 패턴
- **directoryMappings** — 작업 중인 디렉토리 기반 자동 매핑
- **contentPatterns** — 코드 내 특정 식별자 존재 여부

### skill-rules.json

각 스킬의 트리거 조건을 정의하는 규칙 파일.

```jsonc
{
  "version": "2.0",
  "config": {
    "minConfidenceScore": 3,   // 이 점수 이상일 때만 추천
    "maxSkillsToShow": 5       // 최대 추천 스킬 수
  },
  "directoryMappings": {
    "src/queries": "react-query",      // 이 폴더 작업 시 react-query 추천
    "src/components": "component-design"
  },
  "skills": {
    "react-query": {
      "triggers": {
        "keywords": ["useQuery", "캐시", "패칭"],
        "pathPatterns": ["**/queries/**"]
      }
    }
  }
}
```

### skill-rules.schema.json

`skill-rules.json`의 JSON Schema. IDE에서 자동완성 및 유효성 검사를 위해 사용.

---

## agents/ — 서브에이전트

Claude가 특정 역할을 맡아 독립적으로 실행하는 서브에이전트 정의.

### code-reviewer.md

- **모델**: Claude Opus
- **역할**: 코드 작성·수정 후 자동으로 리뷰. TypeScript strict 모드, 보안, 성능, 로딩/에러 상태 패턴 점검
- **체크리스트**: `any` 금지, 얼리 리턴, 뮤테이션 중 버튼 비활성화, 에러 순서(에러 → 로딩 → 빈 상태 → 성공)

### github-workflow.md

- **모델**: Claude Sonnet
- **역할**: 커밋, 브랜치, PR 생성. Conventional Commits 형식 준수
- **브랜치 네이밍**: `{이니셜}/{설명}` (예: `jd/fix-login-button`)
- **커밋 타입**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 자동화 흐름 요약

```
사용자 메시지 입력
    ↓
UserPromptSubmit 훅 실행
    ↓
skill-eval.sh → skill-eval.js
    ↓
skill-rules.json 기반 점수 계산
    ↓
관련 스킬 자동 추천 (minConfidenceScore 이상)

파일 저장 (Edit/Write)
    ↓
PreToolUse: main 브랜치 차단 확인
    ↓
PostToolUse: Prettier 포맷 → TypeScript 타입 체크
            (package.json이면 npm install, .test 파일이면 테스트 실행)
```