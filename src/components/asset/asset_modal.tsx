'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { usePostAsset, usePutAsset } from '@/queries/asset'
import {
  useAssetCategories,
  useAddAssetCategory,
  useDeleteAssetCategory,
  useAssetOwners,
  useAddAssetOwner,
  useDeleteAssetOwner,
} from '@/queries/config'
import type { Asset, AssetCreateRequest, AssetUpdateRequest, AssetType } from '@/types/asset'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ConfigSelectField from '@/components/common/config_select_field'
import { FormField, FormInput, FormSelect, FormTextarea } from '@/components/common/form_field'
import ModalActions from '@/components/common/modal_actions'

const ASSET_TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: 'HOUSING', label: '주택자금' },
  { value: 'SAVINGS', label: '청약·공제' },
  { value: 'RETIREMENT', label: '노후 자산 (IRP·연금·DC)' },
  { value: 'INVESTMENT', label: '투자 (주식·ISA·토스)' },
]

export default function AssetModal({ asset, onClose }: { asset?: Asset; onClose: () => void }) {
  const isEdit = !!asset

  const [hasMonthlyPayment, setHasMonthlyPayment] = useState(
    isEdit ? !!asset.monthlyPayment : false,
  )

  const postAsset = usePostAsset()
  const putAsset = usePutAsset(asset?.id ?? 0)
  const { data: assetCategories = [] } = useAssetCategories()
  const { data: assetOwners = [] } = useAssetOwners()
  const addAssetCategory = useAddAssetCategory()
  const deleteAssetCategory = useDeleteAssetCategory()
  const addAssetOwner = useAddAssetOwner()
  const deleteAssetOwner = useDeleteAssetOwner()

  const form = useForm({
    defaultValues: {
      category: isEdit ? asset.category : '',
      owner: isEdit ? asset.owner : '',
      amount: isEdit ? asset.amount : 0,
      type: isEdit ? asset.type : ('HOUSING' as AssetType),
      monthlyPayment: isEdit ? (asset.monthlyPayment ?? undefined) : (undefined as number | undefined),
      paymentDay: isEdit ? (asset.paymentDay ?? undefined) : (undefined as number | undefined),
      note: isEdit ? (asset.note ?? '') : '',
      linkedToInvestment: isEdit ? asset.linkedToInvestment : false,
    },
    onSubmit: async ({ value }) => {
      if (!value.category || !value.owner || !value.amount) return
      if (isEdit) {
        putAsset.mutate(value as AssetUpdateRequest, { onSuccess: onClose })
      } else {
        postAsset.mutate(value as AssetCreateRequest, { onSuccess: onClose })
      }
    },
  })

  const handleMonthlyPaymentToggle = (has: boolean) => {
    setHasMonthlyPayment(has)
    if (!has) {
      form.setFieldValue('monthlyPayment', undefined)
      form.setFieldValue('paymentDay', undefined)
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

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <div className="space-y-3">
            <form.Field
              name="category"
              children={(field) => (
                <ConfigSelectField
                  label="카테고리"
                  value={field.state.value}
                  onChange={field.handleChange}
                  items={assetCategories}
                  onAdd={(value, onSuccess) => addAssetCategory.mutate(value, { onSuccess })}
                  onDelete={(id) => deleteAssetCategory.mutate(id)}
                  isPending={addAssetCategory.isPending}
                  placeholder="카테고리 선택"
                />
              )}
            />

            <form.Field
              name="owner"
              children={(field) => (
                <ConfigSelectField
                  label="소유자"
                  value={field.state.value}
                  onChange={field.handleChange}
                  items={assetOwners}
                  onAdd={(value, onSuccess) => addAssetOwner.mutate(value, { onSuccess })}
                  onDelete={(id) => deleteAssetOwner.mutate(id)}
                  isPending={addAssetOwner.isPending}
                  placeholder="소유자 선택"
                />
              )}
            />

            <form.Field
              name="type"
              children={(field) => (
                <FormField label="자산 유형">
                  <FormSelect
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value as AssetType)}
                  >
                    {ASSET_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </FormSelect>
                </FormField>
              )}
            />

            <form.Field
              name="amount"
              children={(field) => (
                <FormField label="금액 (원)">
                  <FormInput
                    type="number"
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    placeholder="0"
                  />
                </FormField>
              )}
            />

            {/* 월납입금 라디오 */}
            <div>
              <p className="mb-2 text-xs font-medium text-gray-500">월 납입금</p>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-600">
                  <input
                    type="radio"
                    name="monthlyPayment"
                    checked={!hasMonthlyPayment}
                    onChange={() => handleMonthlyPaymentToggle(false)}
                    className="h-4 w-4"
                  />
                  없음
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-600">
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
                <form.Field
                  name="monthlyPayment"
                  children={(field) => (
                    <FormField label="월 납입금 (원)">
                      <FormInput
                        type="number"
                        value={field.state.value || ''}
                        onChange={(e) =>
                          field.handleChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                        placeholder="0"
                      />
                    </FormField>
                  )}
                />

                <form.Field
                  name="paymentDay"
                  children={(field) => (
                    <FormField label="월 납입일">
                      <div className="relative">
                        <FormInput
                          type="number"
                          min={1}
                          max={31}
                          value={field.state.value ?? ''}
                          onChange={(e) => {
                            const val = Number(e.target.value)
                            field.handleChange(val >= 1 && val <= 31 ? val : undefined)
                          }}
                          placeholder="예) 25 (매달 25일)"
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          일
                        </span>
                      </div>
                    </FormField>
                  )}
                />
              </>
            )}

            <form.Field
              name="note"
              children={(field) => (
                <FormField label="메모 (선택)">
                  <FormTextarea
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="메모를 입력하세요"
                    rows={2}
                  />
                </FormField>
              )}
            />

            <form.Field
              name="linkedToInvestment"
              children={(field) => (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="linked"
                    checked={field.state.value ?? false}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="linked" className="text-sm text-gray-600">
                    투자 연동
                  </label>
                </div>
              )}
            />
          </div>

          <ModalActions
            onClose={onClose}
            onSubmit={() => form.handleSubmit()}
            isPending={isPending}
            isEdit={isEdit}
            className="mt-2"
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
