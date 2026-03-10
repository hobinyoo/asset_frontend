import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteAsset, getAsset, getAssets, getLinkedAssets, postAsset, putAsset } from '@/api/asset'
import type { AssetCreateRequest, AssetUpdateRequest } from '@/types/asset'

export const ASSET_KEYS = {
  all: ['assets'] as const,
  list: () => [...ASSET_KEYS.all, 'list'] as const,
  linked: () => [...ASSET_KEYS.all, 'linked'] as const,
  detail: (id: number) => [...ASSET_KEYS.all, 'detail', id] as const,
}

export const useGetAssets = () =>
  useQuery({
    queryKey: ASSET_KEYS.list(),
    queryFn: getAssets,
  })

export const useGetAsset = (id: number) =>
  useQuery({
    queryKey: ASSET_KEYS.detail(id),
    queryFn: () => getAsset(id),
  })

export const usePostAsset = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AssetCreateRequest) => postAsset(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
    },
  })
}

export const usePutAsset = (id: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AssetUpdateRequest) => putAsset(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
    },
  })
}

export const useDeleteAsset = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
    },
  })
}
export const useGetLinkedAssets = () =>
  useQuery({
    queryKey: ASSET_KEYS.linked(),
    queryFn: getLinkedAssets,
  })
