import api from '@/api/axios'
import { Asset, AssetCreateRequest, AssetUpdateRequest } from '@/types/asset'
import { DataResponse, Paging } from '@/types/response'

export const getAssets = async () => {
  const { data } = await api.get<DataResponse<Paging<Asset[]>>>('/api/assets')
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
