import { CATEGORY_COLORS } from '@/constants/options'

export const CASH_CATEGORY = '예수금'
const CASH_COLOR = '#94a3b8' // slate-400 — 예수금은 고정 중립색

/** 카테고리 색상 — 예수금은 고정 중립색, 나머지는 순환 팔레트 */
export const catColor = (category: string, idx: number) =>
  category === CASH_CATEGORY ? CASH_COLOR : CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
