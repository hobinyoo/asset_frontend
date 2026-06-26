---
description: 프로젝트 표준을 기반으로 풀 리퀘스트 리뷰
allowed-tools: Read, Glob, Grep, Bash(git:*), Bash(gh:*)
---

# PR 리뷰

리뷰 대상 PR: $ARGUMENTS

## 지침

1. **PR 정보 가져오기**:
   - `gh pr view $ARGUMENTS`로 PR 상세 정보 확인
   - `gh pr diff $ARGUMENTS`로 변경 사항 확인

2. **리뷰 기준 읽기**:
   - 리뷰 체크리스트를 위해 `.claude/agents/code-reviewer.md` 확인

3. **변경된 모든 파일에 체크리스트 적용**:
   - TypeScript strict 모드 준수
   - 에러 처리 패턴
   - 로딩/에러/빈 상태
   - 테스트 커버리지
   - 문서 업데이트

4. **구조화된 피드백 제공**:
   - **Critical**: 머지 전 반드시 수정
   - **Warning**: 수정 권장
   - **Suggestion**: 있으면 좋은 것

5. **`gh pr comment`로 리뷰 댓글 작성**
