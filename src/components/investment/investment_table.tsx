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

const PAGE_SIZE = 10

const getCategoryColor = (category: string, categoryItems: { value: string }[]) => {
  const idx = categoryItems.findIndex((item) => item.value === category)
  return CATEGORY_COLORS[(idx >= 0 ? idx : 0) % CATEGORY_COLORS.length]
}

function ProfitBadge({ rate }: { rate: number | null }) {
  if (rate === null) return <span className="text-gray-300">-</span>
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
  if (!evaluationAmount || !purchaseAmount) return <span className="text-gray-300">-</span>
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
      <div className="flex h-40 items-center justify-center text-sm text-gray-400">로딩 중...</div>
    )
  }
  if (isError) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-red-400">
        에러가 발생했습니다.
      </div>
    )
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">투자 종목</h1>
          <p className="text-sm text-gray-400">총 {data?.totalElements ?? 0}개</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          + 종목 등록
        </button>
      </div>

      {/* 필터 */}
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 outline-none focus:border-blue-400"
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
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 outline-none focus:border-blue-400"
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
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 outline-none focus:border-blue-400"
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
          <button
            onClick={() => {
              setFilters({})
              setPage(0)
            }}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-50"
          >
            초기화
          </button>
        )}
      </div>

      {investments.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
          등록된 종목이 없습니다
        </div>
      ) : (
        <>
          {/* 모바일 카드 */}
          <div className="space-y-3 md:hidden">
            {investments.map((inv) => (
              <div
                key={inv.id}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      {inv.stockName}
                      {inv.ticker && (
                        <span className="ml-1 text-xs text-gray-400">({inv.ticker})</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
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
                      <p className="text-xs text-gray-400">매수금액</p>
                      <p className="text-gray-600">{formatAmount(inv.purchaseAmount)}</p>
                    </div>
                  )}
                  {inv.evaluationAmount && (
                    <div>
                      <p className="text-xs text-gray-400">평가금액</p>
                      <p className="font-medium text-gray-800">
                        {formatAmount(inv.evaluationAmount)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400">수익률</p>
                    <ProfitBadge rate={inv.profitRate} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">평가손익</p>
                    <ProfitAmount
                      evaluationAmount={inv.evaluationAmount}
                      purchaseAmount={inv.purchaseAmount}
                    />
                  </div>
                  {inv.quantity && (
                    <div>
                      <p className="text-xs text-gray-400">수량</p>
                      <p className="text-gray-600">{inv.quantity}주</p>
                    </div>
                  )}
                  {inv.purchasePrice && (
                    <div>
                      <p className="text-xs text-gray-400">매수단가</p>
                      <p className="text-gray-600">{formatAmount(inv.purchasePrice)}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 border-t border-gray-50 pt-3">
                  <button
                    onClick={() => handleEdit(inv)}
                    className="flex-1 rounded-md py-1.5 text-xs text-gray-500 hover:bg-gray-100 flex items-center justify-center gap-1"
                  >
                    <Pencil size={12} />
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(inv.id)}
                    className="flex-1 rounded-md py-1.5 text-xs text-red-400 hover:bg-red-50 flex items-center justify-center gap-1"
                  >
                    <Trash2 size={12} />
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 데스크탑 테이블 */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500">
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
                <tbody className="divide-y divide-gray-50">
                  {investments.map((inv) => (
                    <tr key={inv.id} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-600">{inv.account}</td>
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
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {inv.stockName}
                        {inv.ticker && (
                          <span className="ml-1 text-xs text-gray-400">({inv.ticker})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{inv.owner}</td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {inv.purchasePrice ? formatAmount(inv.purchasePrice) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {inv.quantity ? `${inv.quantity}주` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {inv.purchaseAmount ? formatAmount(inv.purchaseAmount) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">
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
                          <button
                            onClick={() => handleEdit(inv)}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(inv.id)}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
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
