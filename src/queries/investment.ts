import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteInvestment,
  getInvestments,
  getInvestmentDashboardSummary,
  getInvestmentDashboardChart,
  postInvestment,
  putInvestment,
} from '@/api/investment'
import type {
  InvestmentCreateRequest,
  InvestmentUpdateRequest,
  InvestmentDashboardPeriod,
} from '@/types/investment'

export const INVESTMENT_KEYS = {
  all: ['investments'] as const,
  list: (params?: {
    owner?: string
    category?: string
    assetId?: number
    page?: number
    size?: number
  }) => [...INVESTMENT_KEYS.all, 'list', params] as const,
  dashboardSummary: () => ['investment-dashboard', 'summary'] as const,
  dashboardChart: (period: InvestmentDashboardPeriod) =>
    ['investment-dashboard', 'chart', period] as const,
}

export const useGetInvestments = (params?: {
  owner?: string
  category?: string
  assetId?: number
  page?: number
  size?: number
}) =>
  useQuery({
    queryKey: INVESTMENT_KEYS.list(params),
    queryFn: () => getInvestments(params),
  })

export const usePostInvestment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: InvestmentCreateRequest) => postInvestment(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INVESTMENT_KEYS.all }),
  })
}

export const usePutInvestment = (id: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: InvestmentUpdateRequest) => putInvestment(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INVESTMENT_KEYS.all }),
  })
}

export const useDeleteInvestment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteInvestment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INVESTMENT_KEYS.all }),
  })
}

export const useInvestmentDashboardSummary = () =>
  useQuery({
    queryKey: INVESTMENT_KEYS.dashboardSummary(),
    queryFn: getInvestmentDashboardSummary,
  })

export const useInvestmentDashboardChart = (period: InvestmentDashboardPeriod) =>
  useQuery({
    queryKey: INVESTMENT_KEYS.dashboardChart(period),
    queryFn: () => getInvestmentDashboardChart(period),
  })
