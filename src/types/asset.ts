export type AssetType = 'FIXED' | 'REGULAR' | 'VARIABLE'

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

export interface AssetSummary {
  totalAmount: number
  totalMonthlyPayment: number
}
