import type { MarketType } from '@/types/investment'
import { FormField, FormInput } from '@/components/common/form_field'

export type DomesticMarket = 'KS' | 'KQ'

const getTickerSuffix = (market: MarketType, domesticMarket: DomesticMarket): string =>
  market === 'DOMESTIC' ? `.${domesticMarket}` : ''

interface MarketTickerFieldProps {
  market: MarketType
  domesticMarket: DomesticMarket
  tickerInput: string
  onMarketChange: (market: MarketType) => void
  onDomesticMarketChange: (dmkt: DomesticMarket) => void
  onTickerChange: (value: string) => void
}

/** 국내/해외 · 코스피/코스닥 토글 + 티커 입력 (종목 검색이 자동으로 채워주고, 여기서 직접 수정도 가능) */
export default function MarketTickerField({
  market,
  domesticMarket,
  tickerInput,
  onMarketChange,
  onDomesticMarketChange,
  onTickerChange,
}: MarketTickerFieldProps) {
  const tickerSuffix = getTickerSuffix(market, domesticMarket)

  return (
    <FormField
      label={
        <>
          티커 <span className="text-gray-400">(검색하면 자동 입력, 직접 수정 가능)</span>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        {/* 국내/해외 토글 */}
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-gray-200 text-sm">
            <button
              type="button"
              onClick={() => onMarketChange('DOMESTIC')}
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
              onClick={() => onMarketChange('OVERSEAS')}
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
                  onChange={() => onDomesticMarketChange('KS')}
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
                  onChange={() => onDomesticMarketChange('KQ')}
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
            onChange={(e) => onTickerChange(e.target.value)}
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
  )
}
