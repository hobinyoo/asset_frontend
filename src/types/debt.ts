export type DebtType = 'FIXED' | 'REGULAR' | 'VARIABLE'

export interface Debt {
  id: number
  category: string
  owner: string
  amount: number
  type: DebtType
  monthlyPayment: number | null
  paymentDay: number | null
  purpose: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface DebtCreateRequest {
  category: string
  owner: string
  amount: number
  type: DebtType
  monthlyPayment?: number
  paymentDay?: number
  purpose?: string
  note?: string
}

export type DebtUpdateRequest = DebtCreateRequest
