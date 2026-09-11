'use client'

import { useState } from 'react'
import type { Investment, InvestmentTradeResponse } from '@/types/investment'
import { useBuyMoreInvestment, useSellInvestment } from '@/queries/investment'
import { formatAmount } from '@/utils/format'
import { getApiErrorMessage } from '@/utils/error'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormField, FormInput } from '@/components/common/form_field'
import WonInput from '@/components/common/won_input'
import ModalActions from '@/components/common/modal_actions'
import { Button } from '@/components/ui/button'

type TradeMode = 'buy' | 'sell'

const LABELS: Record<TradeMode, { title: string; action: string; color: 'blue' | 'red' }> = {
  buy: { title: '추가 매수', action: '매수', color: 'blue' },
  sell: { title: '매도', action: '매도', color: 'red' },
}

export default function TradeModal({
  investment,
  mode,
  onClose,
}: {
  investment: Investment
  mode: TradeMode
  onClose: () => void
}) {
  const meta = LABELS[mode]
  const held = investment.quantity ?? 0

  const [quantity, setQuantity] = useState<number | undefined>()
  const [price, setPrice] = useState<number | undefined>()
  const [result, setResult] = useState<InvestmentTradeResponse | null>(null)

  const buyMore = useBuyMoreInvestment(investment.id, investment.assetId ?? undefined)
  const sell = useSellInvestment(investment.id, investment.assetId ?? undefined)
  const mutation = mode === 'buy' ? buyMore : sell

  const tradeAmount = quantity && price ? quantity * price : 0
  const overSell = mode === 'sell' && !!quantity && quantity > held
  const canSubmit = !!quantity && quantity > 0 && !!price && price > 0 && !overSell

  const handleSubmit = () => {
    if (!canSubmit || !quantity || !price) return
    mutation.mutate(
      { quantity, price },
      { onSuccess: (data) => setResult(data) },
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {meta.title} · {investment.stockName}
          </DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <Row label={`${meta.action} 대금`} value={formatAmount(result.tradeAmount)} />
              {result.realizedProfit !== null && (
                <Row
                  label="실현손익"
                  value={
                    <span className={result.realizedProfit >= 0 ? 'text-red-500' : 'text-blue-500'}>
                      {result.realizedProfit >= 0 ? '+' : ''}
                      {formatAmount(result.realizedProfit)}
                    </span>
                  }
                />
              )}
              <Row
                label="보유 수량"
                value={result.removed ? '전량 매도 (종목 삭제)' : `${result.quantity}주`}
              />
              {!result.removed && result.purchasePrice != null && (
                <Row label="평균 매수단가" value={formatAmount(result.purchasePrice)} />
              )}
              <Row label="예수금 잔액" value={formatAmount(result.cashBalance)} />
            </div>
            <Button className="w-full" onClick={onClose}>
              확인
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              현재 보유 {held}주
              {investment.purchasePrice != null && ` · 평단 ${formatAmount(investment.purchasePrice)}`}
            </div>

            <FormField label={`${meta.action} 수량`}>
              <FormInput
                type="number"
                min={1}
                value={quantity ?? ''}
                onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
              />
              {overSell && (
                <p className="mt-1 text-xs text-destructive">보유 수량({held}주)을 초과했습니다.</p>
              )}
            </FormField>

            <FormField label="1주당 체결가">
              <WonInput value={price} onChange={setPrice} placeholder="0" />
            </FormField>

            <div className="flex justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
              <span className="text-muted-foreground">{meta.action} 대금</span>
              <span className="font-medium text-foreground">{formatAmount(tradeAmount)}</span>
            </div>

            {mutation.isError && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {getApiErrorMessage(mutation.error)}
              </p>
            )}

            <ModalActions
              onClose={onClose}
              onSubmit={handleSubmit}
              isPending={mutation.isPending}
              isEdit
              disabled={!canSubmit}
              color={meta.color}
              submitLabel={meta.action}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
