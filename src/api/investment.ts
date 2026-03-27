import api from './axios'
import type {
  Investment,
  InvestmentCreateRequest,
  InvestmentUpdateRequest,
} from '@/types/investment'
import type { Paging } from '@/types/response'

export const getInvestments = async (params?: {
  owner?: string
  assetId?: number
  category?: string
  page?: number
  size?: number
}): Promise<Paging<Investment[]>> => {
  const { data } = await api.get('/api/investments', { params })
  return data.data
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

export const deleteInvestment = async (id: number): Promise<void> => {
  await api.delete(`/api/investments/${id}`)
}

