import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  buyMoreInvestment,
  getInvestmentsByAsset,
  getInvestmentDashboardSummary,
  getInvestmentDashboardChart,
  getStockQuote,
  postInvestment,
  putInvestment,
  searchStocks,
  sellInvestment,
} from '@/api/investment'
import { ASSET_KEYS } from '@/queries/asset'
import type {
  InvestmentCreateRequest,
  InvestmentUpdateRequest,
  InvestmentDashboardPeriod,
  InvestmentTradeRequest,
  MarketType,
} from '@/types/investment'

export const INVESTMENT_KEYS = {
  all: ['investments'] as const,
  byAsset: (assetId: number) => [...INVESTMENT_KEYS.all, 'by-asset', assetId] as const,
  dashboardSummary: () => ['investment-dashboard', 'summary'] as const,
  dashboardChart: (period: InvestmentDashboardPeriod) =>
    ['investment-dashboard', 'chart', period] as const,
  quote: (ticker: string, marketType: MarketType) =>
    ['investment', 'quote', ticker, marketType] as const,
  search: (q: string) => ['investment', 'search', q] as const,
}

export const INVESTMENT_ACCOUNT_KEYS = {
  all: ['investment-account'] as const,
  detail: (assetId: number) => [...INVESTMENT_ACCOUNT_KEYS.all, assetId] as const,
}

/**
 * 매수/매도/입출금 등 예수금·평가액에 영향을 주는 변경 후 무효화 대상.
 * Asset.amount 는 (예수금 + 주식 평가액) 파생값이라 자산 쿼리도 함께 갱신한다.
 *
 * assetId 를 알면 그 계좌만 정확히 무효화한다 — 카드 그리드에서 계좌가 N개 떠 있을 때
 * `.all`(prefix)로 무효화하면 관련 없는 나머지 N-1개 카드까지 전부 리페치되어
 * 화면 전체가 깜빡이는 원인이 된다. assetId 를 모를 때만 전체 무효화로 폴백한다.
 */
export const invalidateInvestmentAndAccount = (
  queryClient: ReturnType<typeof useQueryClient>,
  assetId?: number,
) => {
  if (assetId != null) {
    queryClient.invalidateQueries({ queryKey: INVESTMENT_KEYS.byAsset(assetId) })
    queryClient.invalidateQueries({ queryKey: INVESTMENT_ACCOUNT_KEYS.detail(assetId) })
  } else {
    queryClient.invalidateQueries({ queryKey: INVESTMENT_KEYS.all })
    queryClient.invalidateQueries({ queryKey: INVESTMENT_ACCOUNT_KEYS.all })
  }
  queryClient.invalidateQueries({ queryKey: ['investment-dashboard'] })
  queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
}

/**
 * 계좌(자산)별 종목 전체 — 카드 손익 집계 + 계좌 종목 모달.
 * 평가액이 시세에 따라 매번 새로 계산되므로 30초 폴링 (탭이 백그라운드면 자동으로 멈춤).
 */
export const useInvestmentsByAsset = (assetId: number | undefined) =>
  useQuery({
    queryKey: INVESTMENT_KEYS.byAsset(assetId ?? 0),
    queryFn: () => getInvestmentsByAsset(assetId as number),
    enabled: !!assetId,
    refetchInterval: 30_000,
  })

export const usePostInvestment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: InvestmentCreateRequest) => postInvestment(body),
    onSuccess: (data) => invalidateInvestmentAndAccount(queryClient, data.assetId ?? undefined),
  })
}

export const usePutInvestment = (id: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: InvestmentUpdateRequest) => putInvestment(id, body),
    onSuccess: (data) => invalidateInvestmentAndAccount(queryClient, data.assetId ?? undefined),
  })
}

export const useBuyMoreInvestment = (id: number, assetId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: InvestmentTradeRequest) => buyMoreInvestment(id, body),
    onSuccess: () => invalidateInvestmentAndAccount(queryClient, assetId),
  })
}

export const useSellInvestment = (id: number, assetId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: InvestmentTradeRequest) => sellInvestment(id, body),
    onSuccess: () => invalidateInvestmentAndAccount(queryClient, assetId),
  })
}

/** 백엔드가 매 호출마다 실시간 시세로 재계산 → 30초 폴링으로 화면도 같이 움직이게 */
export const useInvestmentDashboardSummary = () =>
  useQuery({
    queryKey: INVESTMENT_KEYS.dashboardSummary(),
    queryFn: getInvestmentDashboardSummary,
    refetchInterval: 30_000,
  })

export const useInvestmentDashboardChart = (period: InvestmentDashboardPeriod) =>
  useQuery({
    queryKey: INVESTMENT_KEYS.dashboardChart(period),
    queryFn: () => getInvestmentDashboardChart(period),
  })

/** 종목 현재가 조회. ticker 가 있을 때만 실행, 30초 캐시. */
export const useStockQuote = (ticker: string, marketType: MarketType) =>
  useQuery({
    queryKey: INVESTMENT_KEYS.quote(ticker, marketType),
    queryFn: () => getStockQuote(ticker, marketType),
    enabled: !!ticker,
    staleTime: 30_000,
    retry: false,
  })

/** 종목명/티커 검색. 2자 이상일 때만 실행, 60초 캐시. */
export const useStockSearch = (q: string) =>
  useQuery({
    queryKey: INVESTMENT_KEYS.search(q),
    queryFn: () => searchStocks(q),
    enabled: q.trim().length >= 2,
    staleTime: 60_000,
    retry: false,
  })
