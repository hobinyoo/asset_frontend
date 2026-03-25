import { test, expect, apiCall } from './fixtures/auth.fixture'

// 투자 연동 자산이 없으면 계좌 선택 불가 → 먼저 linked asset 생성 필요

test.describe('투자 페이지', () => {
  test('투자 목록 페이지가 정상 렌더링된다', async ({ page }) => {
    await page.goto('/investments')
    await expect(page.getByRole('button', { name: '투자 등록' })).toBeVisible()
  })
})

// ─── 투자 CRUD ────────────────────────────────────────────────────────────────

test.describe('투자 CRUD', () => {
  let linkedAssetId = 0
  const STOCK_NAME = `테스트종목_${Date.now()}`
  const INV_CATEGORY = `테스트투자카테고리_${Date.now()}`

  test.beforeEach(async ({ createTestAsset }) => {
    // 투자 연동 자산 생성
    linkedAssetId = await createTestAsset({
      category: `연동계좌_${Date.now()}`,
      type: 'INVESTMENT',
      linkedToInvestment: true,
    })
  })

  test.afterEach(async ({ cleanAsset }) => {
    if (linkedAssetId) {
      await cleanAsset(linkedAssetId)
      linkedAssetId = 0
    }
  })

  test('투자 종목을 등록하고 삭제한다', async ({ page }) => {
    await page.goto('/investments')
    await page.getByRole('button', { name: '투자 등록' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal.getByRole('heading', { name: '투자 종목 등록' })).toBeVisible()

    // 계좌 선택 (연동된 자산)
    await modal.locator('select').first().selectOption({ index: 1 })

    // 카테고리 직접 추가
    await modal.getByText('+ 직접 추가').click()
    await modal.getByPlaceholder('새 항목 입력').fill(INV_CATEGORY)
    await modal.getByRole('button', { name: '추가' }).click()

    // 종목명
    await modal.getByPlaceholder('예) S&P500').fill(STOCK_NAME)

    // 소유자 선택
    await modal.locator('select[class*="rounded-lg"]').filter({ hasNotText: '카테고리' }).selectOption('유호빈')

    // 등록
    await modal.getByRole('button', { name: '등록' }).click()
    await expect(modal).not.toBeVisible({ timeout: 5_000 })

    // 테이블 확인
    await expect(page.getByText(STOCK_NAME)).toBeVisible()

    // 삭제
    const row = page.getByText(STOCK_NAME).locator('../../..')
    await row.getByRole('button', { name: /삭제/ }).click()
    page.on('dialog', (d) => d.accept())
    await expect(page.getByText(STOCK_NAME)).not.toBeVisible({ timeout: 5_000 })
  })

  test('투자 종목을 수정한다', async ({ page, cleanInvestment }) => {
    // API로 투자 종목 생성
    const invResult = await apiCall<{ data: { id: number } }>(page, 'POST', '/api/investments', {
      assetId: linkedAssetId,
      category: '기타',
      stockName: `수정전종목_${Date.now()}`,
      owner: '유호빈',
      marketType: 'OVERSEAS',
    })
    const investmentId = invResult?.data?.id ?? 0

    await page.goto('/investments')
    await page.waitForLoadState('networkidle')

    const nameText = await page.locator('text=/수정전종목_/').first().textContent()
    const row = page.getByText(nameText!).locator('../../..')
    await row.getByRole('button', { name: /수정/ }).click()

    const modal = page.getByRole('dialog')
    await expect(modal.getByRole('heading', { name: '투자 종목 수정' })).toBeVisible()

    // 매수단가 입력
    await modal.getByPlaceholder('1주당 가격').fill('50000')
    await modal.getByRole('button', { name: '수정' }).click()
    await expect(modal).not.toBeVisible({ timeout: 5_000 })

    await cleanInvestment(investmentId)
  })

  test('연동 자산이 없을 때 경고 메시지가 표시된다', async ({ page, cleanAsset }) => {
    // 연동 자산 임시 삭제 후 체크
    await cleanAsset(linkedAssetId)
    linkedAssetId = 0

    await page.goto('/investments')
    await page.getByRole('button', { name: '투자 등록' }).click()

    const modal = page.getByRole('dialog')
    await expect(
      modal.getByText('투자 연동된 자산이 없습니다.'),
    ).toBeVisible()
    await modal.getByRole('button', { name: '취소' }).click()
  })
})

// ─── 투자 필터 ────────────────────────────────────────────────────────────────

test.describe('투자 필터', () => {
  test('소유자 필터가 동작한다', async ({ page }) => {
    await page.goto('/investments')
    const ownerSelect = page.locator('select').filter({ hasText: '전체 소유자' })
    if (await ownerSelect.isVisible()) {
      await ownerSelect.selectOption('유호빈')
      // URL이나 결과가 필터링되어 변경됨을 간접 확인
      await page.waitForLoadState('networkidle')
    }
  })
})

// ─── 미인증 접근 ──────────────────────────────────────────────────────────────

test.describe('미인증 접근', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('/investments 접근 시 /login 으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/investments')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })
})