'use client'

import { useState } from 'react'
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import {
  useDeleteAsset,
  useGetAssets,
  useReorderAsset,
  useSyncAllAssets,
  useSyncAsset,
} from '@/queries/asset'
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
  const syncAsset = useSyncAsset()
  const syncAllAssets = useSyncAllAssets()
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

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: 'category',
      header: '카테고리',
      cell: ({ row }) => <span className="font-medium text-gray-800">{row.original.category}</span>,
    },
    {
      accessorKey: 'owner',
      header: '소유자',
      cell: ({ row }) => <span className="text-gray-600">{row.original.owner}</span>,
    },
    {
      accessorKey: 'type',
      header: '유형',
      cell: ({ row }) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLE[row.original.type] ?? 'bg-gray-100 text-gray-600'}`}
        >
          {formatAssetType(row.original.type)}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: () => <span className="block text-right font-medium">금액</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1 font-medium text-gray-800">
          {row.original.linkedToInvestment && (
            <button
              onClick={() => handleSync(row.original.id)}
              disabled={syncAsset.isPending && syncAsset.variables === row.original.id}
              title="투자 종목 평가금액 합계로 자산 금액 동기화"
              className="text-gray-300 transition-colors hover:text-blue-500 disabled:opacity-40"
            >
              <RefreshCw
                size={13}
                className={
                  syncAsset.isPending && syncAsset.variables === row.original.id
                    ? 'animate-spin'
                    : ''
                }
              />
            </button>
          )}
          {formatAmount(row.original.amount)}
        </div>
      ),
    },
    {
      accessorKey: 'monthlyPayment',
      header: () => <span className="block text-right font-medium">월 납입금</span>,
      cell: ({ row }) => (
        <span className="block text-right text-gray-500">
          {row.original.monthlyPayment ? formatAmount(row.original.monthlyPayment) : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'paymentDay',
      header: '납입일',
      cell: ({ row }) => (
        <span className="block text-center text-gray-500">
          {row.original.paymentDay ? `${row.original.paymentDay}일` : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'linkedToInvestment',
      header: '투자연동',
      cell: ({ row }) => (
        <span className="block text-center">
          {row.original.linkedToInvestment ? (
            <span className="text-green-500">●</span>
          ) : (
            <span className="text-gray-200">●</span>
          )}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '관리',
      cell: ({ row }) => {
        const index = row.index
        const isFirst = index === 0 && page === 0
        const isLast = index === assets.length - 1 && page === totalPages - 1
        return (
          <div className="flex items-center justify-center gap-0.5">
            <button
              onClick={() => handleMoveUp(row.original, index)}
              disabled={isFirst}
              className="rounded p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
              title="위로 이동"
            >
              <ChevronUp size={15} />
            </button>
            <button
              onClick={() => handleMoveDown(row.original, index)}
              disabled={isLast}
              className="rounded p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
              title="아래로 이동"
            >
              <ChevronDown size={15} />
            </button>
            <button
              onClick={() => handleEdit(row.original)}
              className="rounded p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-blue-500"
              title="수정"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              className="rounded p-1 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
              title="삭제"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: assets,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => syncAllAssets.mutate()}
            disabled={syncAllAssets.isPending}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncAllAssets.isPending ? 'animate-spin' : ''} />
            동기화
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            + 자산 등록
          </button>
        </div>
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
                          disabled={syncAsset.isPending && syncAsset.variables === asset.id}
                          className="text-gray-300 hover:text-blue-500 disabled:opacity-40"
                        >
                          <RefreshCw
                            size={12}
                            className={
                              syncAsset.isPending && syncAsset.variables === asset.id
                                ? 'animate-spin'
                                : ''
                            }
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
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3 text-left font-medium">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-50">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-gray-50/50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
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
