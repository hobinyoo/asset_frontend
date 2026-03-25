'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts'
import { useGetDashboardSummary, useGetDashboardChart } from '@/queries/asset'
import { DashboardChartItem } from '@/types/asset'
import SnapshotChart from '@/components/asset/snapshot_chart'

const TYPE_COLORS: Record<string, string> = {
  HOUSING: '#3b82f6',
  SAVINGS: '#f97316',
  RETIREMENT: '#22c55e',
  INVESTMENT: '#06b6d4',
}

const TYPE_LABELS: Record<string, string> = {
  HOUSING: '주택자금',
  SAVINGS: '청약·공제',
  RETIREMENT: '노후 자산 (IRP·연금·DC)',
  INVESTMENT: '투자 (주식·ISA·토스)',
}

function formatAmount(value: number) {
  if (value >= 100000000) {
    const uk = Math.floor(value / 100000000)
    const man = Math.floor((value % 100000000) / 10000)
    return man > 0 ? `${uk}억 ${man.toLocaleString()}만` : `${uk}억`
  }
  return `${Math.floor(value / 10000).toLocaleString()}만`
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: DashboardChartItem }[] }) => {
  if (active && payload && payload.length) {
    const item: DashboardChartItem = payload[0].payload
    return (
      <div className="rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-lg">
        <p className="text-xs font-medium text-gray-500">{TYPE_LABELS[item.type]}</p>
        <p className="mt-0.5 text-sm font-bold text-gray-900">{item.percentage}%</p>
        <p className="text-xs text-gray-500">{formatAmount(item.amount)}원</p>
      </div>
    )
  }
  return null
}

export default function DashboardView() {
  const { data: summary } = useGetDashboardSummary()
  const { data: chart } = useGetDashboardChart()

  const summaryCards = [
    {
      label: '총 자산 (부부 합산)',
      value: summary?.totalAmount ?? 0,
      sub: '유동+비유동',
      color: 'text-gray-900',
    },
    {
      label: '월 납입 합계',
      value: summary?.totalMonthlyPayment ?? 0,
      sub: '고정 납입 기준',
      color: 'text-gray-900',
    },
    {
      label: '노후 대비 자산',
      value: summary?.retirementAmount ?? 0,
      sub: 'IRP + 연금 + DC',
      color: 'text-gray-900',
    },
    {
      label: '유동 투자 자산',
      value: summary?.investmentAmount ?? 0,
      sub: '주식 + ISA + 토스',
      color: 'text-gray-900',
    },
  ]

  const chartItems = chart?.items ?? []

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 상단 요약 카드 */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
            <p className="mt-2 text-xl font-bold text-gray-900">
              {formatAmount(card.value)}
              <span className="text-sm font-normal text-gray-500">원</span>
            </p>
            <p className="mt-1 text-xs text-gray-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* 추이 차트 */}
      <div className="mb-4">
        <SnapshotChart />
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 도넛 차트 */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          {/* 범례 */}
          <div className="mb-4 flex flex-wrap gap-3">
            {chartItems.map((item) => (
              <div key={item.type} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ backgroundColor: TYPE_COLORS[item.type] }}
                />
                <span className="text-xs text-gray-600">
                  {TYPE_LABELS[item.type]} {item.percentage}%
                </span>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartItems}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="amount"
              >
                {chartItems.map((item) => (
                  <Cell key={item.type} fill={TYPE_COLORS[item.type]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 바 차트 */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-medium text-gray-700">자산 유형별 바</p>
          <div className="space-y-4">
            {chartItems.map((item) => (
              <div key={item.type}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: TYPE_COLORS[item.type] }}
                    />
                    <span className="text-xs text-gray-600">{TYPE_LABELS[item.type]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-700">
                      {formatAmount(item.amount)}만
                    </span>
                    <span className="w-10 text-right text-xs text-gray-400">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: TYPE_COLORS[item.type],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
