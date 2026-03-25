'use client'

import { useState } from 'react'
import {
  Investment,
  InvestmentCreateRequest,
  InvestmentUpdateRequest,
  MarketType,
} from '@/types/investment'
import { usePostInvestment, usePutInvestment } from '@/queries/investment'
import { useGetLinkedAssets } from '@/queries/asset'
import {
  useInvestmentCategories,
  useAddInvestmentCategory,
  useDeleteInvestmentCategory,
  useAssetOwners,
  useAddAssetOwner,
  useDeleteAssetOwner,
} from '@/queries/config'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ConfigSelectField from '@/components/common/config_select_field'
import WonInput from '@/components/common/won_input'
import { FormField, FormInput, FormSelect } from '@/components/common/form_field'
import ModalActions from '@/components/common/modal_actions'

const EMPTY_FORM: InvestmentCreateRequest = {
  assetId: undefined,
  category: '',
  stockName: '',
  ticker: '',
  owner: '',
  purchasePrice: undefined,
  quantity: undefined,
  purchaseAmount: undefined,
  marketType: 'DOMESTIC',
}

type DomesticMarket = 'KS' | 'KQ'

const getTickerSuffix = (market: MarketType, domesticMarket: DomesticMarket): string => {
  if (market === 'OVERSEAS') return ''
  return market === 'DOMESTIC' ? `.${domesticMarket}` : ''
}

const buildTicker = (input: string, mkt: MarketType, dmkt: DomesticMarket) => {
  if (!input) return ''
  return mkt === 'DOMESTIC' ? `${input}.${dmkt}` : input
}

const InvestmentModal = ({
  investment,
  onClose,
}: {
  investment?: Investment
  onClose: () => void
}) => {
  const isEdit = !!investment
  const { data: linkedAssets = [] } = useGetLinkedAssets()
  const { data: investmentCategories = [] } = useInvestmentCategories()
  const addInvestmentCategory = useAddInvestmentCategory()
  const deleteInvestmentCategory = useDeleteInvestmentCategory()
  const { data: assetOwners = [] } = useAssetOwners()
  const addAssetOwner = useAddAssetOwner()
  const deleteAssetOwner = useDeleteAssetOwner()

  const initMarket: MarketType = isEdit ? investment.marketType : 'DOMESTIC'
  const initDomesticMarket: DomesticMarket = investment?.ticker?.endsWith('.KQ') ? 'KQ' : 'KS'
  const initTicker = investment?.ticker?.replace('.KS', '').replace('.KQ', '') ?? ''

  const [market, setMarket] = useState<MarketType>(initMarket)
  const [domesticMarket, setDomesticMarket] = useState<DomesticMarket>(initDomesticMarket)
  const [tickerInput, setTickerInput] = useState(isEdit ? initTicker : '')

  const [form, setForm] = useState<InvestmentCreateRequest>(
    isEdit
      ? {
          assetId: investment.assetId ?? undefined,
          category: investment.category,
          stockName: investment.stockName,
          ticker: investment.ticker ?? '',
          owner: investment.owner,
          purchasePrice: investment.purchasePrice ?? undefined,
          quantity: investment.quantity ?? undefined,
          purchaseAmount: investment.purchaseAmount ?? undefined,
          marketType: investment.marketType,
        }
      : EMPTY_FORM,
  )

  const postInvestment = usePostInvestment()
  const putInvestment = usePutInvestment(investment?.id ?? 0)

  const autoAmount =
    form.purchasePrice && form.quantity ? form.purchasePrice * form.quantity : undefined
  const isAmountAuto = !!(form.purchasePrice && form.quantity)

  const handleAssetSelect = (assetId: string) => {
    const selected = linkedAssets.find((a) => a.id === Number(assetId))
    setForm({ ...form, assetId: selected?.id })
  }

  const handleMarketChange = (newMarket: MarketType) => {
    setMarket(newMarket)
    const ticker = buildTicker(tickerInput, newMarket, domesticMarket)
    setForm({ ...form, ticker, marketType: newMarket })
  }

  const handleDomesticMarketChange = (newDmkt: DomesticMarket) => {
    setDomesticMarket(newDmkt)
    const ticker = buildTicker(tickerInput, market, newDmkt)
    setForm({ ...form, ticker })
  }

  const handleTickerChange = (value: string) => {
    setTickerInput(value)
    const ticker = buildTicker(value, market, domesticMarket)
    setForm({ ...form, ticker })
  }

  const handleSubmit = () => {
    if (!form.assetId || !form.category || !form.stockName || !form.owner) return
    const submitForm = { ...form, purchaseAmount: isAmountAuto ? autoAmount : form.purchaseAmount }
    if (isEdit) {
      putInvestment.mutate(submitForm as InvestmentUpdateRequest, { onSuccess: onClose })
    } else {
      postInvestment.mutate(submitForm, { onSuccess: onClose })
    }
  }

  const isPending = postInvestment.isPending || putInvestment.isPending
  const tickerSuffix = getTickerSuffix(market, domesticMarket)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isEdit ? '투자 종목 수정' : '투자 종목 등록'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <FormField label="계좌">
            {linkedAssets.length === 0 ? (
              <p className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-600">
                투자 연동된 자산이 없습니다. 자산 등록 시 투자 연동을 체크해주세요.
              </p>
            ) : (
              <FormSelect
                value={form.assetId ?? ''}
                onChange={(e) => handleAssetSelect(e.target.value)}
              >
                <option value="">계좌 선택</option>
                {linkedAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.category} ({asset.owner})
                  </option>
                ))}
              </FormSelect>
            )}
          </FormField>

          <ConfigSelectField
            label="카테고리"
            value={form.category}
            onChange={(value) => setForm({ ...form, category: value })}
            items={investmentCategories}
            onAdd={(value, onSuccess) => addInvestmentCategory.mutate(value, { onSuccess })}
            onDelete={(id) => deleteInvestmentCategory.mutate(id)}
            isPending={addInvestmentCategory.isPending}
            placeholder="카테고리 선택"
          />

          <FormField label="종목명">
            <FormInput
              value={form.stockName}
              onChange={(e) => setForm({ ...form, stockName: e.target.value })}
              placeholder="예) S&P500"
            />
          </FormField>

          <FormField
            label={
              <>
                티커 <span className="text-gray-400">(현재가 조회용, 없으면 생략)</span>
              </>
            }
          >
            <div className="flex flex-col gap-2">
              {/* 국내/해외 토글 */}
              <div className="flex items-center gap-2">
                <div className="flex overflow-hidden rounded-lg border border-gray-200 text-sm">
                  <button
                    type="button"
                    onClick={() => handleMarketChange('DOMESTIC')}
                    className={`px-3 py-2 font-medium transition-colors ${
                      market === 'DOMESTIC'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    국내
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarketChange('OVERSEAS')}
                    className={`px-3 py-2 font-medium transition-colors ${
                      market === 'OVERSEAS'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    해외
                  </button>
                </div>

                {/* 국내일 때만 코스피/코스닥 라디오 */}
                {market === 'DOMESTIC' && (
                  <div className="flex items-center gap-3 text-sm">
                    <label className="flex cursor-pointer items-center gap-1">
                      <input
                        type="radio"
                        name="domesticMarket"
                        value="KS"
                        checked={domesticMarket === 'KS'}
                        onChange={() => handleDomesticMarketChange('KS')}
                        className="accent-blue-500"
                      />
                      <span className="text-gray-600">코스피</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-1">
                      <input
                        type="radio"
                        name="domesticMarket"
                        value="KQ"
                        checked={domesticMarket === 'KQ'}
                        onChange={() => handleDomesticMarketChange('KQ')}
                        className="accent-blue-500"
                      />
                      <span className="text-gray-600">코스닥</span>
                    </label>
                  </div>
                )}
              </div>

              {/* 티커 입력 */}
              <div className="relative">
                <FormInput
                  value={tickerInput}
                  onChange={(e) => handleTickerChange(e.target.value)}
                  placeholder={market === 'DOMESTIC' ? '예) 411060' : '예) SPY, QQQ'}
                  className="pr-32"
                />
                {tickerInput && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    → {tickerInput}
                    {tickerSuffix}
                  </span>
                )}
              </div>
            </div>
          </FormField>

          <ConfigSelectField
            label="소유자"
            value={form.owner}
            onChange={(value) => setForm({ ...form, owner: value })}
            items={assetOwners}
            onAdd={(value, onSuccess) => addAssetOwner.mutate(value, { onSuccess })}
            onDelete={(id) => deleteAssetOwner.mutate(id)}
            isPending={addAssetOwner.isPending}
            placeholder="소유자 선택"
          />

          <FormField label="매수단가 (선택)">
            <WonInput
              value={form.purchasePrice}
              onChange={(val) => setForm({ ...form, purchasePrice: val })}
              placeholder="1주당 가격"
            />
          </FormField>

          <FormField label="수량 (선택)">
            <FormInput
              type="number"
              value={form.quantity ?? ''}
              onChange={(e) =>
                setForm({ ...form, quantity: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="0"
            />
          </FormField>

          <FormField
            label={
              <>
                매수금액
                {isAmountAuto ? (
                  <span className="ml-1.5 rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-600">
                    자동계산
                  </span>
                ) : (
                  <span className="ml-1 text-gray-400">(단가×수량 없을 때 직접 입력)</span>
                )}
              </>
            }
          >
            <WonInput
              value={isAmountAuto ? autoAmount : form.purchaseAmount}
              onChange={(val) => setForm({ ...form, purchaseAmount: val })}
              disabled={isAmountAuto}
            />
          </FormField>
        </div>

        <ModalActions
          onClose={onClose}
          onSubmit={handleSubmit}
          isPending={isPending}
          isEdit={isEdit}
          disabled={!form.assetId}
          className="mt-6"
        />
      </DialogContent>
    </Dialog>
  )
}

export default InvestmentModal
