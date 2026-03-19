'use client'

import { useState } from 'react'
import { useDeleteAsset, useGetAssets, useReorderAsset } from '@/queries/asset'
import { useSyncAssetAmount } from '@/queries/investment'
import { formatAmount, formatAssetType } from '@/utils/format'
import type { Asset } from '@/types/asset'
import { ChevronDown, ChevronUp, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import AssetModal from '@/components/asset/asset_modal'
import TablePagination from '@/components/common/table_pagination'

const PAGE_SIZE = 10

const TYPE_STYLE: Record<string, string> = {
  HOUSING: 'bg-blue-50 text-blue-600',
  SAVINGS: 'bg-orange-50 text-orange-600',
  RETIREMENT: 'bg-green-50 text-green-600',
  INVESTMENT: 'bg-cyan-50 text-cyan-600',
}

export default function AssetTable() {
  const [page, setPage] = useState(0)
  const { data, isPending, isError } = useGetAssets(page, PAGE_SIZE)

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

  const handleMoveUp = (asset: Asset, index: number) => {
    if (index === 0 && page === 0) return
    const currentPosition = page * PAGE_SIZE + index + 1
    reorderAsset.mutate({ id: asset.id, targetPosition: currentPosition - 1 })
  }

  const handleMoveDown = (asset: Asset, index: number) => {
    if (index === assets.length - 1 && page === totalPages - 1) return
    const currentPosition = page * PAGE_SIZE + index + 1
    reorderAsset.mutate({ id: asset.id, targetPosition: currentPosition + 1 })
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
    <div className="p-2">
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
                      {asset.linkedToInvestment && (
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
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLE[asset.type] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {formatAssetType(asset.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      <div className="flex items-center justify-end gap-1">
                        {asset.linkedToInvestment && (
                          <button
                            onClick={() => handleSync(asset.id)}
                            disabled={syncAsset.isPending}
                            title="투자 종목 평가금액 합계로 자산 금액 동기화"
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
                        <button
                          onClick={() => handleMoveUp(asset, index)}
                          disabled={index === 0 && page === 0}
                          className="rounded p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                          title="위로 이동"
                        >
                          <ChevronUp size={15} />
                        </button>
                        <button
                          onClick={() => handleMoveDown(asset, index)}
                          disabled={index === assets.length - 1 && page === totalPages - 1}
                          className="rounded p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                          title="아래로 이동"
                        >
                          <ChevronDown size={15} />
                        </button>
                        <button
                          onClick={() => handleEdit(asset)}
                          className="rounded p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-blue-500"
                          title="수정"
                        >
                          <Pencil size={14} />
                        </button>
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

          <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {modalOpen && <AssetModal asset={editTarget} onClose={handleClose} />}
    </div>
  )
}
