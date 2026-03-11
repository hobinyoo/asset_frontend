'use client'

import { useState } from 'react'
import { useDeleteAsset, useGetAssets, useGetAssetSummary, useReorderAsset } from '@/queries/asset'
import { useSyncAssetAmount } from '@/queries/investment'
import { formatAmount, formatAssetType } from '@/utils/format'
import type { Asset } from '@/types/asset'
import { ChevronDown, ChevronUp, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import AssetModal from '@/components/asset/asset_modal'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const PAGE_SIZE = 10

const TYPE_STYLE: Record<string, string> = {
  FIXED: 'bg-orange-50 text-orange-600',
  REGULAR: 'bg-blue-50 text-blue-600',
  VARIABLE: 'bg-purple-50 text-purple-600',
}

export default function AssetTable() {
  const [page, setPage] = useState(0)
  const { data, isPending, isError } = useGetAssets(page, PAGE_SIZE)
  const { data: summary } = useGetAssetSummary()
  const deleteAsset = useDeleteAsset()
  const syncAsset = useSyncAssetAmount()
  const reorderAsset = useReorderAsset()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Asset | undefined>()

  const assets = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  const handleEdit = (asset: Asset) => {
    setEditTarget(asset)
    setModalOpen(true)
  }
  const handleDelete = (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    deleteAsset.mutate(id)
  }
  const handleClose = () => {
    setModalOpen(false)
    setEditTarget(undefined)
  }
  const handleSync = (assetId: number) => {
    syncAsset.mutate(assetId)
  }

  // 위로 이동: 현재 페이지 내 index 기준으로 sortOrder 계산
  const handleMoveUp = (asset: Asset, index: number) => {
    if (index === 0 && page === 0) return // 맨 첫번째면 이동 불가
    const currentPosition = page * PAGE_SIZE + index + 1
    reorderAsset.mutate({ id: asset.id, targetPosition: currentPosition - 1 })
  }

  // 아래로 이동
  const handleMoveDown = (asset: Asset, index: number) => {
    if (index === assets.length - 1 && page === totalPages - 1) return // 맨 마지막이면 이동 불가
    const currentPosition = page * PAGE_SIZE + index + 1
    reorderAsset.mutate({ id: asset.id, targetPosition: currentPosition + 1 })
  }

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i)
    }
    pages.push(0)
    if (page > 3) pages.push('ellipsis')
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 4) pages.push('ellipsis')
    pages.push(totalPages - 1)
    return pages
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
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">자산 목록</h1>
          <p className="text-sm text-gray-400">총 {totalElements}개</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          + 자산 등록
        </button>
      </div>
      {/* 요약 카드 */}
      {assets.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs text-blue-400">총 자산</p>
            <p className="mt-1 text-lg font-bold text-blue-600">
              {formatAmount(summary?.totalAmount ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50 p-4">
            <p className="text-xs text-green-400">월 납입 합계</p>
            <p className="mt-1 text-lg font-bold text-green-600">
              {formatAmount(summary?.totalMonthlyPayment ?? 0)}
            </p>
          </div>
        </div>
      )}
      {assets.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
          등록된 자산이 없습니다
        </div>
      ) : (
        <>
          {/* 모바일 카드 */}
          <div className="space-y-3 md:hidden">
            {assets.map((asset, index) => (
              <div
                key={asset.id}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{asset.category}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{asset.owner}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLE[asset.type] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {formatAssetType(asset.type)}
                  </span>
                </div>
                <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">금액</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-gray-800">{formatAmount(asset.amount)}</p>
                      {asset.type === 'VARIABLE' && (
                        <button
                          onClick={() => handleSync(asset.id)}
                          disabled={syncAsset.isPending}
                          className="text-gray-300 hover:text-blue-500 disabled:opacity-40"
                        >
                          <RefreshCw
                            size={12}
                            className={syncAsset.isPending ? 'animate-spin' : ''}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                  {asset.monthlyPayment && (
                    <div>
                      <p className="text-xs text-gray-400">월 납입금</p>
                      <p className="text-gray-600">{formatAmount(asset.monthlyPayment)}</p>
                    </div>
                  )}
                  {asset.paymentDay && (
                    <div>
                      <p className="text-xs text-gray-400">납입일</p>
                      <p className="text-gray-600">매달 {asset.paymentDay}일</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400">투자연동</p>
                    <p>
                      {asset.linkedToInvestment ? (
                        <span className="text-green-500">●</span>
                      ) : (
                        <span className="text-gray-200">●</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 border-t border-gray-50 pt-3">
                  <button
                    onClick={() => handleMoveUp(asset, index)}
                    disabled={index === 0 && page === 0}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => handleMoveDown(asset, index)}
                    disabled={index === assets.length - 1 && page === totalPages - 1}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => handleEdit(asset)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs text-gray-500 hover:bg-gray-100"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs text-red-400 hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 데스크탑 테이블 */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm md:block">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">카테고리</th>
                  <th className="px-4 py-3 text-left font-medium">소유자</th>
                  <th className="px-4 py-3 text-left font-medium">유형</th>
                  <th className="px-4 py-3 text-right font-medium">금액</th>
                  <th className="px-4 py-3 text-right font-medium">월 납입금</th>
                  <th className="px-4 py-3 text-center font-medium">납입일</th>
                  <th className="px-4 py-3 text-center font-medium">투자연동</th>
                  <th className="px-4 py-3 text-center font-medium">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assets.map((asset, index) => (
                  <tr key={asset.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{asset.category}</td>
                    <td className="px-4 py-3 text-gray-600">{asset.owner}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full ${TYPE_STYLE[asset.type]} px-2 py-0.5 text-xs font-medium`}
                      >
                        {formatAssetType(asset.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      <div className="flex items-center justify-end gap-1">
                        {asset.type === 'VARIABLE' && (
                          <button
                            onClick={() => handleSync(asset.id)}
                            disabled={syncAsset.isPending}
                            className="text-gray-300 transition-colors hover:text-blue-500 disabled:opacity-40"
                          >
                            <RefreshCw
                              size={13}
                              className={syncAsset.isPending ? 'animate-spin' : ''}
                            />
                          </button>
                        )}
                        {formatAmount(asset.amount)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {asset.monthlyPayment ? formatAmount(asset.monthlyPayment) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {asset.paymentDay ? `${asset.paymentDay}일` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {asset.linkedToInvestment ? (
                        <span className="text-green-500">●</span>
                      ) : (
                        <span className="text-gray-200">●</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        {/* 위로 */}
                        <button
                          onClick={() => handleMoveUp(asset, index)}
                          disabled={index === 0 && page === 0}
                          className="rounded p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                          title="위로 이동"
                        >
                          <ChevronUp size={15} />
                        </button>
                        {/* 아래로 */}
                        <button
                          onClick={() => handleMoveDown(asset, index)}
                          disabled={index === assets.length - 1 && page === totalPages - 1}
                          className="rounded p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                          title="아래로 이동"
                        >
                          <ChevronDown size={15} />
                        </button>
                        {/* 수정 */}
                        <button
                          onClick={() => handleEdit(asset)}
                          className="rounded p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-blue-500"
                          title="수정"
                        >
                          <Pencil size={14} />
                        </button>
                        {/* 삭제 */}
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="rounded p-1 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
                          title="삭제"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      aria-disabled={page === 0}
                      className={page === 0 ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {getPageNumbers().map((p, i) =>
                    p === 'ellipsis' ? (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={p === page}
                          onClick={() => setPage(p)}
                          className="cursor-pointer"
                        >
                          {p + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      aria-disabled={page === totalPages - 1}
                      className={
                        page === totalPages - 1
                          ? 'pointer-events-none opacity-40'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {modalOpen && <AssetModal asset={editTarget} onClose={handleClose} />}
    </div>
  )
}
