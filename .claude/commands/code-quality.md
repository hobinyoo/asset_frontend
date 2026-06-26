---
description: 디렉토리의 코드 품질 검사 실행
allowed-tools: Read, Glob, Grep, Bash(npm:*), Bash(npx:*)
---

# 코드 품질 리뷰

리뷰 대상 코드: $ARGUMENTS

## 지침

1. **리뷰할 파일 파악**:
   - 디렉토리 내 모든 `.ts` 및 `.tsx` 파일 찾기
   - 테스트 파일 및 생성된 파일 제외

2. **자동화 검사 실행**:
   ```bash
   npm run lint -- $ARGUMENTS
   npm run typecheck
   ```

3. **수동 리뷰 체크리스트**:
   - [ ] TypeScript `any` 타입 없음
   - [ ] 적절한 에러 처리
   - [ ] 로딩 상태 올바르게 처리
   - [ ] 리스트에 빈 상태 존재
   - [ ] 뮤테이션에 onError 핸들러 존재
   - [ ] 비동기 작업 중 버튼 비활성화

4. **심각도별 결과 보고**:
   - Critical (반드시 수정)
   - Warning (수정 권장)
   - Suggestion (개선 고려)
