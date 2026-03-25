import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addAssetCategory,
  deleteAssetCategory,
  getAssetCategories,
  addAssetOwner,
  deleteAssetOwner,
  getAssetOwners,
  addInvestmentCategory,
  deleteInvestmentCategory,
  getInvestmentCategories,
} from '@/api/config'

export const CONFIG_KEYS = {
  all: ['config'] as const,
  assetCategories: () => [...CONFIG_KEYS.all, 'assetCategories'] as const,
  assetOwners: () => [...CONFIG_KEYS.all, 'assetOwners'] as const,
  investmentCategories: () => [...CONFIG_KEYS.all, 'investmentCategories'] as const,
}

// ─── Asset Categories ───────────────────────────────────────────────────────

export const useAssetCategories = () =>
  useQuery({
    queryKey: CONFIG_KEYS.assetCategories(),
    queryFn: getAssetCategories,
  })

export const useAddAssetCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (value: string) => addAssetCategory(value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFIG_KEYS.assetCategories() })
    },
  })
}

export const useDeleteAssetCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | null) => deleteAssetCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFIG_KEYS.assetCategories() })
    },
  })
}

// ─── Asset Owners ────────────────────────────────────────────────────────────

export const useAssetOwners = () =>
  useQuery({
    queryKey: CONFIG_KEYS.assetOwners(),
    queryFn: getAssetOwners,
  })

export const useAddAssetOwner = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (value: string) => addAssetOwner(value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFIG_KEYS.assetOwners() })
    },
  })
}

export const useDeleteAssetOwner = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | null) => deleteAssetOwner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFIG_KEYS.assetOwners() })
    },
  })
}

// ─── Investment Categories ───────────────────────────────────────────────────

export const useInvestmentCategories = () =>
  useQuery({
    queryKey: CONFIG_KEYS.investmentCategories(),
    queryFn: getInvestmentCategories,
  })

export const useAddInvestmentCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (value: string) => addInvestmentCategory(value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFIG_KEYS.investmentCategories() })
    },
  })
}

export const useDeleteInvestmentCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | null) => deleteInvestmentCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFIG_KEYS.investmentCategories() })
    },
  })
}
