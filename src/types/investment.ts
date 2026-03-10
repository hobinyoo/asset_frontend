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
}

export type InvestmentUpdateRequest = InvestmentCreateRequest
