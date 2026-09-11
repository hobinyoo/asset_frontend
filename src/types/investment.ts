import type { ChartPeriod } from '@/types/period'

export type MarketType = 'DOMESTIC' | 'OVERSEAS'

export interface Investment {
  id: number
  assetId: number | null
  account: string | null
  category: string
  stockName: string
  ticker: string | null
  owner: string
  purchasePrice: number | null
  quantity: number | null
  purchaseAmount: number | null
  currentPrice: number | null
  evaluationAmount: number | null
  profitRate: number | null
  createdAt: string
  updatedAt: string
  marketType: MarketType
}

export interface InvestmentCreateRequest {
  assetId?: number
  category: string
  stockName: string
  ticker?: string
  owner: string
  purchasePrice?: number
  quantity?: number
  purchaseAmount?: number
  marketType: MarketType
}

export type InvestmentUpdateRequest = InvestmentCreateRequest

/** 투자 계좌(예수금) 정보 — 경로 파라미터는 연동 Asset 의 id */
export interface InvestmentAccount {
  assetId: number
  assetCategory: string
  cashBalance: number
  totalAmount: number
  holdingsAmount: number
}

/** 예수금 입금 / 출금 요청 */
export interface CashTransactionRequest {
  amount: number
}

/** 추가 매수 / 매도 요청 */
export interface InvestmentTradeRequest {
  quantity: number
  price: number
}

/** 종목 검색 결과 1건 */
export interface StockSearchItem {
  symbol: string
  name: string
  exchange: string
  marketType: MarketType
}

/** 종목 현재가 조회 결과 — currentPrice 는 항상 KRW (조회 실패 시 null) */
export interface StockQuote {
  ticker: string
  marketType: MarketType
  rawPrice: number | null
  exchangeRate: number | null
  currentPrice: number | null
}

/** 매수 / 매도 체결 결과 */
export interface InvestmentTradeResponse {
  investmentId: number
  quantity: number
  purchasePrice: number | null
  purchaseAmount: number | null
  tradeAmount: number
  realizedProfit: number | null
  cashBalance: number
  removed: boolean
}

export interface CategoryAmount {
  category: string
  amount: number
  percentage: number
}

export interface InvestmentDashboardSummaryResponse {
  totalAmount: number
  categories: CategoryAmount[]
}

export interface CategorySnapshot {
  category: string
  amount: number
}

export interface DailySnapshot {
  snapshotDate: string
  categories: CategorySnapshot[]
}

export interface InvestmentDashboardChartResponse {
  period: string
  data: DailySnapshot[]
}

export type InvestmentDashboardPeriod = ChartPeriod
