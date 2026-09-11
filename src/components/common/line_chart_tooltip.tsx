interface LineChartTooltipEntry {
  dataKey: string
  name: string
  value: number
  color: string
}

interface LineChartTooltipProps {
  active?: boolean
  payload?: LineChartTooltipEntry[]
  label?: string
}

/** recharts LineChart 공용 툴팁 — 값을 "만원" 단위로 표시 */
export default function LineChartTooltip({ active, payload, label }: LineChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-lg">
      <p className="mb-2 text-xs font-medium text-gray-500">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}</span>
          <span className="ml-auto pl-4 font-medium text-gray-900">
            {Math.floor(entry.value / 10000).toLocaleString()}만원
          </span>
        </div>
      ))}
    </div>
  )
}
