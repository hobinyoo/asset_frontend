import type { AssetType } from '@/types/asset'

export const formatAmount = (amount: number): string =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)

export const formatDate = (dateStr: string): string => new Date(dateStr).toLocaleDateString('ko-KR')

export const formatAssetType = (type: AssetType): string => {
  const map: Record<AssetType, string> = {
    FIXED: '거치',
    REGULAR: '정기',
    VARIABLE: '변동',
  }
  return map[type]
}

export const ASSET_TYPE_OPTIONS: { label: string; value: AssetType }[] = [
  { label: '거치', value: 'FIXED' },
  { label: '정기', value: 'REGULAR' },
  { label: '변동', value: 'VARIABLE' },
]
