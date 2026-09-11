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
import { useInvestmentDashboardSummary, useInvestmentDashboardChart } from '@/queries/investment'
import type { InvestmentDashboardPeriod } from '@/types/investment'
import { formatChartDate, formatMan, formatCompactAmount } from '@/utils/format'
import { PERIOD_OPTIONS } from '@/constants/options'
import { CASH_CATEGORY, catColor } from '@/components/investment/dashboard/chart_constants'
import PieTooltip from '@/components/investment/dashboard/pie_tooltip'
import LineChartTooltip from '@/components/common/line_chart_tooltip'

export default function InvestmentDashboard() {
  const [period, setPeriod] = useState<InvestmentDashboardPeriod>('30d')

  const { data: summary, isPending } = useInvestmentDashboardSummary()
  const { data: chart } = useInvestmentDashboardChart(period)

  const categories = summary?.categories ?? []
  const cashAmount = categories.find((c) => c.category === CASH_CATEGORY)?.amount ?? 0

  const allCategoryNames = [
    ...new Set(chart?.data.flatMap((d) => d.categories.map((c) => c.category)) ?? []),
  ]

  const lineChartData =
    chart?.data.map((snapshot) => {
      const entry: Record<string, string | number> = {
        date: formatChartDate(snapshot.snapshotDate),
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">총 투자금액 (예수금 포함)</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatCompactAmount(summary?.totalAmount ?? 0)}
            <span className="text-sm font-normal text-gray-500">원</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">예수금 잔액</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatCompactAmount(cashAmount)}
            <span className="text-sm font-normal text-gray-500">원</span>
          </p>
        </div>
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
                    style={{ backgroundColor: catColor(item.category, idx) }}
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
                      <Cell key={item.category} fill={catColor(item.category, idx)} />
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
                          style={{ backgroundColor: catColor(item.category, idx) }}
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
                          backgroundColor: catColor(item.category, idx),
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
              <Tooltip content={<LineChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {allCategoryNames.map((cat, idx) => (
                <Line
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  stroke={catColor(cat, idx)}
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
