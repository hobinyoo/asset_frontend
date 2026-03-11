import api from '@/api/axios'
import { Asset, AssetCreateRequest, AssetSummary, AssetUpdateRequest } from '@/types/asset'
import { DataResponse, Paging } from '@/types/response'

export const getAssets = async (page = 0, size = 10) => {
  const { data } = await api.get<DataResponse<Paging<Asset[]>>>(
    `/api/assets?page=${page}&size=${size}`,
  )
  return data.data
}

export const getAsset = async (id: number) => {
  const { data } = await api.get<DataResponse<Asset>>(`/api/assets/${id}`)
  return data.data
}

export const postAsset = async (body: AssetCreateRequest) => {
  const { data } = await api.post<DataResponse<Asset>>('/api/assets', body)
  return data.data
}

export const putAsset = async (id: number, body: AssetUpdateRequest) => {
  const { data } = await api.put<DataResponse<Asset>>(`/api/assets/${id}`, body)
  return data.data
}

export const deleteAsset = async (id: number) => {
  await api.delete(`/api/assets/${id}`)
}

export const getLinkedAssets = async () => {
  const { data } = await api.get<DataResponse<Asset[]>>('/api/assets/linked')
  return data.data
}

export const reorderAsset = async (id: number, targetPosition: number) => {
  const { data } = await api.patch<DataResponse<null>>(`/api/assets/${id}/reorder`, {
    targetPosition,
  })
  return data
}

export const getAssetSummary = async () => {
  const { data } = await api.get<DataResponse<AssetSummary>>('/api/assets/summary')
  return data.data
}
