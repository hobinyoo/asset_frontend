import type { AssetType } from '@/types/asset'
import type { DebtType } from '@/types/debt'
import { ASSET_TYPE_META } from '@/constants/asset_type'
import { DEBT_TYPE_META } from '@/constants/debt_type'

export const formatAmount = (amount: number): string =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)

export const formatDate = (dateStr: string): string => new Date(dateStr).toLocaleDateString('ko-KR')

export const formatAssetType = (type: AssetType): string => ASSET_TYPE_META[type].label

export const formatDebtType = (type: DebtType): string => DEBT_TYPE_META[type].label

/** 차트 X축용 짧은 날짜 (YYYY-MM-DD → M/D) */
export const formatChartDate = (dateStr: string): string => {
  const [, month, day] = dateStr.split('-')
  return `${Number(month)}/${Number(day)}`
}

/** 만원 단위 축약 (차트 Y축 등) */
export const formatMan = (value: number): string =>
  `${Math.floor(value / 10000).toLocaleString()}만`

/** 억/만 단위 축약 표시 (예: "1억 2,000만", "500만") — formatMan과 달리 1억 이상은 억 단위 포함 */
export const formatCompactAmount = (value: number): string => {
  if (value >= 100000000) {
    const uk = Math.floor(value / 100000000)
    const man = Math.floor((value % 100000000) / 10000)
    return man > 0 ? `${uk}억 ${man.toLocaleString()}만` : `${uk}억`
  }
  return formatMan(value)
}
