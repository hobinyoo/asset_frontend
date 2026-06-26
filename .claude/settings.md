# Claude Code 설정 문서

## 환경 변수

- `INSIDE_CLAUDE_CODE`: "1" - Claude Code 내부에서 실행 중임을 나타냄
- `BASH_DEFAULT_TIMEOUT_MS`: bash 명령어 기본 타임아웃 (7분)
- `BASH_MAX_TIMEOUT_MS`: bash 명령어 최대 타임아웃

## 훅

### UserPromptSubmit

- **스킬 평가**: 프롬프트를 분석하여 관련 스킬 추천
  - **스크립트**: `.claude/hooks/skill-eval.sh`
  - **동작**: 키워드, 파일 경로, 패턴을 매칭하여 스킬 제안

### PreToolUse

- **main 브랜치 보호**: main 브랜치에서 편집 차단 (5초 타임아웃)
  - **트리거**: Edit, MultiEdit, Write 도구로 파일 편집 전
  - **동작**: main 브랜치에서 파일 편집 차단, 피처 브랜치 생성 안내

### PostToolUse

1. **코드 포맷**: JS/TS 파일 자동 포맷 (30초 타임아웃)
   - **트리거**: `.js`, `.jsx`, `.ts`, `.tsx` 파일 편집 후
   - **명령어**: `npx prettier --write` (또는 Biome)
   - **동작**: 코드 포맷 적용, 오류 발생 시 피드백 표시

2. **NPM 설치**: package.json 변경 후 자동 설치 (60초 타임아웃)
   - **트리거**: `package.json` 파일 편집 후
   - **명령어**: `npm install`
   - **동작**: 의존성 설치, 실패 시 편집 실패 처리

3. **테스트 실행**: 테스트 파일 변경 후 테스트 자동 실행 (90초 타임아웃)
   - **트리거**: `.test.js`, `.test.jsx`, `.test.ts`, `.test.tsx` 파일 편집 후
   - **명령어**: `npm test -- --findRelatedTests <file> --passWithNoTests`
   - **동작**: 관련 테스트 실행, 결과 표시 (비차단)

4. **TypeScript 검사**: TS/TSX 파일 타입 체크 (30초 타임아웃)
   - **트리거**: `.ts`, `.tsx` 파일 편집 후
   - **명령어**: `npx tsc --noEmit`
   - **동작**: 첫 번째 오류만 표시 (비차단)

## 훅 응답 형식

```json
{
  "feedback": "표시할 메시지",
  "suppressOutput": true,
  "block": true,
  "continue": false
}
```

## 훅에서 사용 가능한 환경 변수

- `$CLAUDE_TOOL_INPUT_FILE_PATH`: 편집 중인 파일 경로
- `$CLAUDE_TOOL_NAME`: 사용 중인 도구 이름
- `$CLAUDE_PROJECT_DIR`: 프로젝트 루트 디렉토리

## 종료 코드

- `0`: 성공
- `1`: 비차단 오류 (피드백 표시)
- `2`: 차단 오류 (PreToolUse 전용 - 작업 차단)
