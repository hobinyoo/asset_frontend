import { Investment, InvestmentCreateRequest, InvestmentUpdateRequest } from '@/types/investment'
import { useState, useEffect } from 'react'
import { usePostInvestment, usePutInvestment } from '@/queries/investment'
import { useGetLinkedAssets } from '@/queries/asset'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const EMPTY_FORM: InvestmentCreateRequest = {
  assetId: undefined,
  category: '',
  stockName: '',
  ticker: '',
  owner: '',
  purchasePrice: undefined,
  quantity: undefined,
  purchaseAmount: undefined,
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

const InvestmentModal = ({
  investment,
  onClose,
}: {
  investment?: Investment
  onClose: () => void
}) => {
  const isEdit = !!investment
  const { data: linkedAssets = [] } = useGetLinkedAssets()

  const initMarket = investment?.ticker?.endsWith('.KS') ? 'KR' : 'US'
  const initTicker = investment?.ticker?.replace('.KS', '') ?? ''

  const [market, setMarket] = useState<'KR' | 'US'>(isEdit ? initMarket : 'KR')
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

  const handleMarketChange = (newMarket: 'KR' | 'US') => {
    setMarket(newMarket)
    const ticker = tickerInput ? (newMarket === 'KR' ? `${tickerInput}.KS` : tickerInput) : ''
    setForm({ ...form, ticker })
  }

  const handleTickerChange = (value: string) => {
    setTickerInput(value)
    const ticker = value ? (market === 'KR' ? `${value}.KS` : value) : ''
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
            <div className="flex gap-2">
              <div className="flex overflow-hidden rounded-lg border border-gray-200 text-sm">
                <button
                  type="button"
                  onClick={() => handleMarketChange('KR')}
                  className={`px-3 py-2 font-medium transition-colors ${
                    market === 'KR'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  국내
                </button>
                <button
                  type="button"
                  onClick={() => handleMarketChange('US')}
                  className={`px-3 py-2 font-medium transition-colors ${
                    market === 'US'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  해외
                </button>
              </div>
              <div className="relative flex-1">
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-24 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={tickerInput}
                  onChange={(e) => handleTickerChange(e.target.value)}
                  placeholder={market === 'KR' ? '예) 411060' : '예) SPY, QQQ'}
                />
                {tickerInput && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    → {market === 'KR' ? `${tickerInput}.KS` : tickerInput}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">명의</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
              placeholder="예) 호빈"
            />
          </div>

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
