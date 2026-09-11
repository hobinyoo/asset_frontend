import type { AssetType } from '@/types/asset'

export interface AssetTypeMeta {
  /** 짧은 라벨 — 뱃지, 테이블 셀 등 좁은 공간 */
  label: string
  /** 긴 설명 라벨 — 드롭다운, 범례 등 맥락이 필요한 곳 */
  description: string
  /** 차트 fill 색상 (hex) */
  color: string
  /** 뱃지용 Tailwind 클래스 — 디자인 토큰 아님, 데이터 시각화용으로 유지 */
  badgeClass: string
}

export const ASSET_TYPE_META: Record<AssetType, AssetTypeMeta> = {
  HOUSING: {
    label: '주택자금',
    description: '주택자금',
    color: '#3b82f6',
    badgeClass: 'bg-blue-50 text-blue-600',
  },
  SAVINGS: {
    label: '청약·공제',
    description: '청약·공제',
    color: '#f97316',
    badgeClass: 'bg-orange-50 text-orange-600',
  },
  RETIREMENT: {
    label: '노후 자산',
    description: '노후 자산 (IRP·연금·DC)',
    color: '#22c55e',
    badgeClass: 'bg-green-50 text-green-600',
  },
  INVESTMENT: {
    label: '투자',
    description: '투자 (주식·ISA·토스)',
    color: '#06b6d4',
    badgeClass: 'bg-cyan-50 text-cyan-600',
  },
}

export const ASSET_TYPE_OPTIONS: { value: AssetType; label: string }[] = (
  Object.keys(ASSET_TYPE_META) as AssetType[]
).map((type) => ({ value: type, label: ASSET_TYPE_META[type].description }))
