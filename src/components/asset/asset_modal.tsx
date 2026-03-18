'use client'

import { useState } from 'react'
import { usePostAsset, usePutAsset } from '@/queries/asset'
import type { Asset, AssetCreateRequest, AssetUpdateRequest, AssetType } from '@/types/asset'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import OwnerSelect from '@/components/common/owner_select'

const ASSET_TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: 'HOUSING', label: '주택자금' },
  { value: 'SAVINGS', label: '청약·공제' },
  { value: 'RETIREMENT', label: '노후 자산 (IRP·연금·DC)' },
  { value: 'INVESTMENT', label: '투자 (주식·ISA·토스)' },
]

const EMPTY_FORM: AssetCreateRequest = {
  category: '',
  owner: '',
  amount: 0,
  type: 'HOUSING',
  monthlyPayment: undefined,
  paymentDay: undefined,
  note: '',
  linkedToInvestment: false,
}

export default function AssetModal({ asset, onClose }: { asset?: Asset; onClose: () => void }) {
  const isEdit = !!asset
  const [form, setForm] = useState<AssetCreateRequest>(
    isEdit
      ? {
          category: asset.category,
          owner: asset.owner,
          amount: asset.amount,
          type: asset.type,
          monthlyPayment: asset.monthlyPayment ?? undefined,
          paymentDay: asset.paymentDay ?? undefined,
          note: asset.note ?? '',
          linkedToInvestment: asset.linkedToInvestment,
        }
      : EMPTY_FORM,
  )

  const [hasMonthlyPayment, setHasMonthlyPayment] = useState(
    isEdit ? !!asset.monthlyPayment : false,
  )

  const postAsset = usePostAsset()
  const putAsset = usePutAsset(asset?.id ?? 0)

  const handleMonthlyPaymentToggle = (has: boolean) => {
    setHasMonthlyPayment(has)
    if (!has) {
      setForm({ ...form, monthlyPayment: undefined, paymentDay: undefined })
    }
  }

  const handleSubmit = () => {
    if (!form.category || !form.owner || !form.amount) return
    if (isEdit) {
      putAsset.mutate(form as AssetUpdateRequest, { onSuccess: onClose })
    } else {
      postAsset.mutate(form, { onSuccess: onClose })
    }
  }

  const isPending = postAsset.isPending || putAsset.isPending

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isEdit ? '자산 수정' : '자산 등록'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">카테고리</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="예) 국민은행 적금"
            />
          </div>

          <OwnerSelect
            value={form.owner}
            onChange={(value) => setForm({ ...form, owner: value })}
          />

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">자산 유형</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as AssetType })}
            >
              {ASSET_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">금액 (원)</label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.amount || ''}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              placeholder="0"
            />
          </div>

          {/* 월납입금 라디오 */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">월 납입금</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                <input
                  type="radio"
                  name="monthlyPayment"
                  checked={!hasMonthlyPayment}
                  onChange={() => handleMonthlyPaymentToggle(false)}
                  className="h-4 w-4"
                />
                없음
              </label>
              <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                <input
                  type="radio"
                  name="monthlyPayment"
                  checked={hasMonthlyPayment}
                  onChange={() => handleMonthlyPaymentToggle(true)}
                  className="h-4 w-4"
                />
                있음
              </label>
            </div>
          </div>

          {hasMonthlyPayment && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  월 납입금 (원)
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={form.monthlyPayment || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      monthlyPayment: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">월 납입일</label>
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
            <label className="mb-1 block text-xs font-medium text-gray-500">메모 (선택)</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.note ?? ''}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="메모를 입력하세요"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="linked"
              checked={form.linkedToInvestment ?? false}
              onChange={(e) => setForm({ ...form, linkedToInvestment: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="linked" className="text-sm text-gray-600">
              투자 연동
            </label>
          </div>
        </div>

        <div className="mt-2 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {isPending ? '저장 중...' : isEdit ? '수정' : '등록'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
