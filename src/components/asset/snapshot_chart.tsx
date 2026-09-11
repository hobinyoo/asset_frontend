'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useSnapshots } from '@/queries/snapshot'
import type { SnapshotPeriod } from '@/types/snapshot'
import { formatChartDate, formatMan } from '@/utils/format'
import { PERIOD_OPTIONS } from '@/constants/options'
import LineChartTooltip from '@/components/common/line_chart_tooltip'

export default function SnapshotChart() {
  const [period, setPeriod] = useState<SnapshotPeriod>('30d')
  const { data = [] } = useSnapshots(period)

  const chartData = data.map((s) => ({
    date: formatChartDate(s.snapshotDate),
    총자산: s.totalAssetAmount,
    총부채: s.totalDebtAmount,
    순자산: s.netWorthAmount,
  }))

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">자산·부채·순자산 추이</p>
        <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                period === p.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-gray-400">
          데이터가 없습니다
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis
              tickFormatter={formatMan}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={64}
            />
            <Tooltip content={<LineChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="총자산" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="총부채" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="순자산" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
