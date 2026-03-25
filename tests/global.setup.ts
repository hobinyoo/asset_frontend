import { test as setup, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const AUTH_FILE = path.join(__dirname, '../.auth/user.json')

setup('글로벌 로그인 상태 저장', async ({ page }) => {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })

  await page.goto('/login')
  await expect(page.getByText(/자산관리/)).toBeVisible()

  await page
    .getByPlaceholder('아이디를 입력하세요')
    .fill(process.env.TEST_LOGIN_ID ?? 'testuser')
  await page
    .getByPlaceholder('비밀번호를 입력하세요')
    .fill(process.env.TEST_PASSWORD ?? 'testpass')
  await page.getByRole('button', { name: '로그인' }).click()

  // 로그인 성공 후 /login 이 아닌 페이지로 이동 확인
  await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 })

  await page.context().storageState({ path: AUTH_FILE })
})
