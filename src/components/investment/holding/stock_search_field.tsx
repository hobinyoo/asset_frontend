'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { StockSearchItem } from '@/types/investment'
import { useStockSearch } from '@/queries/investment'
import { FormField, FormInput } from '@/components/common/form_field'

interface Props {
  /** 현재 종목명 값 */
  value: string
  /** 사용자가 직접 타이핑할 때 */
  onChange: (name: string) => void
  /** 검색 결과에서 하나 선택했을 때 (종목명·티커·시장구분 채우기) */
  onSelect: (item: StockSearchItem) => void
}

const marketLabel = (item: StockSearchItem) =>
  item.marketType === 'DOMESTIC'
    ? item.exchange === 'KOSDAQ'
      ? '코스닥'
      : '코스피'
    : item.exchange

export default function StockSearchField({ value, onChange, onSelect }: Props) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [debounced, setDebounced] = useState(value)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), 300)
    return () => clearTimeout(t)
  }, [value])

  const { data: results = [], isFetching } = useStockSearch(debounced)
  const showList = open && debounced.trim().length >= 2
  // 결과가 줄어들어 인덱스가 범위를 벗어나면 무효 처리
  const active = activeIndex < results.length ? activeIndex : -1

  const pick = (item: StockSearchItem) => {
    onSelect(item)
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!showList) {
        setOpen(true)
        return
      }
      setActiveIndex(active < results.length - 1 ? active + 1 : 0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(active > 0 ? active - 1 : results.length - 1)
    } else if (e.key === 'Enter' && showList && active >= 0) {
      e.preventDefault()
      pick(results[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <FormField label="종목명">
      <div className="relative">
        <FormInput
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && active >= 0 ? `${listId}-opt-${active}` : undefined
          }
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 150)
          }}
          onKeyDown={handleKeyDown}
          placeholder="예) 삼성전자, 애플, TSLA"
        />

        {showList && (
          <ul
            id={listId}
            role="listbox"
            aria-label="종목 검색 결과"
            className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-lg"
          >
            {isFetching && results.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">검색 중...</li>
            ) : results.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                결과가 없습니다. 종목명을 직접 입력하세요.
              </li>
            ) : (
              results.map((item, index) => (
                <li
                  key={item.symbol}
                  id={`${listId}-opt-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    if (blurTimer.current) clearTimeout(blurTimer.current)
                    pick(item)
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${
                    index === active ? 'bg-accent text-accent-foreground' : 'text-foreground'
                  }`}
                >
                  <span className="truncate">{item.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                    {item.symbol} · {marketLabel(item)}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </FormField>
  )
}
