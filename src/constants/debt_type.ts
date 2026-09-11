import type { DebtType } from '@/types/debt'

export interface DebtTypeMeta {
  label: string
  /** 뱃지용 Tailwind 클래스 — 디자인 토큰 아님, 데이터 시각화용으로 유지 */
  badgeClass: string
}

export const DEBT_TYPE_META: Record<DebtType, DebtTypeMeta> = {
  FIXED: { label: '거치', badgeClass: 'bg-orange-50 text-orange-600' },
  REGULAR: { label: '정기', badgeClass: 'bg-blue-50 text-blue-600' },
  VARIABLE: { label: '변동', badgeClass: 'bg-purple-50 text-purple-600' },
}

export const DEBT_TYPE_OPTIONS: { value: DebtType; label: string }[] = (
  Object.keys(DEBT_TYPE_META) as DebtType[]
).map((type) => ({ value: type, label: DEBT_TYPE_META[type].label }))
