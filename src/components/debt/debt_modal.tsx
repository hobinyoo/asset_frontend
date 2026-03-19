import { useState } from 'react'
import type { Debt, DebtCreateRequest, DebtType, DebtUpdateRequest } from '@/types/debt'
import { usePostDebt, usePutDebt } from '@/queries/debt'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import OwnerSelect from '@/components/common/owner_select'
import WonInput from '@/components/common/won_input'
import { FormField, FormInput, FormSelect, FormTextarea } from '@/components/common/form_field'
import ModalActions from '@/components/common/modal_actions'

const EMPTY_FORM: DebtCreateRequest = {
  category: '',
  owner: '',
  amount: 0,
  type: 'FIXED',
  monthlyPayment: undefined,
  paymentDay: undefined,
  purpose: '',
  note: '',
}

const DEBT_TYPE_OPTIONS: { value: DebtType; label: string }[] = [
  { value: 'FIXED', label: '거치' },
  { value: 'REGULAR', label: '정기' },
  { value: 'VARIABLE', label: '변동' },
]

const DebtModal = ({ debt, onClose }: { debt?: Debt; onClose: () => void }) => {
  const isEdit = !!debt
  const [form, setForm] = useState<DebtCreateRequest>(
    isEdit
      ? {
          category: debt.category,
          owner: debt.owner,
          amount: debt.amount,
          type: debt.type,
          monthlyPayment: debt.monthlyPayment ?? undefined,
          paymentDay: debt.paymentDay ?? undefined,
          purpose: debt.purpose ?? '',
          note: debt.note ?? '',
        }
      : EMPTY_FORM,
  )

  const postDebt = usePostDebt()
  const putDebt = usePutDebt(debt?.id ?? 0)

  const isRegular = form.type === 'REGULAR'

  const handleTypeChange = (type: DebtType) => {
    setForm({
      ...form,
      type,
      monthlyPayment: type === 'REGULAR' ? form.monthlyPayment : undefined,
      paymentDay: type === 'REGULAR' ? form.paymentDay : undefined,
    })
  }

  const handleSubmit = () => {
    if (!form.category || !form.owner || !form.amount) return
    if (isEdit) {
      putDebt.mutate(form as DebtUpdateRequest, { onSuccess: onClose })
    } else {
      postDebt.mutate(form, { onSuccess: onClose })
    }
  }

  const isPending = postDebt.isPending || putDebt.isPending

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isEdit ? '부채 수정' : '부채 등록'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <FormField label="카테고리">
            <FormInput
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="예) 신용대출, 주택청약대출"
            />
          </FormField>

          <OwnerSelect
            value={form.owner}
            onChange={(value) => setForm({ ...form, owner: value })}
          />

          <FormField label="부채 유형">
            <FormSelect
              value={form.type}
              onChange={(e) => handleTypeChange(e.target.value as DebtType)}
            >
              {DEBT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </FormSelect>
          </FormField>

          <FormField label="잔액">
            <WonInput
              value={form.amount || undefined}
              onChange={(val) => setForm({ ...form, amount: val ?? 0 })}
              placeholder="남은 대출 잔액"
            />
          </FormField>

          {isRegular && (
            <>
              <FormField label="월 상환액">
                <WonInput
                  value={form.monthlyPayment}
                  onChange={(val) => setForm({ ...form, monthlyPayment: val })}
                  placeholder="월 상환 금액"
                />
              </FormField>

              <FormField label="월 상환일">
                <div className="relative">
                  <FormInput
                    type="number"
                    min={1}
                    max={31}
                    value={form.paymentDay ?? ''}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setForm({ ...form, paymentDay: val >= 1 && val <= 31 ? val : undefined })
                    }}
                    placeholder="예) 25 (매달 25일)"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    일
                  </span>
                </div>
              </FormField>
            </>
          )}

          <FormField label="대출 목적 (선택)">
            <FormInput
              value={form.purpose ?? ''}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              placeholder="예) 집보증금"
            />
          </FormField>

          <FormField label="메모 (선택)">
            <FormTextarea
              value={form.note ?? ''}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="메모를 입력하세요"
              rows={2}
            />
          </FormField>
        </div>

        <ModalActions
          onClose={onClose}
          onSubmit={handleSubmit}
          isPending={isPending}
          isEdit={isEdit}
          color="red"
          className="mt-6"
        />
      </DialogContent>
    </Dialog>
  )
}

export default DebtModal
