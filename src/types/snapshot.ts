export type SnapshotPeriod = '7d' | '30d' | '90d' | '1y'

export interface SnapshotResponse {
  snapshotDate: string
  totalAssetAmount: number
  retirementAmount: number
  investmentAmount: number
  totalDebtAmount: number
  netWorthAmount: number
}
