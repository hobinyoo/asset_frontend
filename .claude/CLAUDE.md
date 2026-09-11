# .claude 폴더 지침

이 폴더는 Claude Code 프로젝트 설정 디렉토리다. 루트의 `CLAUDE.md`와 함께 읽힌다.

## 폴더 구조

```
.claude/
├── settings.json          # 권한, 훅, 환경변수 설정
├── settings.local.json    # 로컬 전용 설정 (gitignore)
├── settings.md            # 설정 문서
├── skills/                # 도메인별 코딩 지침 (스킬)
├── commands/              # 슬래시 커맨드 정의
├── hooks/                 # 자동화 훅 스크립트
└── agents/                # 서브에이전트 정의
```

## skills/

`/skill-name` 슬래시 커맨드로 호출하거나 훅에 의해 자동 추천된다.

현재 스킬 목록:
- `component-design` — shadcn + cva + cn 컴포넌트 설계
- `design-tokens` — Tailwind v4 디자인 토큰 퍼블리싱
- `loading-error` — TanStack Query 로딩/에러 처리
- `react-query` — React Query 패턴 (쿼리 키, useQuery/useMutation)
- `rendering-skills` — Next.js App Router 렌더링 전략
- `shadcn-ui` — shadcn/ui + Tailwind v4 퍼블리싱
- `tanstack-form` — TanStack Form + Zod 폼 패턴
- `state-management` — 상태 관리 도구 선택 기준
- `security` — 프론트엔드 보안 코딩 규칙
- `systematic-debugging` — 4단계 디버깅 방법론
- `performance-measurement` — 성능 지표 측정
- `performance-optimization` — 성능 최적화 기법
- `web-accessibility` — KWCAG 2.2 웹 접근성

## commands/

`/커맨드명`으로 호출하는 슬래시 커맨드.

- `code-quality` — 디렉토리 코드 품질 검사
- `docs-sync` — 문서와 코드 동기화 확인
- `onboard` — 프로젝트 온보딩
- `pr-review` — PR 리뷰
- `pr-summary` — PR 요약 생성
- `ticket` — JIRA/Linear 티켓 처리

## hooks/

`settings.json`의 `hooks` 섹션에서 참조한다.

- `skill-eval.sh` / `skill-eval.js` — UserPromptSubmit 시 관련 스킬 자동 추천
- `skill-rules.json` — 스킬 트리거 키워드 규칙
- `skill-rules.schema.json` — 규칙 파일 JSON 스키마

## 주의사항

- `settings.local.json`은 `.gitignore`에 포함됨 — 민감한 로컬 설정은 여기에
- 스킬 추가 시 `hooks/skill-rules.json`에 트리거 규칙도 같이 추가
- 새 커맨드는 `commands/커맨드명.md` 파일로 추가
