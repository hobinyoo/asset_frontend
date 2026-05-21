export interface DailyReport {
  id: number
  reportDate: string
  fullContent: string
  summaryContent: string
  createdAt: string
}

export type CollectResult = {
  ticker: string
  stockName: string
  message: string
}

export type ProgressState = {
  phase: 'idle' | 'collect' | 'embed' | 'report'
  collectResults: CollectResult[]
  embedCount: number
  embedTotal: number
}
