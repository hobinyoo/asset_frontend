export type AssetType = 'HOUSING' | 'SAVINGS' | 'RETIREMENT' | 'INVESTMENT'

export interface Asset {
  id: number
  category: string
  owner: string
  amount: number
  type: AssetType
  monthlyPayment: number | null
  paymentDay: number | null
  note: string | null
  linkedToInvestment: boolean
  createdAt: string
  updatedAt: string
}

export interface AssetCreateRequest {
  category: string
  owner: string
  amount: number
  type: AssetType
  monthlyPayment?: number
  paymentDay?: number
  note?: string
  linkedToInvestment?: boolean
}

export interface AssetUpdateRequest {
  category?: string
  owner?: string
  amount?: number
  type?: AssetType
  monthlyPayment?: number
  paymentDay?: number
  note?: string
  linkedToInvestment?: boolean
}

export interface DashboardSummary {
  totalAmount: number
  totalMonthlyPayment: number
  retirementAmount: number
  investmentAmount: number
}

export interface DashboardChartItem {
  type: AssetType
  label: string
  amount: number
  percentage: number
}

export interface DashboardChart {
  items: DashboardChartItem[]
  totalAmount: number
}
