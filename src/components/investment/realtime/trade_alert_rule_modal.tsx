'use client'

import { useEffect, useState } from 'react'
import { useTradeAlertRules, useUpdateTradeAlertRules } from '@/queries/trade_alert'
import type { TradeAlertRule } from '@/types/trade_alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormField, FormInput } from '@/components/common/form_field'
import WonInput from '@/components/common/won_input'
import ModalActions from '@/components/common/modal_actions'
import { getApiErrorMessage } from '@/utils/error'

const DEFAULTS: TradeAlertRule = {
  dailyDropThreshold: -6,
  profitThreshold: 10,
  surgeThreshold: 19,
  ladder1Threshold: -5,
  ladder2Threshold: -12,
  ladder3Threshold: -23,
  ladder1Amount: 50_000,
  ladder2Amount: 100_000,
  ladder3Amount: 200_000,
}

export default function TradeAlertRuleModal({ onClose }: { onClose: () => void }) {
  const { data: rules } = useTradeAlertRules()
  const updateRules = useUpdateTradeAlertRules()

  const [form, setForm] = useState<TradeAlertRule>(DEFAULTS)

  // rules 조회가 마운트 이후에 끝나므로, 로딩되면 폼에 반영
  useEffect(() => {
    if (rules) setForm(rules)
  }, [rules])

  const set = <K extends keyof TradeAlertRule>(key: K, value: number) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = () => {
    updateRules.mutate(form, { onSuccess: onClose })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">알림 규칙 수정</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">실시간 알림 기준</p>
            <div className="grid grid-cols-3 gap-2">
              <FormField label="일간 등락 (%)">
                <FormInput
                  type="number"
                  value={form.dailyDropThreshold}
                  onChange={(e) => set('dailyDropThreshold', Number(e.target.value))}
                />
              </FormField>
              <FormField label="누적 수익률 (%)">
                <FormInput
                  type="number"
                  value={form.profitThreshold}
                  onChange={(e) => set('profitThreshold', Number(e.target.value))}
                />
              </FormField>
              <FormField label="급등 (%)">
                <FormInput
                  type="number"
                  value={form.surgeThreshold}
                  onChange={(e) => set('surgeThreshold', Number(e.target.value))}
                />
              </FormField>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">추매 사다리 — 1차</p>
            <div className="grid grid-cols-2 gap-2">
              <FormField label="수익률 기준 (%)">
                <FormInput
                  type="number"
                  value={form.ladder1Threshold}
                  onChange={(e) => set('ladder1Threshold', Number(e.target.value))}
                />
              </FormField>
              <FormField label="추매 금액">
                <WonInput
                  value={form.ladder1Amount}
                  onChange={(val) => set('ladder1Amount', val ?? 0)}
                />
              </FormField>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">추매 사다리 — 2차</p>
            <div className="grid grid-cols-2 gap-2">
              <FormField label="수익률 기준 (%)">
                <FormInput
                  type="number"
                  value={form.ladder2Threshold}
                  onChange={(e) => set('ladder2Threshold', Number(e.target.value))}
                />
              </FormField>
              <FormField label="추매 금액">
                <WonInput
                  value={form.ladder2Amount}
                  onChange={(val) => set('ladder2Amount', val ?? 0)}
                />
              </FormField>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">추매 사다리 — 3차</p>
            <div className="grid grid-cols-2 gap-2">
              <FormField label="수익률 기준 (%)">
                <FormInput
                  type="number"
                  value={form.ladder3Threshold}
                  onChange={(e) => set('ladder3Threshold', Number(e.target.value))}
                />
              </FormField>
              <FormField label="추매 금액">
                <WonInput
                  value={form.ladder3Amount}
                  onChange={(val) => set('ladder3Amount', val ?? 0)}
                />
              </FormField>
            </div>
          </div>

          <p className="text-xs text-gray-400">3차 이후로는 추매를 제안하지 않아요 (규칙 고정).</p>

          {updateRules.isError && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {getApiErrorMessage(updateRules.error)}
            </p>
          )}
        </div>

        <ModalActions
          onClose={onClose}
          onSubmit={handleSubmit}
          isPending={updateRules.isPending}
          isEdit
          className="mt-6"
        />
      </DialogContent>
    </Dialog>
  )
}
