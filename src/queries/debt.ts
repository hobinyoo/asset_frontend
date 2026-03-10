import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteDebt, getDebt, getDebts, postDebt, putDebt } from '@/api/debt'
import type { DebtCreateRequest, DebtUpdateRequest } from '@/types/debt'

export const DEBT_KEYS = {
  all: ['debts'] as const,
  list: () => [...DEBT_KEYS.all, 'list'] as const,
  detail: (id: number) => [...DEBT_KEYS.all, 'detail', id] as const,
}

export const useGetDebts = () =>
  useQuery({
    queryKey: DEBT_KEYS.list(),
    queryFn: getDebts,
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
