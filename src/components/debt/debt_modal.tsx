import { useState } from 'react'
import type { Debt, DebtCreateRequest, DebtType, DebtUpdateRequest } from '@/types/debt'
import { usePostDebt, usePutDebt } from '@/queries/debt'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import OwnerSelect from '@/components/common/owner_select'

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

const formatWon = (value: number | undefined) => {
  if (!value) return ''
  return value.toLocaleString('ko-KR')
}

const WonInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: number | undefined
  onChange: (val: number | undefined) => void
  placeholder?: string
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '')
    if (raw === '' || /^\d+$/.test(raw)) {
      onChange(raw ? Number(raw) : undefined)
    }
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₩</span>
      <input
        className="w-full rounded-lg border border-gray-200 py-2 pl-7 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        value={formatWon(value)}
        onChange={handleChange}
        placeholder={placeholder ?? '0'}
      />
    </div>
  )
}

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
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">카테고리</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="예) 신용대출, 주택청약대출"
            />
          </div>

          <OwnerSelect
            value={form.owner}
            onChange={(value) => setForm({ ...form, owner: value })}
          />

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">부채 유형</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.type}
              onChange={(e) => handleTypeChange(e.target.value as DebtType)}
            >
              {DEBT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">잔액</label>
            <WonInput
              value={form.amount || undefined}
              onChange={(val) => setForm({ ...form, amount: val ?? 0 })}
              placeholder="남은 대출 잔액"
            />
          </div>

          {/* 정기일 때만 표시 */}
          {isRegular && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">월 상환액</label>
                <WonInput
                  value={form.monthlyPayment}
                  onChange={(val) => setForm({ ...form, monthlyPayment: val })}
                  placeholder="월 상환 금액"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">월 상환일</label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={31}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={form.paymentDay ?? ''}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setForm({ ...form, paymentDay: val >= 1 && val <= 31 ? val : undefined })
                    }}
                    placeholder="예) 25 (매달 25일)"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    일
                  </span>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">대출 목적 (선택)</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.purpose ?? ''}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              placeholder="예) 집보증금"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">메모 (선택)</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.note ?? ''}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="메모를 입력하세요"
              rows={2}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
          >
            {isPending ? '저장 중...' : isEdit ? '수정' : '등록'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DebtModal
