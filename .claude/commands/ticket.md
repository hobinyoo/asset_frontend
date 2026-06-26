---
description: JIRA/Linear 티켓을 처음부터 끝까지 처리
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(git:*), Bash(gh:*), Bash(npm:*), mcp__jira__*, mcp__github__*, mcp__linear__*
---

# 티켓 워크플로

작업 티켓: $ARGUMENTS

## 지침

### 1. 티켓 읽기

먼저 티켓을 가져와서 이해합니다:

```
JIRA/Linear MCP 도구를 사용하여:
- 티켓 상세 정보 가져오기 (제목, 설명, 완료 기준)
- 연결된 티켓 또는 에픽 확인
- 댓글 또는 첨부 파일 검토
```

요약:
- 무엇을 해야 하는가
- 완료 기준
- 블로커 또는 의존성

### 2. 코드베이스 탐색

코딩 전:
- 관련 코드 검색
- 현재 구현 이해
- 변경이 필요한 파일 파악

### 3. 브랜치 생성

```bash
git checkout -b {이니셜}/{티켓-ID}-{간략한-설명}
```

### 4. 변경 사항 구현

- 프로젝트 패턴 따르기 (관련 스킬 확인)
- 테스트 먼저 작성 (TDD)
- 점진적으로 커밋

### 5. 티켓 업데이트

작업 중:
- 진행 상황 업데이트 댓글 추가
- 상태 업데이트 (진행 중 → 리뷰 중)
- 블로커 또는 질문 기록

### 6. PR 생성 및 연결

준비가 되면:
- `gh pr create`로 PR 생성
- PR을 티켓에 연결
- PR 제목에 티켓 ID 추가: `feat(PROJ-123): 설명`

### 7. 버그 발견 시

작업 중 관련 없는 버그를 발견한 경우:
1. 상세 정보와 함께 새 티켓 생성
2. 관련이 있으면 현재 티켓에 연결
3. PR 설명에 기록
4. 원래 작업 계속

## 워크플로 예시

```
사용자: /ticket PROJ-123

Claude:
1. JIRA에서 PROJ-123 가져오는 중...
   제목: 사용자 프로필 아바타 업로드 추가
   설명: 사용자가 프로필 사진을 업로드할 수 있어야 함...
   완료 기준:
   - [ ] 프로필 페이지에 업로드 버튼
   - [ ] 최대 5MB JPG/PNG 지원
   - [ ] 업로드 중 로딩 상태 표시

2. 프로필 관련 코드 코드베이스 검색 중...
   발견: src/screens/Profile/ProfileScreen.tsx
   발견: src/components/Avatar/Avatar.tsx

3. 브랜치 생성: cw/PROJ-123-avatar-upload

4. [TDD 방식으로 기능 구현]

5. JIRA 상태를 "리뷰 중"으로 업데이트 중...
   댓글 추가: "구현 완료, PR 리뷰 준비됨"

6. PR 생성 및 PROJ-123에 연결 중...
   PR #456 생성: feat(PROJ-123): add avatar upload to profile
```
