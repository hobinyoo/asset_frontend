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

export type InvestmentDashboardPeriod = '7d' | '30d' | '90d' | '1y'
