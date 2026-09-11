const OWNER_CARD_COLORS = [
  '#3b82f6',
  '#f97316',
  '#22c55e',
  '#a855f7',
  '#ec4899',
  '#06b6d4',
  '#eab308',
  '#14b8a6',
] as const

/** 소유자 이름 → 고정 색상. 해시 기반이라 다른 소유자 추가/삭제에 영향받지 않고 항상 같은 색을 반환한다. */
export const getOwnerColor = (owner: string): string => {
  let hash = 0
  for (let i = 0; i < owner.length; i++) {
    hash = (hash * 31 + owner.charCodeAt(i)) | 0
  }
  return OWNER_CARD_COLORS[Math.abs(hash) % OWNER_CARD_COLORS.length]
}
