import { test, expect } from '@playwright/test'

// ─── 인증 페이지는 storageState 없이 테스트 ───────────────────────────────────

test.describe('로그인 페이지', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('로그인 폼이 정상 렌더링된다', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText(/자산관리/)).toBeVisible()
    await expect(page.getByPlaceholder('아이디를 입력하세요')).toBeVisible()
    await expect(page.getByPlaceholder('비밀번호를 입력하세요')).toBeVisible()
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible()
    await expect(page.getByRole('link', { name: '회원가입' })).toBeVisible()
  })

  test('잘못된 자격증명으로 로그인 시 오류 메시지를 보여준다', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('아이디를 입력하세요').fill('wrong_user_xyz')
    await page.getByPlaceholder('비밀번호를 입력하세요').fill('wrong_password_xyz')
    await page.getByRole('button', { name: '로그인' }).click()
    await expect(
      page.getByText('아이디 또는 비밀번호가 올바르지 않습니다.'),
    ).toBeVisible({ timeout: 5_000 })
  })

  test('올바른 자격증명으로 로그인 성공 후 홈으로 이동한다', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('아이디를 입력하세요').fill(process.env.TEST_LOGIN_ID ?? 'testuser')
    await page.getByPlaceholder('비밀번호를 입력하세요').fill(process.env.TEST_PASSWORD ?? 'testpass')
    await page.getByRole('button', { name: '로그인' }).click()
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 })
  })
})

// ─── 회원가입 페이지 ───────────────────────────────────────────────────────────

test.describe('회원가입 페이지', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('회원가입 폼이 정상 렌더링된다', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByText('회원가입')).toBeVisible()
    await expect(page.getByPlaceholder('사용할 아이디를 입력하세요')).toBeVisible()
    await expect(page.getByPlaceholder('사용할 비밀번호를 입력하세요')).toBeVisible()
    await expect(page.getByRole('button', { name: '회원가입' })).toBeVisible()
    await expect(page.getByRole('link', { name: '로그인' })).toBeVisible()
  })

  test('이미 존재하는 아이디로 회원가입 시 오류를 보여준다', async ({ page }) => {
    await page.goto('/signup')
    await page.getByPlaceholder('사용할 아이디를 입력하세요').fill(process.env.TEST_LOGIN_ID ?? 'testuser')
    await page.getByPlaceholder('사용할 비밀번호를 입력하세요').fill('anypassword123')
    await page.getByRole('button', { name: '회원가입' }).click()
    await expect(
      page.getByText('회원가입에 실패했습니다.'),
    ).toBeVisible({ timeout: 5_000 })
  })
})

// ─── 로그아웃 (인증된 상태에서) ───────────────────────────────────────────────

test.describe('로그아웃', () => {
  test('로그아웃 후 로그인 페이지로 이동한다', async ({ page }) => {
    await page.goto('/assets')
    // 헤더의 로그아웃 버튼 클릭
    await page.getByRole('button', { name: /로그아웃/ }).click()
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })
})

// ─── 미인증 접근 ──────────────────────────────────────────────────────────────

test.describe('미인증 접근', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('보호된 페이지 접근 시 /login 으로 리다이렉트된다', async ({ page }) => {
    for (const path of ['/assets', '/assets/table', '/debts', '/investments', '/reports']) {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
    }
  })
})
