'use client'

import { useState } from 'react'
import { useDeleteInvestment, useGetInvestments } from '@/queries/investment'
import { useGetLinkedAssets } from '@/queries/asset'
import { useInvestmentCategories, useAssetOwners } from '@/queries/config'
import { formatAmount } from '@/utils/format'
import type { Investment } from '@/types/investment'
import InvestmentModal from '@/components/investment/investment_modal'
import TablePagination from '@/components/common/table_pagination'
import { Pencil, Trash2 } from 'lucide-react'
import { CATEGORY_COLORS } from '@/constants/options'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 10

const getCategoryColor = (category: string, categoryItems: { value: string }[]) => {
  const idx = categoryItems.findIndex((item) => item.value === category)
  return CATEGORY_COLORS[(idx >= 0 ? idx : 0) % CATEGORY_COLORS.length]
}

// 한국 주식시장 관례: 상승=빨강, 하락=파랑 — 의도적 설계, 변경 금지
function ProfitBadge({ rate }: { rate: number | null }) {
  if (rate === null) return <span className="text-border">-</span>
  const isPlus = rate >= 0
  return (
    <span className={`font-medium ${isPlus ? 'text-red-500' : 'text-blue-500'}`}>
      {isPlus ? '+' : ''}
      {rate.toFixed(2)}%
    </span>
  )
}

function ProfitAmount({
  evaluationAmount,
  purchaseAmount,
}: {
  evaluationAmount: number | null
  purchaseAmount: number | null
}) {
  if (!evaluationAmount || !purchaseAmount) return <span className="text-border">-</span>
  const diff = evaluationAmount - purchaseAmount
  const isPlus = diff >= 0
  return (
    <span className={`font-medium ${isPlus ? 'text-red-500' : 'text-blue-500'}`}>
      {isPlus ? '+' : ''}
      {formatAmount(diff)}
    </span>
  )
}

export default function InvestmentTable() {
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<{
    owner?: string
    category?: string
    assetId?: number
  }>({})

  const { data, isPending, isError } = useGetInvestments({ ...filters, page, size: PAGE_SIZE })
  const { data: linkedAssets = [] } = useGetLinkedAssets()
  const { data: categoryItems = [] } = useInvestmentCategories()
  const { data: ownerItems = [] } = useAssetOwners()
  const deleteInvestment = useDeleteInvestment()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Investment | undefined>()

  const investments = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const handleEdit = (investment: Investment) => {
    setEditTarget(investment)
    setModalOpen(true)
  }
  const handleDelete = (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    deleteInvestment.mutate(id)
  }
  const handleClose = () => {
    setModalOpen(false)
    setEditTarget(undefined)
  }

  const handleFilterChange = (key: string, value: string | number) => {
    setPage(0)
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }))
  }

  if (isPending) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">로딩 중...</div>
    )
  }
  if (isError) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-destructive">
        에러가 발생했습니다.
      </div>
    )
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">투자 종목</h1>
          <p className="text-sm text-muted-foreground">총 {data?.totalElements ?? 0}개</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ 종목 등록</Button>
      </div>

      {/* 필터 */}
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground outline-none focus:border-primary bg-background"
          value={filters.assetId ?? ''}
          onChange={(e) => handleFilterChange('assetId', Number(e.target.value))}
        >
          <option value="">전체 계좌</option>
          {linkedAssets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.category} ({asset.owner})
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground outline-none focus:border-primary bg-background"
          value={filters.category ?? ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">전체 카테고리</option>
          {categoryItems.map((item) => (
            <option key={item.id} value={item.value}>
              {item.value}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground outline-none focus:border-primary bg-background"
          value={filters.owner ?? ''}
          onChange={(e) => handleFilterChange('owner', e.target.value)}
        >
          <option value="">전체 소유자</option>
          {ownerItems.map((item) => (
            <option key={item.id} value={item.value}>
              {item.value}
            </option>
          ))}
        </select>

        {(filters.assetId || filters.category || filters.owner) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilters({})
              setPage(0)
            }}
          >
            초기화
          </Button>
        )}
      </div>

      {investments.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
          등록된 종목이 없습니다
        </div>
      ) : (
        <>
          {/* 모바일 카드 */}
          <div className="space-y-3 md:hidden">
            {investments.map((inv) => (
              <div
                key={inv.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {inv.stockName}
                      {inv.ticker && (
                        <span className="ml-1 text-xs text-muted-foreground">({inv.ticker})</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {inv.account} · {inv.owner}
                    </p>
                  </div>
                  <span
                    className="inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${getCategoryColor(inv.category, categoryItems)}22`,
                      color: getCategoryColor(inv.category, categoryItems),
                    }}
                  >
                    {inv.category}
                  </span>
                </div>
                <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {inv.purchaseAmount && (
                    <div>
                      <p className="text-xs text-muted-foreground">매수금액</p>
                      <p className="text-muted-foreground">{formatAmount(inv.purchaseAmount)}</p>
                    </div>
                  )}
                  {inv.evaluationAmount && (
                    <div>
                      <p className="text-xs text-muted-foreground">평가금액</p>
                      <p className="font-medium text-foreground">
                        {formatAmount(inv.evaluationAmount)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">수익률</p>
                    <ProfitBadge rate={inv.profitRate} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">평가손익</p>
                    <ProfitAmount
                      evaluationAmount={inv.evaluationAmount}
                      purchaseAmount={inv.purchaseAmount}
                    />
                  </div>
                  {inv.quantity && (
                    <div>
                      <p className="text-xs text-muted-foreground">수량</p>
                      <p className="text-muted-foreground">{inv.quantity}주</p>
                    </div>
                  )}
                  {inv.purchasePrice && (
                    <div>
                      <p className="text-xs text-muted-foreground">매수단가</p>
                      <p className="text-muted-foreground">{formatAmount(inv.purchasePrice)}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 border-t border-border pt-3">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleEdit(inv)}>
                    <Pencil size={12} />
                    수정
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(inv.id)}>
                    <Trash2 size={12} />
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* 데스크탑 테이블 */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap text-sm">
                <thead className="bg-muted text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">계좌</th>
                    <th className="px-4 py-3 text-left font-medium">카테고리</th>
                    <th className="px-4 py-3 text-left font-medium">종목명</th>
                    <th className="px-4 py-3 text-left font-medium">명의</th>
                    <th className="px-4 py-3 text-right font-medium">매수단가</th>
                    <th className="px-4 py-3 text-right font-medium">수량</th>
                    <th className="px-4 py-3 text-right font-medium">매수금액</th>
                    <th className="px-4 py-3 text-right font-medium">평가금액</th>
                    <th className="px-4 py-3 text-right font-medium">수익률</th>
                    <th className="px-4 py-3 text-right font-medium">평가손익</th>
                    <th className="px-4 py-3 text-center font-medium">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {investments.map((inv) => (
                    <tr key={inv.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3 text-muted-foreground">{inv.account}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: `${getCategoryColor(inv.category, categoryItems)}22`,
                            color: getCategoryColor(inv.category, categoryItems),
                          }}
                        >
                          {inv.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {inv.stockName}
                        {inv.ticker && (
                          <span className="ml-1 text-xs text-muted-foreground">({inv.ticker})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.owner}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {inv.purchasePrice ? formatAmount(inv.purchasePrice) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {inv.quantity ? `${inv.quantity}주` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {inv.purchaseAmount ? formatAmount(inv.purchaseAmount) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {inv.evaluationAmount ? formatAmount(inv.evaluationAmount) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ProfitBadge rate={inv.profitRate} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ProfitAmount
                          evaluationAmount={inv.evaluationAmount}
                          purchaseAmount={inv.purchaseAmount}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(inv)} title="수정">
                            <Pencil size={14} />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(inv.id)} title="삭제" className="hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {modalOpen && <InvestmentModal investment={editTarget} onClose={handleClose} />}
    </div>
  )
}
