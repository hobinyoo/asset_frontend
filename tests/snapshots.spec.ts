import { test, expect } from '@playwright/test'

test.describe('스냅샷 차트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/assets')
    // 차트 섹션 로드 대기
    await expect(page.getByText('자산·부채·순자산 추이')).toBeVisible()
  })

  test('차트 컨테이너가 렌더링된다', async ({ page }) => {
    const chartSection = page.getByText('자산·부채·순자산 추이').locator('..')
    await expect(chartSection).toBeVisible()
  })

  test('기간 탭 4개가 모두 표시된다', async ({ page }) => {
    const periods = ['7일', '30일', '90일', '1년']
    for (const label of periods) {
      await expect(page.getByRole('button', { name: label })).toBeVisible()
    }
  })

  test('기본 선택 탭은 30일이다', async ({ page }) => {
    const btn30 = page.getByRole('button', { name: '30일' })
    await expect(btn30).toHaveClass(/bg-blue-500/)
  })

  test('7일 탭 클릭 시 활성 탭이 변경된다', async ({ page }) => {
    await page.getByRole('button', { name: '7일' }).click()
    await expect(page.getByRole('button', { name: '7일' })).toHaveClass(/bg-blue-500/)
    await expect(page.getByRole('button', { name: '30일' })).not.toHaveClass(/bg-blue-500/)
  })

  test('90일 탭 클릭 후 1년 탭으로 전환한다', async ({ page }) => {
    await page.getByRole('button', { name: '90일' }).click()
    await expect(page.getByRole('button', { name: '90일' })).toHaveClass(/bg-blue-500/)

    await page.getByRole('button', { name: '1년' }).click()
    await expect(page.getByRole('button', { name: '1년' })).toHaveClass(/bg-blue-500/)
    await expect(page.getByRole('button', { name: '90일' })).not.toHaveClass(/bg-blue-500/)
  })

  test('데이터 없을 때 빈 상태 문구 또는 차트가 표시된다', async ({ page }) => {
    // 차트 또는 빈 상태 중 하나가 표시되어야 함
    const hasChart = await page.locator('.recharts-wrapper').isVisible()
    const hasEmpty = await page.getByText('데이터가 없습니다').isVisible()
    expect(hasChart || hasEmpty).toBe(true)
  })
})

// ─── 미인증 접근 ──────────────────────────────────────────────────────────────

test.describe('미인증 접근', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('/assets 접근 시 /login 으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/assets')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })
})