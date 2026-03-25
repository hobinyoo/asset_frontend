import { test, expect } from './fixtures/auth.fixture'

// ─── 대시보드 (/assets) ───────────────────────────────────────────────────────

test.describe('자산 대시보드', () => {
  test('요약 카드 4개가 렌더링된다', async ({ page }) => {
    await page.goto('/assets')
    await expect(page.getByText('총 자산 (부부 합산)')).toBeVisible()
    await expect(page.getByText('월 납입 합계')).toBeVisible()
    await expect(page.getByText('노후 대비 자산')).toBeVisible()
    await expect(page.getByText('유동 투자 자산')).toBeVisible()
  })

  test('자산·부채·순자산 추이 차트가 렌더링된다', async ({ page }) => {
    await page.goto('/assets')
    await expect(page.getByText('자산·부채·순자산 추이')).toBeVisible()
    // 기간 탭 4개 확인
    for (const label of ['7일', '30일', '90일', '1년']) {
      await expect(page.getByRole('button', { name: label })).toBeVisible()
    }
  })

  test('탭바 — 전체 요약 / 자산 구성 링크가 존재한다', async ({ page }) => {
    await page.goto('/assets')
    await expect(page.getByRole('link', { name: '전체 요약' })).toBeVisible()
    await expect(page.getByRole('link', { name: '자산 구성' })).toBeVisible()
  })
})

// ─── 자산 구성 테이블 (/assets/table) ────────────────────────────────────────

test.describe('자산 구성 테이블', () => {
  test('테이블 페이지가 정상 렌더링된다', async ({ page }) => {
    await page.goto('/assets/table')
    await expect(page.getByRole('button', { name: '자산 등록' })).toBeVisible()
  })
})

// ─── 자산 CRUD ────────────────────────────────────────────────────────────────

test.describe('자산 CRUD', () => {
  const CATEGORY = `테스트카테고리_${Date.now()}`
  const OWNER = `테스트소유자_${Date.now()}`
  const AMOUNT = '5000000'

  test('자산을 등록하고 삭제한다', async ({ page }) => {
    await page.goto('/assets/table')

    // 등록 모달 열기
    await page.getByRole('button', { name: '자산 등록' }).click()
    const modal = page.getByRole('dialog')
    await expect(modal.getByRole('heading', { name: '자산 등록' })).toBeVisible()

    // 카테고리 직접 추가
    await modal.getByText('+ 직접 추가').first().click()
    await modal.getByPlaceholder('새 항목 입력').first().fill(CATEGORY)
    await modal.getByRole('button', { name: '추가' }).first().click()
    // 추가 후 select로 전환되어 해당 값이 선택됨
    await expect(modal.locator('select').first()).toHaveValue(CATEGORY)

    // 소유자 직접 추가
    await modal.getByText('+ 직접 추가').click()
    await modal.getByPlaceholder('새 항목 입력').fill(OWNER)
    await modal.getByRole('button', { name: '추가' }).click()
    await expect(modal.locator('select').nth(1)).toHaveValue(OWNER)

    // 자산 유형 선택 (SAVINGS - 청약·공제)
    await modal.locator('select').nth(2).selectOption('SAVINGS')

    // 금액 입력
    await modal.getByPlaceholder('0').fill(AMOUNT)

    // 등록 버튼
    await modal.getByRole('button', { name: '등록' }).click()
    await expect(modal).not.toBeVisible({ timeout: 5_000 })

    // 테이블에 등록된 항목 확인
    await expect(page.getByText(CATEGORY)).toBeVisible()

    // 삭제
    const row = page.getByText(CATEGORY).locator('../../..')
    await row.getByRole('button', { name: /삭제/ }).click()
    // 확인 다이얼로그가 있을 경우 수락
    page.on('dialog', (d) => d.accept())
    await expect(page.getByText(CATEGORY)).not.toBeVisible({ timeout: 5_000 })
  })

  test('자산을 수정한다', async ({ page, createTestAsset, cleanAsset }) => {
    const assetId = await createTestAsset({ category: `수정전_${Date.now()}` })

    await page.goto('/assets/table')
    await page.waitForLoadState('networkidle')

    // 생성한 자산의 수정 버튼 클릭
    const categoryText = await page
      .locator('text=/수정전_/')
      .first()
      .textContent()
    const row = page.getByText(categoryText!).locator('../../..')
    await row.getByRole('button', { name: /수정/ }).click()

    const modal = page.getByRole('dialog')
    await expect(modal.getByRole('heading', { name: '자산 수정' })).toBeVisible()

    // 금액 변경
    await modal.getByPlaceholder('0').clear()
    await modal.getByPlaceholder('0').fill('9999999')
    await modal.getByRole('button', { name: '수정' }).click()
    await expect(modal).not.toBeVisible({ timeout: 5_000 })

    await cleanAsset(assetId)
  })
})

// ─── 미인증 접근 ──────────────────────────────────────────────────────────────

test.describe('미인증 접근', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('/assets 접근 시 /login 으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/assets')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('/assets/table 접근 시 /login 으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/assets/table')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })
})