import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteDebt, getDebt, getDebts, getDebtsSummary, postDebt, putDebt } from '@/api/debt'
import type { DebtCreateRequest, DebtUpdateRequest } from '@/types/debt'
import { getAssetSummary } from '@/api/asset'
import { ASSET_KEYS } from '@/queries/asset'

export const DEBT_KEYS = {
  all: ['debts'] as const,
  list: (page: number) => [...DEBT_KEYS.all, 'list', page] as const,
  detail: (id: number) => [...DEBT_KEYS.all, 'detail', id] as const,
  summary: () => [...DEBT_KEYS.all, 'summary'] as const,
}

export const useGetDebts = (page = 0, size = 10) =>
  useQuery({
    queryKey: DEBT_KEYS.list(page),
    queryFn: () => getDebts(page, size),
  })
export const useGetDebt = (id: number) =>
  useQuery({
    queryKey: DEBT_KEYS.detail(id),
    queryFn: () => getDebt(id),
  })

export const usePostDebt = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: DebtCreateRequest) => postDebt(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all })
    },
  })
}

export const usePutDebt = (id: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: DebtUpdateRequest) => putDebt(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all })
    },
  })
}

export const useDeleteDebt = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteDebt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all })
    },
  })
}

export const useGetDebtsSummary = () =>
  useQuery({
    queryKey: DEBT_KEYS.summary(),
    queryFn: getDebtsSummary,
  })
