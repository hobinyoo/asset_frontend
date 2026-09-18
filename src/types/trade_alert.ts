/** 실시간 현황 — 단기(사다리 매매) 국내종목 한 건 */
export interface TradeAlertStatus {
  investmentId: number
  stockName: string
  ticker: string | null
  owner: string
  currentPrice: number | null
  changeRate: number | null
  profitRate: number | null
  buyMoreCount: number
  suggestion: string | null
}

/** 알림/사다리 임계값 — 전체 공통 1세트 */
export interface TradeAlertRule {
  dailyDropThreshold: number
  profitThreshold: number
  surgeThreshold: number
  ladder1Threshold: number
  ladder2Threshold: number
  ladder3Threshold: number
  ladder1Amount: number
  ladder2Amount: number
  ladder3Amount: number
}

export type TradeAlertRuleUpdateRequest = Partial<TradeAlertRule>
