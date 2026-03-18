import {
  Investment,
  InvestmentCreateRequest,
  InvestmentUpdateRequest,
  MarketType,
} from '@/types/investment'
import { useState, useEffect } from 'react'
import { usePostInvestment, usePutInvestment } from '@/queries/investment'
import { useGetLinkedAssets } from '@/queries/asset'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import OwnerSelect from '@/components/common/owner_select'

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

const CATEGORY_OPTIONS = ['ETF', '금', '현금', '채권', '국내주식', '해외주식', '기타']

const formatWon = (value: number | undefined) => {
  if (!value) return ''
  return value.toLocaleString('ko-KR')
}

const WonInput = ({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: number | undefined
  onChange: (val: number | undefined) => void
  placeholder?: string
  disabled?: boolean
}) => {
  const [display, setDisplay] = useState(formatWon(value))

  useEffect(() => {
    setDisplay(formatWon(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '')
    if (raw === '' || /^\d+$/.test(raw)) {
      setDisplay(raw ? Number(raw).toLocaleString('ko-KR') : '')
      onChange(raw ? Number(raw) : undefined)
    }
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₩</span>
      <input
        className="w-full rounded-lg border border-gray-200 py-2 pl-7 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400"
        value={display}
        onChange={handleChange}
        placeholder={placeholder ?? '0'}
        disabled={disabled}
      />
    </div>
  )
}

type DomesticMarket = 'KS' | 'KQ'

const getTickerSuffix = (market: MarketType, domesticMarket: DomesticMarket): string => {
  if (market === 'OVERSEAS') return ''
  return market === 'DOMESTIC' ? `.${domesticMarket}` : ''
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

  const buildTicker = (input: string, mkt: MarketType, dmkt: DomesticMarket) => {
    if (!input) return ''
    return mkt === 'DOMESTIC' ? `${input}.${dmkt}` : input
  }

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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isEdit ? '투자 종목 수정' : '투자 종목 등록'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">계좌</label>
            {linkedAssets.length === 0 ? (
              <p className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-600">
                투자 연동된 자산이 없습니다. 자산 등록 시 투자 연동을 체크해주세요.
              </p>
            ) : (
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={form.assetId ?? ''}
                onChange={(e) => handleAssetSelect(e.target.value)}
              >
                <option value="">계좌 선택</option>
                {linkedAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.category} ({asset.owner})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">카테고리</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">선택</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">종목명</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.stockName}
              onChange={(e) => setForm({ ...form, stockName: e.target.value })}
              placeholder="예) S&P500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              티커 <span className="text-gray-400">(현재가 조회용, 없으면 생략)</span>
            </label>
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
                    <label className="flex items-center gap-1 cursor-pointer">
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
                    <label className="flex items-center gap-1 cursor-pointer">
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
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-32 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={tickerInput}
                  onChange={(e) => handleTickerChange(e.target.value)}
                  placeholder={market === 'DOMESTIC' ? '예) 411060' : '예) SPY, QQQ'}
                />
                {tickerInput && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    → {tickerInput}
                    {tickerSuffix}
                  </span>
                )}
              </div>
            </div>
          </div>

          <OwnerSelect
            value={form.owner}
            onChange={(value) => setForm({ ...form, owner: value })}
          />

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">매수단가 (선택)</label>
            <WonInput
              value={form.purchasePrice}
              onChange={(val) => setForm({ ...form, purchasePrice: val })}
              placeholder="1주당 가격"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">수량 (선택)</label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.quantity ?? ''}
              onChange={(e) =>
                setForm({ ...form, quantity: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="0"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
              매수금액
              {isAmountAuto ? (
                <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-600">
                  자동계산
                </span>
              ) : (
                <span className="text-gray-400">(단가×수량 없을 때 직접 입력)</span>
              )}
            </label>
            <WonInput
              value={isAmountAuto ? autoAmount : form.purchaseAmount}
              onChange={(val) => setForm({ ...form, purchaseAmount: val })}
              disabled={isAmountAuto}
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
            disabled={isPending || !form.assetId}
            className="flex-1 rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {isPending ? '저장 중...' : isEdit ? '수정' : '등록'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InvestmentModal
