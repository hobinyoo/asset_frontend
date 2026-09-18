import api from './axios'
import type { TradeAlertStatus, TradeAlertRule, TradeAlertRuleUpdateRequest } from '@/types/trade_alert'

export const getTradeAlertStatus = async (): Promise<TradeAlertStatus[]> => {
  const { data } = await api.get('/api/trade-alert/status')
  return data.data
}

export const getTradeAlertRules = async (): Promise<TradeAlertRule> => {
  const { data } = await api.get('/api/trade-alert/rules')
  return data.data
}

export const updateTradeAlertRules = async (body: TradeAlertRuleUpdateRequest): Promise<TradeAlertRule> => {
  const { data } = await api.put('/api/trade-alert/rules', body)
  return data.data
}
