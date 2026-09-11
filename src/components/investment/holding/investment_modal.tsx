'use client'

import { useEffect, useState } from 'react'
import {
  Investment,
  InvestmentCreateRequest,
  InvestmentUpdateRequest,
  MarketType,
  StockSearchItem,
} from '@/types/investment'
import { usePostInvestment, usePutInvestment, useStockQuote } from '@/queries/investment'
import { useInvestmentAccount } from '@/queries/investment_account'
import { useGetLinkedAssets } from '@/queries/asset'
import { formatAmount } from '@/utils/format'
import { getApiErrorMessage } from '@/utils/error'
import {
  useInvestmentCategories,
  useAddInvestmentCategory,
  useDeleteInvestmentCategory,
} from '@/queries/config'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ConfigSelectField from '@/components/common/config_select_field'
import WonInput from '@/components/common/won_input'
import { FormField, FormInput } from '@/components/common/form_field'
import ModalActions from '@/components/common/modal_actions'
import StockSearchField from '@/components/investment/holding/stock_search_field'
import AccountField from '@/components/investment/holding/account_field'
import MarketTickerField, {
  type DomesticMarket,
} from '@/components/investment/holding/market_ticker_field'

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

const buildTicker = (input: string, mkt: MarketType, dmkt: DomesticMarket) => {
  if (!input) return ''
  return mkt === 'DOMESTIC' ? `${input}.${dmkt}` : input
}

const InvestmentModal = ({
  investment,
  presetAssetId,
  onClose,
}: {
  investment?: Investment
  /** 계좌 카드에서 등록 시 연동 자산 id 고정 (계좌 선택 UI 숨김) */
  presetAssetId?: number
  onClose: () => void
}) => {
  const isEdit = !!investment
  const { data: linkedAssets = [] } = useGetLinkedAssets()
  const presetAsset = presetAssetId ? linkedAssets.find((a) => a.id === presetAssetId) : undefined
  const { data: investmentCategories = [] } = useInvestmentCategories()
  const addInvestmentCategory = useAddInvestmentCategory()
  const deleteInvestmentCategory = useDeleteInvestmentCategory()

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
      : { ...EMPTY_FORM, assetId: presetAssetId },
  )

  const postInvestment = usePostInvestment()
  const putInvestment = usePutInvestment(investment?.id ?? 0)
  const { data: account } = useInvestmentAccount(form.assetId)

  // 소유자는 계좌(자산) 소유자로 고정 — 별도 입력 UI 없음
  const resolvedOwner = isEdit
    ? investment.owner
    : (linkedAssets.find((a) => a.id === form.assetId)?.owner ?? '')

  // 현재가 자동 조회 → 매수단가 자동 반영 (등록 모드에서만, 사용자가 단가를 직접 건드리면 중단)
  const [priceTouched, setPriceTouched] = useState(false)
  const [debouncedTicker, setDebouncedTicker] = useState(form.ticker ?? '')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTicker(form.ticker ?? ''), 500)
    return () => clearTimeout(t)
  }, [form.ticker])
  const quote = useStockQuote(isEdit ? '' : debouncedTicker, market)
  const quotePrice = quote.data?.currentPrice ?? null

  // form 에 저장하지 않고 파생값으로 계산 (effect 에서 setState 회피)
  const usingQuotePrice = !isEdit && !priceTouched && quotePrice != null
  const purchasePrice = usingQuotePrice ? quotePrice : form.purchasePrice

  const applyQuotePrice = () => setPriceTouched(false)

  const autoAmount = purchasePrice && form.quantity ? purchasePrice * form.quantity : undefined
  const isAmountAuto = !!(purchasePrice && form.quantity)
  const cost = isAmountAuto ? autoAmount : form.purchaseAmount
  // 신규 등록은 최초 매수 → 매수대금이 예수금에서 차감되므로 금액이 필수
  const needsCost = !isEdit
  const insufficientCash = needsCost && !!cost && !!account && cost > account.cashBalance
  const mutationError = postInvestment.error ?? putInvestment.error
  const isError = postInvestment.isError || putInvestment.isError

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

  const handleStockSelect = (item: StockSearchItem) => {
    const dmkt: DomesticMarket = item.exchange === 'KOSDAQ' ? 'KQ' : 'KS'
    const bare =
      item.marketType === 'DOMESTIC' ? item.symbol.replace(/\.(KS|KQ)$/, '') : item.symbol
    setMarket(item.marketType)
    setDomesticMarket(dmkt)
    setTickerInput(bare)
    setForm((f) => ({
      ...f,
      stockName: item.name,
      ticker: item.symbol,
      marketType: item.marketType,
    }))
  }

  const handleSubmit = () => {
    if (!form.assetId || !form.category || !form.stockName || !resolvedOwner) return
    if (needsCost && (!cost || cost <= 0)) return
    const submitForm = {
      ...form,
      owner: resolvedOwner,
      purchasePrice,
      purchaseAmount: isAmountAuto ? autoAmount : form.purchaseAmount,
    }
    if (isEdit) {
      putInvestment.mutate(submitForm as InvestmentUpdateRequest, { onSuccess: onClose })
    } else {
      postInvestment.mutate(submitForm, { onSuccess: onClose })
    }
  }

  const isPending = postInvestment.isPending || putInvestment.isPending

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isEdit ? '투자 종목 수정' : '신규 종목 매수'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {!isEdit && (
            <AccountField
              presetAsset={presetAsset}
              linkedAssets={linkedAssets}
              assetId={form.assetId}
              onAssetSelect={handleAssetSelect}
              account={account}
            />
          )}

          <StockSearchField
            value={form.stockName}
            onChange={(name) => setForm({ ...form, stockName: name })}
            onSelect={handleStockSelect}
          />

          <MarketTickerField
            market={market}
            domesticMarket={domesticMarket}
            tickerInput={tickerInput}
            onMarketChange={handleMarketChange}
            onDomesticMarketChange={handleDomesticMarketChange}
            onTickerChange={handleTickerChange}
          />

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

          {!isEdit && (
            <>
              <FormField label="수량 (필수)">
                <FormInput
                  type="number"
                  value={form.quantity ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="0"
                />
              </FormField>

              <FormField
                label={
                  <>
                    매수단가 (필수)
                    {usingQuotePrice && (
                      <span className="ml-1.5 rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-600">
                        현재가 반영
                      </span>
                    )}
                  </>
                }
              >
                <WonInput
                  value={purchasePrice}
                  onChange={(val) => {
                    setPriceTouched(true)
                    setForm({ ...form, purchasePrice: val })
                  }}
                  placeholder="1주당 가격"
                />
                {form.ticker && (
                  <p className="mt-1 text-xs text-gray-500">
                    {quote.isFetching
                      ? '현재가 조회 중...'
                      : quotePrice != null
                        ? `현재가 ${formatAmount(quotePrice)}${
                            quote.data?.marketType === 'OVERSEAS' && quote.data.rawPrice != null
                              ? ` ($${quote.data.rawPrice})`
                              : ''
                          }`
                        : '현재가를 못 가져왔어요. 매수단가를 직접 입력하세요.'}
                    {priceTouched && quotePrice != null && (
                      <button
                        type="button"
                        onClick={applyQuotePrice}
                        className="ml-2 text-blue-500 underline"
                      >
                        현재가로
                      </button>
                    )}
                  </p>
                )}
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
                      <span className="ml-1 text-gray-400">(단가×수량 없을 때 직접 입력, 필수)</span>
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
            </>
          )}

          {isEdit && (
            <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-600">
              수량·매수단가는 여기서 바꿀 수 없습니다. 추가 매수·매도는 목록의 매수/매도 버튼을
              이용하세요.
            </p>
          )}

          {insufficientCash && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              매수대금({formatAmount(cost ?? 0)})이 예수금 잔액(
              {formatAmount(account?.cashBalance ?? 0)})을 초과합니다.
            </p>
          )}
          {isError && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {getApiErrorMessage(mutationError)}
            </p>
          )}
        </div>

        <ModalActions
          onClose={onClose}
          onSubmit={handleSubmit}
          isPending={isPending}
          isEdit={isEdit}
          disabled={
            !form.assetId ||
            !form.category ||
            !form.stockName ||
            (needsCost && (!cost || cost <= 0)) ||
            insufficientCash
          }
          submitLabel={isEdit ? undefined : '매수'}
          className="mt-6"
        />
      </DialogContent>
    </Dialog>
  )
}

export default InvestmentModal
