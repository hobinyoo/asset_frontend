'use client'

import { useState } from 'react'
import type { InvestmentAccount } from '@/types/investment'
import { useDepositCash, useWithdrawCash } from '@/queries/investment_account'
import { formatAmount } from '@/utils/format'
import { getApiErrorMessage } from '@/utils/error'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormField } from '@/components/common/form_field'
import WonInput from '@/components/common/won_input'
import ModalActions from '@/components/common/modal_actions'

type CashMode = 'deposit' | 'withdraw'

const LABELS: Record<CashMode, { title: string; action: string; color: 'blue' | 'red' }> = {
  deposit: { title: '예수금 입금', action: '입금', color: 'blue' },
  withdraw: { title: '예수금 출금', action: '출금', color: 'red' },
}

export default function CashTransactionModal({
  account,
  mode,
  onClose,
}: {
  account: InvestmentAccount
  mode: CashMode
  onClose: () => void
}) {
  const meta = LABELS[mode]
  const [amount, setAmount] = useState<number | undefined>()

  const deposit = useDepositCash(account.assetId)
  const withdraw = useWithdrawCash(account.assetId)
  const mutation = mode === 'deposit' ? deposit : withdraw

  const overWithdraw = mode === 'withdraw' && !!amount && amount > account.cashBalance
  const canSubmit = !!amount && amount > 0 && !overWithdraw

  const handleSubmit = () => {
    if (!canSubmit || !amount) return
    mutation.mutate(amount, { onSuccess: onClose })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {meta.title} · {account.assetCategory}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            현재 예수금 {formatAmount(account.cashBalance)}
          </div>

          <FormField label={`${meta.action} 금액`}>
            <WonInput value={amount} onChange={setAmount} placeholder="0" />
            {overWithdraw && (
              <p className="mt-1 text-xs text-destructive">예수금 잔액을 초과했습니다.</p>
            )}
          </FormField>

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
      </DialogContent>
    </Dialog>
  )
}
