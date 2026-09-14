import api from './axios'
import type {
  Investment,
  InvestmentCreateRequest,
  InvestmentUpdateRequest,
  InvestmentDashboardSummaryResponse,
  InvestmentDashboardChartResponse,
  InvestmentDashboardPeriod,
  InvestmentTradeRequest,
  InvestmentTradeResponse,
  StockQuote,
  StockSearchItem,
  MarketType,
} from '@/types/investment'
/** 특정 계좌(자산)의 종목 전체 — 페이징 없음 */
export const getInvestmentsByAsset = async (assetId: number): Promise<Investment[]> => {
  const { data } = await api.get(`/api/investments/asset/${assetId}`)
  return data.data
}

/** 전체 계좌 통틀어 보유 종목 전체 — 투자상세 테이블용, 페이징 없이 한 번에 */
export const getAllInvestments = async (): Promise<Investment[]> => {
  const { data } = await api.get('/api/investments', { params: { size: 1000 } })
  return data.data.content
}

export const postInvestment = async (body: InvestmentCreateRequest): Promise<Investment> => {
  const { data } = await api.post('/api/investments', body)
  return data.data
}

export const putInvestment = async (
  id: number,
  body: InvestmentUpdateRequest,
): Promise<Investment> => {
  const { data } = await api.put(`/api/investments/${id}`, body)
  return data.data
}

export const buyMoreInvestment = async (
  id: number,
  body: InvestmentTradeRequest,
): Promise<InvestmentTradeResponse> => {
  const { data } = await api.post(`/api/investments/${id}/buy`, body)
  return data.data
}

export const sellInvestment = async (
  id: number,
  body: InvestmentTradeRequest,
): Promise<InvestmentTradeResponse> => {
  const { data } = await api.post(`/api/investments/${id}/sell`, body)
  return data.data
}

export const getStockQuote = async (
  ticker: string,
  marketType: MarketType,
): Promise<StockQuote> => {
  const { data } = await api.get('/api/investments/quote', { params: { ticker, marketType } })
  return data.data
}

export const searchStocks = async (q: string): Promise<StockSearchItem[]> => {
  const { data } = await api.get('/api/investments/search', { params: { q } })
  return data.data
}

export const getInvestmentDashboardSummary =
  async (): Promise<InvestmentDashboardSummaryResponse> => {
    const { data } = await api.get('/api/investments/dashboard/summary')
    return data.data
  }

export const getInvestmentDashboardChart = async (
  period: InvestmentDashboardPeriod,
): Promise<InvestmentDashboardChartResponse> => {
  const { data } = await api.get(`/api/investments/dashboard/chart?period=${period}`)
  return data.data
}

