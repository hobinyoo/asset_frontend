'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useGetLinkedAssets } from '@/queries/asset'
import { getOwnerColor } from '@/utils/color'
import InvestmentAccountCard from '@/components/investment/account/investment_account_card'

const ORDER_KEY = 'investment-account-order'

const readOrder = (): number[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ORDER_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : []
  } catch {
    return []
  }
}

const writeOrder = (ids: number[]) => {
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(ids))
  } catch {
    /* 저장 실패는 무시 (프라이빗 모드 등) */
  }
}

export default function InvestmentAccountGrid() {
  const { data: linkedAssets = [], isPending } = useGetLinkedAssets()
  const [order, setOrder] = useState<number[]>([])
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null)

  useEffect(() => {
    // localStorage 는 클라이언트에서만 — 마운트 후 1회 로드
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(readOrder())
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const ownerById = useMemo(
    () => new Map(linkedAssets.map((a) => [a.id, a.owner])),
    [linkedAssets],
  )
  const owners = useMemo(
    () => Array.from(new Set(linkedAssets.map((a) => a.owner))).sort(),
    [linkedAssets],
  )

  // 저장된 순서 우선 → 나머지(신규 계좌)는 뒤에 붙임
  const orderedIds = useMemo(() => {
    const ids = linkedAssets.map((a) => a.id)
    const known = order.filter((id) => ids.includes(id))
    const rest = ids.filter((id) => !known.includes(id))
    return [...known, ...rest]
  }, [linkedAssets, order])

  const visibleIds = useMemo(
    () => (ownerFilter ? orderedIds.filter((id) => ownerById.get(id) === ownerFilter) : orderedIds),
    [orderedIds, ownerFilter, ownerById],
  )

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = orderedIds.indexOf(Number(active.id))
    const newIndex = orderedIds.indexOf(Number(over.id))
    const next = arrayMove(orderedIds, oldIndex, newIndex)
    setOrder(next)
    writeOrder(next)
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-foreground">투자 구성</h1>
        <p className="text-sm text-muted-foreground">
          계좌별 카드 · 드래그로 순서 변경 · 카드를 눌러 보유 종목 확인
        </p>
      </div>

      {owners.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOwnerFilter(null)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              ownerFilter === null
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            전체
          </button>
          {owners.map((o) => {
            const color = getOwnerColor(o)
            const active = ownerFilter === o
            return (
              <button
                key={o}
                type="button"
                onClick={() => setOwnerFilter(active ? null : o)}
                className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                style={
                  active
                    ? { backgroundColor: color, borderColor: color, color: 'white' }
                    : { borderColor: `${color}55`, color }
                }
              >
                {o}
              </button>
            )
          })}
        </div>
      )}

      {isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border border-border bg-muted/40" />
          ))}
        </div>
      ) : visibleIds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          {ownerFilter
            ? '해당 소유자의 투자 계좌가 없습니다.'
            : '투자 연동된 자산이 없습니다. 자산 등록 시 "투자 연동"을 체크하면 계좌가 생기고, 그 계좌 카드에서 종목을 등록할 수 있습니다.'}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visibleIds} strategy={rectSortingStrategy}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibleIds.map((id) => (
                <InvestmentAccountCard key={id} assetId={id} owner={ownerById.get(id) ?? ''} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
