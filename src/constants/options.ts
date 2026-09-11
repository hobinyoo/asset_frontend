import type { ChartPeriod } from '@/types/period'

export const OWNER_OPTIONS = ['유호빈', '허선주', '공통'] as const

/** 차트 기간 필터 버튼 — 스냅샷·투자 대시보드 공용 */
export const PERIOD_OPTIONS: { label: string; value: ChartPeriod }[] = [
  { label: '7일', value: '7d' },
  { label: '30일', value: '30d' },
  { label: '90일', value: '90d' },
  { label: '1년', value: '1y' },
]

export const CATEGORY_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f97316',
  '#a855f7',
  '#ef4444',
  '#06b6d4',
  '#eab308',
  '#ec4899',
  '#14b8a6',
  '#f43f5e',
] as const
