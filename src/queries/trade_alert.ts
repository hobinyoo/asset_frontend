import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getTradeAlertStatus, getTradeAlertRules, updateTradeAlertRules } from '@/api/trade_alert'
import type { TradeAlertRuleUpdateRequest } from '@/types/trade_alert'

export const TRADE_ALERT_KEYS = {
  status: () => ['trade-alert', 'status'] as const,
  rules: () => ['trade-alert', 'rules'] as const,
}

/**
 * 백엔드 스케줄러가 미리 채워둔 스냅샷을 읽어오는 것뿐이라 새 KIS 호출은 안 나감.
 * 스케줄러 한 바퀴가 종목 수만큼 초 단위로 걸려서, 20~30초 폴링이면 충분 (그 이상 자주 조회해도 데이터가 그만큼 안 바뀜).
 */
export const useTradeAlertStatus = () =>
  useQuery({
    queryKey: TRADE_ALERT_KEYS.status(),
    queryFn: getTradeAlertStatus,
    refetchInterval: 20_000,
  })

export const useTradeAlertRules = () =>
  useQuery({
    queryKey: TRADE_ALERT_KEYS.rules(),
    queryFn: getTradeAlertRules,
  })

export const useUpdateTradeAlertRules = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: TradeAlertRuleUpdateRequest) => updateTradeAlertRules(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRADE_ALERT_KEYS.rules() })
      queryClient.invalidateQueries({ queryKey: TRADE_ALERT_KEYS.status() })
    },
  })
}
