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

/**
 * 자산 변경(등록/수정/삭제)이 투자 계좌에 영향을 줄 수 있을 때 함께 무효화한다.
 * (investment 쪽 invalidateInvestmentAndAccount 의 반대 방향 — 순환 import 피하려고
 * 쿼리키 리터럴을 그대로 씀. queries/investment.ts 의 INVESTMENT_KEYS.all /
 * INVESTMENT_ACCOUNT_KEYS.all / dashboardSummary·Chart 의 루트 키와 동일해야 함)
 */
const invalidateInvestmentQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['investments'] })
  queryClient.invalidateQueries({ queryKey: ['investment-account'] })
  queryClient.invalidateQueries({ queryKey: ['investment-dashboard'] })
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
      // 투자연동으로 등록하면 서버에서 InvestmentAccount 가 같이 생성됨
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
      invalidateInvestmentQueries(queryClient)
    },
  })
}

export const usePutAsset = (id: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AssetUpdateRequest) => putAsset(id, body),
    onSuccess: () => {
      // 투자연동 자산의 카테고리(계좌명) 변경이 투자 카드에도 표시되므로 같이 무효화
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
      invalidateInvestmentQueries(queryClient)
    },
  })
}

export const useDeleteAsset = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAsset(id),
    onSuccess: () => {
      // 투자연동 자산 삭제 시 서버에서 InvestmentAccount·종목도 같이 삭제됨
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
      invalidateInvestmentQueries(queryClient)
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
