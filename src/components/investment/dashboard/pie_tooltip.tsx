import type { CategoryAmount } from '@/types/investment'

interface PieTooltipProps {
  active?: boolean
  payload?: { payload: CategoryAmount }[]
}

export default function PieTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-medium text-gray-500">{item.category}</p>
      <p className="mt-0.5 text-sm font-bold text-gray-900">{item.percentage}%</p>
      <p className="text-xs text-gray-500">{item.amount.toLocaleString()}원</p>
    </div>
  )
}
