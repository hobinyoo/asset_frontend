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

const PERIODS: { label: string; value: SnapshotPeriod }[] = [
  { label: '7일', value: '7d' },
  { label: '30일', value: '30d' },
  { label: '90일', value: '90d' },
  { label: '1년', value: '1y' },
]

const formatDate = (dateStr: string) => {
  const [, month, day] = dateStr.split('-')
  return `${Number(month)}/${Number(day)}`
}

const formatMan = (value: number) => `${Math.floor(value / 10000).toLocaleString()}만`

interface TooltipPayloadEntry {
  dataKey: string
  name: string
  value: number
  color: string
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}) => {
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

export default function SnapshotChart() {
  const [period, setPeriod] = useState<SnapshotPeriod>('30d')
  const { data = [] } = useSnapshots(period)

  const chartData = data.map((s) => ({
    date: formatDate(s.snapshotDate),
    총자산: s.totalAssetAmount,
    총부채: s.totalDebtAmount,
    순자산: s.netWorthAmount,
  }))

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">자산·부채·순자산 추이</p>
        <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs">
          {PERIODS.map((p) => (
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
            <Tooltip content={<CustomTooltip />} />
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
