import type { ChartPeriod } from '@/types/period'

export type SnapshotPeriod = ChartPeriod

export interface SnapshotResponse {
  snapshotDate: string
  totalAssetAmount: number
  retirementAmount: number
  investmentAmount: number
  totalDebtAmount: number
  netWorthAmount: number
}
