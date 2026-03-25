import api from '@/api/axios'
import type { DataResponse } from '@/types/response'
import type { ConfigItem } from '@/types/config'

export const getAssetCategories = async () => {
  const { data } = await api.get<DataResponse<ConfigItem[]>>('/api/config/asset-categories')
  return data.data
}

export const addAssetCategory = async (value: string) => {
  const { data } = await api.post<DataResponse<ConfigItem>>('/api/config/asset-categories', {
    value,
  })
  return data.data
}

export const deleteAssetCategory = async (id: number | null) => {
  await api.delete(`/api/config/asset-categories/${id}`)
}

export const getAssetOwners = async () => {
  const { data } = await api.get<DataResponse<ConfigItem[]>>('/api/config/asset-owners')
  return data.data
}

export const addAssetOwner = async (value: string) => {
  const { data } = await api.post<DataResponse<ConfigItem>>('/api/config/asset-owners', { value })
  return data.data
}

export const deleteAssetOwner = async (id: number | null) => {
  await api.delete(`/api/config/asset-owners/${id}`)
}

export const getInvestmentCategories = async () => {
  const { data } = await api.get<DataResponse<ConfigItem[]>>('/api/config/investment-categories')
  return data.data
}

export const addInvestmentCategory = async (value: string) => {
  const { data } = await api.post<DataResponse<ConfigItem>>(
    '/api/config/investment-categories',
    { value },
  )
  return data.data
}

export const deleteInvestmentCategory = async (id: number | null) => {
  await api.delete(`/api/config/investment-categories/${id}`)
}
