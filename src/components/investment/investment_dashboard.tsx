'use client'

import { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import {
  useInvestmentDashboardSummary,
  useInvestmentDashboardChart,
} from '@/queries/investment'
import type { InvestmentDashboardPeriod, CategoryAmount } from '@/types/investment'
import { CATEGORY_COLORS } from '@/constants/options'

const PERIODS: { label: string; value: InvestmentDashboardPeriod }[] = [
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

const formatAmount = (value: number) => {
  if (value >= 100000000) {
    const uk = Math.floor(value / 100000000)
    const man = Math.floor((value % 100000000) / 10000)
    return man > 0 ? `${uk}억 ${man.toLocaleString()}만` : `${uk}억`
  }
  return `${Math.floor(value / 10000).toLocaleString()}만`
}

interface PieTooltipProps {
  active?: boolean
  payload?: { payload: CategoryAmount }[]
}

const PieTooltip = ({ active, payload }: PieTooltipProps) => {
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

interface LineTooltipEntry {
  dataKey: string
  name: string
  value: number
  color: string
}

const LineTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: LineTooltipEntry[]
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

export default function InvestmentDashboard() {
  const [period, setPeriod] = useState<InvestmentDashboardPeriod>('30d')

  const { data: summary, isPending } = useInvestmentDashboardSummary()
  const { data: chart } = useInvestmentDashboardChart(period)

  const categories = summary?.categories ?? []

  const allCategoryNames = [
    ...new Set(chart?.data.flatMap((d) => d.categories.map((c) => c.category)) ?? []),
  ]

  const lineChartData =
    chart?.data.map((snapshot) => {
      const entry: Record<string, string | number> = {
        date: formatDate(snapshot.snapshotDate),
      }
      for (const cat of snapshot.categories) {
        entry[cat.category] = cat.amount
      }
      return entry
    }) ?? []

  if (isPending) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-400">로딩 중...</div>
    )
  }

  return (
    <div className="space-y-4 bg-gray-50 p-6">
      {/* 총 투자금액 */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium text-gray-500">총 투자금액</p>
        <p className="mt-2 text-2xl font-bold text-gray-900">
          {formatAmount(summary?.totalAmount ?? 0)}
          <span className="text-sm font-normal text-gray-500">원</span>
        </p>
      </div>

      {/* 파이 차트 */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="mb-4 text-sm font-medium text-gray-700">카테고리별 비중</p>
        {categories.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-gray-400">
            데이터가 없습니다
          </div>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              {categories.map((item, idx) => (
                <div key={item.category} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-xs text-gray-600">
                    {item.category} {item.percentage}%
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {categories.map((item, idx) => (
                      <Cell
                        key={item.category}
                        fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-col justify-center space-y-2">
                {categories.map((item, idx) => (
                  <div key={item.category}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                        />
                        <span className="text-gray-600">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">
                          {item.amount.toLocaleString()}원
                        </span>
                        <span className="w-10 text-right text-gray-400">{item.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 라인 차트 */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">카테고리별 추이</p>
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

        {lineChartData.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-gray-400">
            데이터가 없습니다
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis
                tickFormatter={formatMan}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={64}
              />
              <Tooltip content={<LineTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {allCategoryNames.map((cat, idx) => (
                <Line
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  stroke={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
