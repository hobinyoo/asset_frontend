/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, type Page } from '@playwright/test'

// 백엔드 API URL (환경변수 없으면 localhost:8080 사용)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

/**
 * 현재 브라우저 context의 쿠키를 Cookie 헤더 문자열로 변환
 * 로그인 후 저장된 access_token, refresh_token을 API 요청에 실어보내기 위함
 * 예: "access_token=eyJ...; refresh_token=eyJ..."
 */
export async function getCookieHeader(page: Page): Promise<string> {
  const cookies = await page.context().cookies()
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ')
}

/**
 * 백엔드에 직접 API 요청하는 유틸 함수
 * UI를 거치지 않고 API를 직접 호출할 때 사용
 * 주로 테스트 데이터 준비(given) / 정리(cleanup)에 활용
 */
export async function apiCall<T = unknown>(
  page: Page, // 현재 브라우저 page (쿠키 꺼내기 위해 필요)
  method: string, // HTTP 메서드 (GET, POST, DELETE 등)
  path: string, // API 경로 (/api/assets 등)
  body?: unknown, // 요청 body (없으면 undefined)
): Promise<T | null> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Cookie: await getCookieHeader(page), // 로그인 쿠키 담아서 전송
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!text) return null
  return JSON.parse(text)
}

/**
 * 테스트 fixture 타입 정의
 * 각 테스트에서 공통으로 사용할 헬퍼 함수 모음
 */
type ApiFixture = {
  /** 테스트용 자산 생성 (UI 없이 백엔드 직접 호출) */
  createTestAsset: (overrides?: Record<string, unknown>) => Promise<number>
  /** 테스트 후 자산 정리 (DB에서 삭제) */
  cleanAsset: (id: number) => Promise<void>
  /** 테스트 후 부채 정리 */
  cleanDebt: (id: number) => Promise<void>
  /** 테스트 후 투자 정리 */
  cleanInvestment: (id: number) => Promise<void>
}

/**
 * 커스텀 test fixture
 * base.extend로 Playwright 기본 test에 ApiFixture 기능을 추가
 * 모든 spec 파일에서 이 test를 import해서 사용
 */
export const test = base.extend<ApiFixture>({
  // 테스트용 자산 생성 fixture
  // UI 클릭 없이 API 직접 호출 → 테스트 준비 시간 단축
  createTestAsset: async ({ page }, use) => {
    await use(async (overrides = {}) => {
      const result = await apiCall<{ data: { id: number } }>(page, 'POST', '/api/assets', {
        category: `테스트자산_${Date.now()}`, // 중복 방지를 위해 timestamp 붙임
        owner: '유호빈',
        amount: 1000000,
        type: 'SAVINGS',
        linkedToInvestment: false,
        ...overrides, // 필요한 필드만 덮어쓰기 가능
      })
      return result?.data?.id ?? 0 // 생성된 자산 id 반환
    })
  },

  // 테스트 후 자산 삭제 (테스트 데이터 정리)
  cleanAsset: async ({ page }, use) => {
    await use((id) => apiCall(page, 'DELETE', `/api/assets/${id}`).then(() => undefined))
  },

  // 테스트 후 부채 삭제
  cleanDebt: async ({ page }, use) => {
    await use((id) => apiCall(page, 'DELETE', `/api/debts/${id}`).then(() => undefined))
  },

  // 테스트 후 투자 삭제
  cleanInvestment: async ({ page }, use) => {
    await use((id) => apiCall(page, 'DELETE', `/api/investments/${id}`).then(() => undefined))
  },
})

export { expect } from '@playwright/test'
