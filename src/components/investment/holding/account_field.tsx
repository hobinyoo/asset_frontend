import type { Asset } from '@/types/asset'
import type { InvestmentAccount } from '@/types/investment'
import { formatAmount } from '@/utils/format'
import { FormField, FormSelect } from '@/components/common/form_field'

interface AccountFieldProps {
  /** 계좌 카드에서 등록 시 고정된 계좌 (있으면 선택 UI 대신 읽기 전용 표시) */
  presetAsset?: Asset
  linkedAssets: Asset[]
  assetId?: number
  onAssetSelect: (assetId: string) => void
  account?: InvestmentAccount
}

export default function AccountField({
  presetAsset,
  linkedAssets,
  assetId,
  onAssetSelect,
  account,
}: AccountFieldProps) {
  return (
    <FormField label="계좌">
      {presetAsset ? (
        <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
          {presetAsset.category} ({presetAsset.owner})
        </p>
      ) : linkedAssets.length === 0 ? (
        <p className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-600">
          투자 연동된 자산이 없습니다. 자산 등록 시 투자 연동을 체크해주세요.
        </p>
      ) : (
        <FormSelect value={assetId ?? ''} onChange={(e) => onAssetSelect(e.target.value)}>
          <option value="">계좌 선택</option>
          {linkedAssets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.category} ({asset.owner})
            </option>
          ))}
        </FormSelect>
      )}
      {account && (
        <p className="mt-1 text-xs text-gray-500">
          예수금 잔액{' '}
          <span className="font-medium text-gray-700">{formatAmount(account.cashBalance)}</span>{' '}
          · 매수대금이 예수금에서 차감됩니다
        </p>
      )}
    </FormField>
  )
}
