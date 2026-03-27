import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteAsset,
  getAsset,
  getAssets,
  getDashboardChart,
  getDashboardSummary,
  getLinkedAssets,
  postAsset,
  putAsset,
  reorderAsset,
  syncAsset,
  syncAllAssets,
} from '@/api/asset'
import type { AssetCreateRequest, AssetUpdateRequest } from '@/types/asset'

export const ASSET_KEYS = {
  all: ['assets'] as const,
  list: (page?: number) => [...ASSET_KEYS.all, 'list', page] as const,
  linked: () => [...ASSET_KEYS.all, 'linked'] as const,
  detail: (id: number) => [...ASSET_KEYS.all, 'detail', id] as const,
  summary: () => [...ASSET_KEYS.all, 'summary'] as const,
  dashboardSummary: () => [...ASSET_KEYS.all, 'dashboardSummary'] as const,
  dashboardChart: () => [...ASSET_KEYS.all, 'dashboardChart'] as const,
}

export const useGetAssets = (page = 0, size = 10) =>
  useQuery({
    queryKey: ASSET_KEYS.list(page),
    queryFn: () => getAssets(page, size),
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

export const useReorderAsset = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, targetPosition }: { id: number; targetPosition: number }) =>
      reorderAsset(id, targetPosition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
    },
  })
}

export const useGetDashboardSummary = () =>
  useQuery({
    queryKey: ASSET_KEYS.dashboardSummary(),
    queryFn: getDashboardSummary,
  })

export const useGetDashboardChart = () =>
  useQuery({
    queryKey: ASSET_KEYS.dashboardChart(),
    queryFn: getDashboardChart,
  })

export const useSyncAsset = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (assetId: number) => syncAsset(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
    },
  })
}

export const useSyncAllAssets = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => syncAllAssets(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
    },
  })
}
