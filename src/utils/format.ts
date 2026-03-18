import type { AssetType } from '@/types/asset'

export const formatAmount = (amount: number): string =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)

export const formatDate = (dateStr: string): string => new Date(dateStr).toLocaleDateString('ko-KR')

export const formatAssetType = (type: AssetType): string => {
  const map: Record<AssetType, string> = {
    HOUSING: '주택자금',
    SAVINGS: '청약·공제',
    RETIREMENT: '노후 자산',
    INVESTMENT: '투자',
  }
  return map[type]
}

export const ASSET_TYPE_OPTIONS: { label: string; value: AssetType }[] = [
  { label: '주택자금', value: 'HOUSING' },
  { label: '청약·공제', value: 'SAVINGS' },
  { label: '노후 자산', value: 'RETIREMENT' },
  { label: '투자', value: 'INVESTMENT' },
]
