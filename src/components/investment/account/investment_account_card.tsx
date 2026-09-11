'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useInvestmentAccount } from '@/queries/investment_account'
import { useInvestmentsByAsset } from '@/queries/investment'
import { formatAmount } from '@/utils/format'
import { getOwnerColor } from '@/utils/color'
import { Button } from '@/components/ui/button'
import { ArrowDownToLine, ArrowUpFromLine, GripVertical, Plus } from 'lucide-react'
import CashTransactionModal from '@/components/investment/account/cash_transaction_modal'
import InvestmentModal from '@/components/investment/holding/investment_modal'
import AccountHoldingsModal from '@/components/investment/account/account_holdings_modal'

// 한국 주식시장 관례: 상승=빨강, 하락=파랑
const plClass = (n: number) => (n >= 0 ? 'text-red-500' : 'text-blue-500')

export default function InvestmentAccountCard({
  assetId,
  owner,
}: {
  assetId: number
  owner: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: assetId,
  })

  const { data: account, isPending, isError } = useInvestmentAccount(assetId)
  const { data: holdings = [] } = useInvestmentsByAsset(assetId)

  const [cashMode, setCashMode] = useState<'deposit' | 'withdraw' | null>(null)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [holdingsOpen, setHoldingsOpen] = useState(false)

  const ownerColor = getOwnerColor(owner)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderLeft: `4px solid ${ownerColor}`,
  }

  if (isPending) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-40 animate-pulse rounded-xl border border-border bg-muted/40"
      />
    )
  }
  if (isError || !account) return null

  // account.totalAmount/holdingsAmount 는 DB 스냅샷(마지막 동기화 시점)이라
  // 실시간 현재가로 다시 계산한 holdings 와 어긋날 수 있음 → 여기서 직접 합산해 항상 일치시킨다
  const cost = holdings.reduce((s, h) => s + (h.purchaseAmount ?? 0), 0)
  const holdingsAmount = holdings.reduce(
    (s, h) => s + (h.evaluationAmount ?? h.purchaseAmount ?? 0),
    0,
  )
  const totalAmount = account.cashBalance + holdingsAmount
  const profit = holdingsAmount - cost
  const profitRate = cost > 0 ? (profit / cost) * 100 : 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="mb-2 flex items-start justify-between">
        <button
          type="button"
          onClick={() => setHoldingsOpen(true)}
          className="min-w-0 text-left"
        >
          <p className="truncate text-sm font-medium text-foreground">{account.assetCategory}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="rounded-full px-1.5 py-0.5 font-medium"
              style={{ backgroundColor: `${ownerColor}22`, color: ownerColor }}
            >
              {owner}
            </span>
            종목 {holdings.length}개 · 눌러서 상세
          </p>
        </button>
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label="계좌 순서 변경 핸들"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
      </div>

      <button type="button" onClick={() => setHoldingsOpen(true)} className="block w-full text-left">
        <p className="text-xl font-bold text-foreground">{formatAmount(totalAmount)}</p>
        {holdings.length > 0 && (
          <p className={`mt-0.5 text-sm font-medium ${plClass(profit)}`}>
            {profit >= 0 ? '+' : ''}
            {formatAmount(profit)} ({profit >= 0 ? '+' : ''}
            {profitRate.toFixed(2)}%)
          </p>
        )}
        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
          <span>예수금 {formatAmount(account.cashBalance)}</span>
          <span>주식 {formatAmount(holdingsAmount)}</span>
        </div>
      </button>

      <div className="mt-3 flex gap-1">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => setCashMode('deposit')}>
          <ArrowDownToLine size={13} />
          입금
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setCashMode('withdraw')}
        >
          <ArrowUpFromLine size={13} />
          출금
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => setRegisterOpen(true)}>
          <Plus size={13} />
          종목
        </Button>
      </div>

      {cashMode && (
        <CashTransactionModal account={account} mode={cashMode} onClose={() => setCashMode(null)} />
      )}
      {registerOpen && (
        <InvestmentModal presetAssetId={account.assetId} onClose={() => setRegisterOpen(false)} />
      )}
      {holdingsOpen && (
        <AccountHoldingsModal
          assetId={account.assetId}
          accountName={account.assetCategory}
          onClose={() => setHoldingsOpen(false)}
        />
      )}
    </div>
  )
}
