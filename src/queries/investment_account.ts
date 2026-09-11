import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { depositCash, getInvestmentAccount, withdrawCash } from '@/api/investment_account'
import {
  INVESTMENT_ACCOUNT_KEYS,
  invalidateInvestmentAndAccount,
} from '@/queries/investment'

export const useInvestmentAccount = (assetId: number | undefined) =>
  useQuery({
    queryKey: INVESTMENT_ACCOUNT_KEYS.detail(assetId ?? 0),
    queryFn: () => getInvestmentAccount(assetId as number),
    enabled: !!assetId,
  })

export const useDepositCash = (assetId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (amount: number) => depositCash(assetId, amount),
    onSuccess: () => invalidateInvestmentAndAccount(queryClient, assetId),
  })
}

export const useWithdrawCash = (assetId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (amount: number) => withdrawCash(assetId, amount),
    onSuccess: () => invalidateInvestmentAndAccount(queryClient, assetId),
  })
}
