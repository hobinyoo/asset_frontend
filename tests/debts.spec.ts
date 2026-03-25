import { test, expect, apiCall } from './fixtures/auth.fixture'

test.describe('부채 페이지', () => {
  test('부채 목록 페이지가 정상 렌더링된다', async ({ page }) => {
    await page.goto('/debts')
    await expect(page.getByRole('button', { name: '부채 등록' })).toBeVisible()
  })
})

// ─── 부채 CRUD ────────────────────────────────────────────────────────────────

test.describe('부채 CRUD', () => {
  const CATEGORY = `테스트부채_${Date.now()}`

  test('부채를 등록하고 삭제한다', async ({ page }) => {
    await page.goto('/debts')
    await page.getByRole('button', { name: '부채 등록' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal.getByRole('heading', { name: '부채 등록' })).toBeVisible()

    // 카테고리 입력
    await modal.getByPlaceholder('예) 신용대출, 주택청약대출').fill(CATEGORY)

    // 소유자 선택
    await modal.locator('select[class*="rounded-lg"]').first().selectOption('유호빈')

    // 부채 유형 — 기본값 '거치(FIXED)' 유지

    // 잔액 입력 (WonInput — 실제 input 타겟)
    await modal.locator('input[class*="rounded-lg"]').nth(1).fill('3000000')

    // 등록
    await modal.getByRole('button', { name: '등록' }).click()
    await expect(modal).not.toBeVisible({ timeout: 5_000 })

    // 테이블에 확인
    await expect(page.getByText(CATEGORY)).toBeVisible()

    // 삭제
    const row = page.getByText(CATEGORY).locator('../../..')
    await row.getByRole('button', { name: /삭제/ }).click()
    page.on('dialog', (d) => d.accept())
    await expect(page.getByText(CATEGORY)).not.toBeVisible({ timeout: 5_000 })
  })

  test('부채를 수정한다', async ({ page, cleanDebt }) => {
    // API로 테스트 부채 생성
    const created = await apiCall<{ data: { id: number } }>(page, 'POST', '/api/debts', {
      category: `수정전부채_${Date.now()}`,
      owner: '유호빈',
      amount: 2000000,
      type: 'FIXED',
    })
    const debtId = created?.data?.id ?? 0

    await page.goto('/debts')
    await page.waitForLoadState('networkidle')

    const categoryText = await page.locator('text=/수정전부채_/').first().textContent()
    const row = page.getByText(categoryText!).locator('../../..')
    await row.getByRole('button', { name: /수정/ }).click()

    const modal = page.getByRole('dialog')
    await expect(modal.getByRole('heading', { name: '부채 수정' })).toBeVisible()

    // 대출 목적 수정
    await modal.getByPlaceholder('예) 집보증금').fill('테스트목적')
    await modal.getByRole('button', { name: '수정' }).click()
    await expect(modal).not.toBeVisible({ timeout: 5_000 })

    await cleanDebt(debtId)
  })

  test('정기 부채 등록 시 월 상환액/날짜 필드가 표시된다', async ({ page }) => {
    await page.goto('/debts')
    await page.getByRole('button', { name: '부채 등록' }).click()

    const modal = page.getByRole('dialog')

    // 부채 유형을 '정기'로 변경
    await modal.locator('select').filter({ hasText: '거치' }).selectOption('REGULAR')

    await expect(modal.getByText('월 상환액')).toBeVisible()
    await expect(modal.getByText('월 상환일')).toBeVisible()

    // 취소
    await modal.getByRole('button', { name: '취소' }).click()
  })
})

// ─── 미인증 접근 ──────────────────────────────────────────────────────────────

test.describe('미인증 접근', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('/debts 접근 시 /login 으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/debts')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })
})