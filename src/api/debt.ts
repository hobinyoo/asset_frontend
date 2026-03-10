import api from '@/api/axios'
import type { Debt, DebtCreateRequest, DebtUpdateRequest } from '@/types/debt'
import type { DataResponse, Paging } from '@/types/response'

export const getDebts = async (page = 0, size = 10) => {
  const { data } = await api.get<DataResponse<Paging<Debt[]>>>(
    `/api/debts?page=${page}&size=${size}`,
  )
  return data.data
}

export const getDebt = async (id: number) => {
  const { data } = await api.get<DataResponse<Debt>>(`/api/debts/${id}`)
  return data.data
}

export const postDebt = async (body: DebtCreateRequest) => {
  const { data } = await api.post<DataResponse<Debt>>('/api/debts', body)
  return data.data
}

export const putDebt = async (id: number, body: DebtUpdateRequest) => {
  const { data } = await api.put<DataResponse<Debt>>(`/api/debts/${id}`, body)
  return data.data
}

export const deleteDebt = async (id: number) => {
  await api.delete(`/api/debts/${id}`)
}
