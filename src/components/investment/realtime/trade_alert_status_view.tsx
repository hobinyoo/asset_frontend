'use client'

import { useState } from 'react'
import { useTradeAlertStatus } from '@/queries/trade_alert'
import { formatAmount } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import TradeAlertRuleModal from '@/components/investment/realtime/trade_alert_rule_modal'

// 한국 주식시장 관례: 상승=빨강, 하락=파랑
const plClass = (n: number) => (n >= 0 ? 'text-red-500' : 'text-blue-500')
const withPercentSign = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`

export default function TradeAlertStatusView() {
  const { data: statuses = [], isPending, isError } = useTradeAlertStatus()
  const [ruleModalOpen, setRuleModalOpen] = useState(false)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">실시간 현황</h1>
          <p className="text-sm text-muted-foreground">
            단기(사다리 매매) 국내종목만 표시돼요. 20초마다 자동 갱신.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setRuleModalOpen(true)}>
          <Settings size={14} />
          규칙 수정
        </Button>
      </div>

      {isPending ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          로딩 중...
        </div>
      ) : isError ? (
        <div className="flex h-40 items-center justify-center text-sm text-destructive">
          에러가 발생했습니다.
        </div>
      ) : statuses.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
          단기로 등록된 국내종목이 없습니다
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">종목명</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">소유주</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">현재가</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">등락률</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">수익률</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">추매횟수</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">제안</th>
              </tr>
            </thead>
            <tbody>
              {statuses.map((s) => (
                <tr key={s.investmentId} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium text-foreground">{s.stockName}</td>
                  <td className="px-3 py-2 text-muted-foreground">{s.owner}</td>
                  <td className="px-3 py-2 text-right text-foreground">
                    {s.currentPrice != null ? formatAmount(s.currentPrice) : '조회 중...'}
                  </td>
                  <td className={`px-3 py-2 text-right ${s.changeRate != null ? plClass(s.changeRate) : 'text-muted-foreground'}`}>
                    {s.changeRate != null ? withPercentSign(s.changeRate) : '-'}
                  </td>
                  <td className={`px-3 py-2 text-right font-medium ${s.profitRate != null ? plClass(s.profitRate) : 'text-muted-foreground'}`}>
                    {s.profitRate != null ? withPercentSign(s.profitRate) : '-'}
                  </td>
                  <td className="px-3 py-2 text-center text-muted-foreground">{s.buyMoreCount}</td>
                  <td className="px-3 py-2">
                    {s.suggestion ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        🪜 {s.suggestion}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ruleModalOpen && <TradeAlertRuleModal onClose={() => setRuleModalOpen(false)} />}
    </div>
  )
}
