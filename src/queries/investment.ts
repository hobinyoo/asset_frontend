import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteInvestment, getInvestments, postInvestment, putInvestment } from '@/api/investment'
import type { InvestmentCreateRequest, InvestmentUpdateRequest } from '@/types/investment'

export const INVESTMENT_KEYS = {
  all: ['investments'] as const,
  list: () => [...INVESTMENT_KEYS.all, 'list'] as const,
}

export const useGetInvestments = () =>
  useQuery({
    queryKey: INVESTMENT_KEYS.list(),
    queryFn: () => getInvestments(),
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
