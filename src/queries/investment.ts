import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteInvestment,
  getInvestments,
  postInvestment,
  putInvestment,
  syncAssetAmount,
} from '@/api/investment'
import type { InvestmentCreateRequest, InvestmentUpdateRequest } from '@/types/investment'

export const INVESTMENT_KEYS = {
  all: ['investments'] as const,
  list: (params?: {
    owner?: string
    category?: string
    assetId?: number
    page?: number
    size?: number
  }) => [...INVESTMENT_KEYS.all, 'list', params] as const,
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
export const useSyncAssetAmount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (assetId: number) => syncAssetAmount(assetId),
    onSuccess: () => {
      // asset 목록도 갱신해야 금액이 업데이트된 게 반영됨
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}
