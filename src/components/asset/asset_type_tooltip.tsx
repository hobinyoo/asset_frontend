import type { DashboardChartItem } from '@/types/asset'
import { ASSET_TYPE_META } from '@/constants/asset_type'
import { formatCompactAmount } from '@/utils/format'

interface AssetTypeTooltipProps {
  active?: boolean
  payload?: { payload: DashboardChartItem }[]
}

export default function AssetTypeTooltip({ active, payload }: AssetTypeTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-medium text-gray-500">{ASSET_TYPE_META[item.type].description}</p>
      <p className="mt-0.5 text-sm font-bold text-gray-900">{item.percentage}%</p>
      <p className="text-xs text-gray-500">{formatCompactAmount(item.amount)}원</p>
    </div>
  )
}
