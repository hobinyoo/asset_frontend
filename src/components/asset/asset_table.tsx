'use client'

import { useState } from 'react'
import { useDeleteAsset, useGetAssets } from '@/queries/asset'
import { formatAmount, formatAssetType } from '@/utils/format'
import type { Asset } from '@/types/asset'
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

export default function AssetTable() {
  const [page, setPage] = useState(0) // Spring은 0-based
  const { data, isPending, isError } = useGetAssets(page, PAGE_SIZE)
  const deleteAsset = useDeleteAsset()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Asset | undefined>()

  const assets = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

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
          <p className="text-sm text-gray-400">총 {data?.totalElements ?? 0}개</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          + 자산 등록
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
          등록된 자산이 없습니다
        </div>
      ) : (
        <>
          {/* 모바일 카드 */}
          <div className="space-y-3 md:hidden">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{asset.category}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{asset.owner}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                    {formatAssetType(asset.type)}
                  </span>
                </div>
                <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">금액</p>
                    <p className="font-medium text-gray-800">{formatAmount(asset.amount)}</p>
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
                    onClick={() => handleEdit(asset)}
                    className="flex-1 rounded-md py-1.5 text-xs text-gray-500 hover:bg-gray-100"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="flex-1 rounded-md py-1.5 text-xs text-red-400 hover:bg-red-50"
                  >
                    삭제
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
                {assets.map((asset) => (
                  <tr key={asset.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{asset.category}</td>
                    <td className="px-4 py-3 text-gray-600">{asset.owner}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                        {formatAssetType(asset.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {formatAmount(asset.amount)}
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
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleEdit(asset)}
                          className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="rounded-md px-2 py-1 text-xs text-red-400 hover:bg-red-50"
                        >
                          삭제
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
