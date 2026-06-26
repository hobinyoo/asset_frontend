# Claude Code 스킬

이 디렉토리에는 Claude에게 이 코드베이스의 도메인 지식과 모범 사례를 제공하는 프로젝트별 스킬이 포함되어 있습니다.

## 카테고리별 스킬

### 코드 품질 & 패턴
| 스킬 | 설명 |
|-------|-------------|
| [testing-patterns](./testing-patterns/SKILL.md) | Jest 테스트, 팩토리 함수, 모킹 전략, TDD 워크플로 |
| [systematic-debugging](./systematic-debugging/SKILL.md) | 4단계 디버깅 방법론, 근본 원인 분석 |

### React & UI
| 스킬 | 설명 |
|-------|-------------|
| [react-ui-patterns](./react-ui-patterns/SKILL.md) | React 패턴, 로딩 상태, 에러 처리, GraphQL 훅 |
| [core-components](./core-components/SKILL.md) | 디자인 시스템 컴포넌트, 토큰, 컴포넌트 라이브러리 |
| [formik-patterns](./formik-patterns/SKILL.md) | 폼 처리, 유효성 검사, 제출 패턴 |

### 데이터 & API
| 스킬 | 설명 |
|-------|-------------|
| [graphql-schema](./graphql-schema/SKILL.md) | GraphQL 쿼리, 뮤테이션, 코드 생성 |

## 일반적인 작업을 위한 스킬 조합

### 새 기능 개발 시
1. **react-ui-patterns** - 로딩/에러/빈 상태
2. **graphql-schema** - 쿼리/뮤테이션 생성
3. **core-components** - UI 구현
4. **testing-patterns** - 테스트 작성 (TDD)

### 폼 개발 시
1. **formik-patterns** - 폼 구조 및 유효성 검사
2. **graphql-schema** - 제출용 뮤테이션
3. **react-ui-patterns** - 로딩/에러 처리

### 이슈 디버깅 시
1. **systematic-debugging** - 근본 원인 분석
2. **testing-patterns** - 실패하는 테스트 먼저 작성

## 스킬 작동 방식

Claude가 관련 컨텍스트를 인식하면 스킬이 자동으로 호출됩니다. 각 스킬은 다음을 제공합니다:

- **사용 시점** - 트리거 조건
- **핵심 패턴** - 모범 사례 및 예시
- **안티 패턴** - 피해야 할 것들
- **연동** - 스킬 간 연결 방법

## 새 스킬 추가 방법

1. 디렉토리 생성: `.claude/skills/스킬-이름/`
2. YAML 프론트매터가 포함된 `SKILL.md` 추가 (대소문자 구분):
   ```yaml
   ---
   # 필수 필드
   name: skill-name              # 소문자, 하이픈 사용, 최대 64자
   description: 기능과 사용 시점. 트리거 키워드 포함.  # 최대 1024자

   # 선택 필드
   allowed-tools: Read, Grep, Glob    # 사용 가능한 도구 제한
   model: claude-sonnet-4-20250514    # 특정 모델 지정
   ---
   ```
3. 표준 섹션 포함: 사용 시점, 핵심 패턴, 안티 패턴, 연동
4. 이 README에 추가
5. `.claude/hooks/skill-rules.json`에 트리거 추가

**중요:** `description` 필드가 핵심입니다—Claude는 이 필드의 시맨틱 매칭을 통해 스킬 적용 여부를 결정합니다. 사용자가 자연스럽게 언급할 키워드를 포함하세요.

## 유지 관리

- 패턴 변경 시 스킬 업데이트
- 오래된 정보 제거
- 새로운 패턴 추가
- 예시를 코드베이스 현황에 맞게 유지
