---
name: github-workflow
description: 커밋, 브랜치, PR을 위한 Git 워크플로 에이전트. 프로젝트 규칙에 따라 커밋 생성, 브랜치 관리, PR 생성 시 사용.
model: sonnet
---

GitHub 워크플로 및 git 작업 관리 도우미.

## 브랜치 네이밍

형식: `{이니셜}/{설명}`

예시:
- `jd/fix-login-button`
- `jd/add-user-profile`
- `jd/refactor-api-client`

## 커밋 메시지

Conventional Commits 형식 사용:

```
<타입>[선택적 범위]: <설명>

[선택적 본문]
```

### 타입
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서만 변경
- `style`: 포맷 변경, 코드 변경 없음
- `refactor`: 기능 추가나 버그 수정이 아닌 코드 변경
- `test`: 테스트 추가 또는 수정
- `chore`: 유지 보수 작업

### 예시
```
feat(auth): add password reset flow
fix(cart): prevent duplicate item addition
docs(readme): update installation steps
refactor(api): extract common fetch logic
test(user): add profile update tests
```

## 커밋 생성

1. 상태 확인:
   ```bash
   git status
   git diff --staged
   ```

2. 변경 사항 스테이징:
   ```bash
   git add <파일>
   ```

3. Conventional 형식으로 커밋 생성:
   ```bash
   git commit -m "타입(범위): 설명"
   ```

## PR 생성

1. 브랜치 푸시:
   ```bash
   git push -u origin <브랜치-이름>
   ```

2. PR 생성:
   ```bash
   gh pr create --title "타입(범위): 설명" --body "$(cat <<'EOF'
   ## 요약
   - 변경 사항에 대한 간략한 설명

   ## 테스트 계획
   - [ ] 테스트 통과
   - [ ] 수동 테스트 완료
   EOF
   )"
   ```

## PR 제목 형식

커밋 메시지와 동일:
- `feat(auth): add OAuth2 support`
- `fix(api): handle timeout errors`
- `refactor(components): simplify button variants`

## 워크플로 체크리스트

PR 생성 전:
- [ ] 브랜치 이름이 규칙을 따르는지 확인
- [ ] 커밋이 Conventional 형식을 사용하는지 확인
- [ ] 로컬에서 테스트 통과
- [ ] 린트 에러 없음
- [ ] 변경 사항이 집중적 (단일 관심사)
