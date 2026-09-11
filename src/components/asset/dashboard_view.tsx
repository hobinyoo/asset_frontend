'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useGetDashboardSummary, useGetDashboardChart } from '@/queries/asset'
import { ASSET_TYPE_META } from '@/constants/asset_type'
import { formatCompactAmount } from '@/utils/format'
import SnapshotChart from '@/components/asset/snapshot_chart'
import AssetTypeTooltip from '@/components/asset/asset_type_tooltip'

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
              {formatCompactAmount(card.value)}
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
                  style={{ backgroundColor: ASSET_TYPE_META[item.type].color }}
                />
                <span className="text-xs text-gray-600">
                  {ASSET_TYPE_META[item.type].description} {item.percentage}%
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
                  <Cell key={item.type} fill={ASSET_TYPE_META[item.type].color} />
                ))}
              </Pie>
              <Tooltip content={<AssetTypeTooltip />} />
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
                      style={{ backgroundColor: ASSET_TYPE_META[item.type].color }}
                    />
                    <span className="text-xs text-gray-600">{ASSET_TYPE_META[item.type].description}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-700">
                      {formatCompactAmount(item.amount)}
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
                      backgroundColor: ASSET_TYPE_META[item.type].color,
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
