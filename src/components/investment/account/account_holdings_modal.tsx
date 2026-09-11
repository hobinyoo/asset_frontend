'use client'

import { useState } from 'react'
import type { Investment } from '@/types/investment'
import { useInvestmentsByAsset } from '@/queries/investment'
import { useInvestmentCategories } from '@/queries/config'
import { formatAmount } from '@/utils/format'
import { CATEGORY_COLORS } from '@/constants/options'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Minus, Pencil, Plus } from 'lucide-react'
import InvestmentModal from '@/components/investment/holding/investment_modal'
import TradeModal from '@/components/investment/holding/trade_modal'

const categoryColor = (category: string, items: { value: string }[]) => {
  const idx = items.findIndex((i) => i.value === category)
  return CATEGORY_COLORS[(idx >= 0 ? idx : 0) % CATEGORY_COLORS.length]
}

// 한국 주식시장 관례: 상승=빨강, 하락=파랑
const plClass = (n: number) => (n >= 0 ? 'text-red-500' : 'text-blue-500')
const withSign = (n: number) => `${n >= 0 ? '+' : ''}${formatAmount(n)}`

export default function AccountHoldingsModal({
  assetId,
  accountName,
  onClose,
}: {
  assetId: number
  accountName: string
  onClose: () => void
}) {
  const { data: holdings = [], isPending } = useInvestmentsByAsset(assetId)
  const { data: categoryItems = [] } = useInvestmentCategories()

  const [registerOpen, setRegisterOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Investment | undefined>()
  const [tradeTarget, setTradeTarget] = useState<{ inv: Investment; mode: 'buy' | 'sell' } | undefined>()

  const totalCost = holdings.reduce((s, h) => s + (h.purchaseAmount ?? 0), 0)
  const totalEval = holdings.reduce((s, h) => s + (h.evaluationAmount ?? h.purchaseAmount ?? 0), 0)
  const profit = totalEval - totalCost
  const profitRate = totalCost > 0 ? (profit / totalCost) * 100 : 0

  return (
    <>
      <Dialog open onOpenChange={onClose}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6 text-base">
            <span>{accountName} · 보유 종목</span>
          </DialogTitle>
          {holdings.length > 0 && (
            <p className="text-sm text-muted-foreground">
              평가손익{' '}
              <span className={`font-medium ${plClass(profit)}`}>
                {withSign(profit)} ({profit >= 0 ? '+' : ''}
                {profitRate.toFixed(2)}%)
              </span>
            </p>
          )}
        </DialogHeader>

        <div className="-mx-1 flex-1 overflow-y-auto px-1">
          {isPending ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              불러오는 중...
            </div>
          ) : holdings.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              보유 종목이 없습니다
            </div>
          ) : (
            <ul className="space-y-2">
              {holdings.map((inv) => {
                const pl =
                  inv.evaluationAmount != null && inv.purchaseAmount != null
                    ? inv.evaluationAmount - inv.purchaseAmount
                    : null
                return (
                  <li
                    key={inv.id}
                    className="rounded-xl border border-border bg-card p-3 shadow-sm"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {inv.stockName}
                          {inv.ticker && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({inv.ticker})
                            </span>
                          )}
                        </p>
                        <span
                          className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: `${categoryColor(inv.category, categoryItems)}22`,
                            color: categoryColor(inv.category, categoryItems),
                          }}
                        >
                          {inv.category}
                        </span>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-medium text-foreground">
                          {inv.evaluationAmount ? formatAmount(inv.evaluationAmount) : '-'}
                        </p>
                        {pl != null && inv.profitRate != null && (
                          <p className={`text-xs ${plClass(pl)}`}>
                            {withSign(pl)} ({inv.profitRate >= 0 ? '+' : ''}
                            {inv.profitRate.toFixed(2)}%)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-2 grid grid-cols-3 gap-1 text-xs text-muted-foreground">
                      <span>{inv.quantity ? `${inv.quantity}주` : '-'}</span>
                      <span>평단 {inv.purchasePrice ? formatAmount(inv.purchasePrice) : '-'}</span>
                      <span className="text-right">
                        원가 {inv.purchaseAmount ? formatAmount(inv.purchaseAmount) : '-'}
                      </span>
                    </div>

                    <div className="flex gap-1 border-t border-border pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => setTradeTarget({ inv, mode: 'buy' })}
                      >
                        <Plus size={12} />
                        매수
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => setTradeTarget({ inv, mode: 'sell' })}
                      >
                        <Minus size={12} />
                        매도
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditTarget(inv)}
                      >
                        <Pencil size={12} />
                        수정
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <Button variant="outline" className="w-full" onClick={() => setRegisterOpen(true)}>
          <Plus size={14} />
          종목 등록
        </Button>
      </DialogContent>
      </Dialog>

      {registerOpen && (
        <InvestmentModal presetAssetId={assetId} onClose={() => setRegisterOpen(false)} />
      )}
      {editTarget && (
        <InvestmentModal investment={editTarget} onClose={() => setEditTarget(undefined)} />
      )}
      {tradeTarget && (
        <TradeModal
          investment={tradeTarget.inv}
          mode={tradeTarget.mode}
          onClose={() => setTradeTarget(undefined)}
        />
      )}
    </>
  )
}
