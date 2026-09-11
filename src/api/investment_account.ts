import api from './axios'
import type { InvestmentAccount } from '@/types/investment'

/** 경로 파라미터 assetId 는 증권계좌 역할을 하는 Asset 의 id (linkedToInvestment=true) */
export const getInvestmentAccount = async (assetId: number): Promise<InvestmentAccount> => {
  const { data } = await api.get(`/api/investment-accounts/${assetId}`)
  return data.data
}

export const depositCash = async (
  assetId: number,
  amount: number,
): Promise<InvestmentAccount> => {
  const { data } = await api.post(`/api/investment-accounts/${assetId}/deposit`, { amount })
  return data.data
}

export const withdrawCash = async (
  assetId: number,
  amount: number,
): Promise<InvestmentAccount> => {
  const { data } = await api.post(`/api/investment-accounts/${assetId}/withdraw`, { amount })
  return data.data
}
