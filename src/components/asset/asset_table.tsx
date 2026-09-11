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
import { ASSET_TYPE_META } from '@/constants/asset_type'
import type { Asset } from '@/types/asset'
import { ChevronDown, ChevronUp, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import AssetModal from '@/components/asset/asset_modal'
import TablePagination from '@/components/common/table_pagination'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 10

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
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.category}</span>,
    },
    {
      accessorKey: 'owner',
      header: '소유자',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.owner}</span>,
    },
    {
      accessorKey: 'type',
      header: '유형',
      cell: ({ row }) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${ASSET_TYPE_META[row.original.type]?.badgeClass ?? 'bg-muted text-muted-foreground'}`}
        >
          {formatAssetType(row.original.type)}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: () => <span className="block text-right font-medium">금액</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1 font-medium text-foreground">
          {row.original.linkedToInvestment && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => handleSync(row.original.id)}
              disabled={syncAsset.isPending && syncAsset.variables === row.original.id}
              title="투자 종목 평가금액 합계로 자산 금액 동기화"
            >
              <RefreshCw
                size={13}
                className={
                  syncAsset.isPending && syncAsset.variables === row.original.id
                    ? 'animate-spin'
                    : ''
                }
              />
            </Button>
          )}
          {formatAmount(row.original.amount)}
        </div>
      ),
    },
    {
      accessorKey: 'monthlyPayment',
      header: () => <span className="block text-right font-medium">월 납입금</span>,
      cell: ({ row }) => (
        <span className="block text-right text-muted-foreground">
          {row.original.monthlyPayment ? formatAmount(row.original.monthlyPayment) : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'paymentDay',
      header: '납입일',
      cell: ({ row }) => (
        <span className="block text-center text-muted-foreground">
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
            <span className="text-success">●</span>
          ) : (
            <span className="text-border">●</span>
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
            <Button variant="ghost" size="icon-sm" onClick={() => handleMoveUp(row.original, index)} disabled={isFirst} title="위로 이동">
              <ChevronUp size={15} />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => handleMoveDown(row.original, index)} disabled={isLast} title="아래로 이동">
              <ChevronDown size={15} />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(row.original)} title="수정">
              <Pencil size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleDelete(row.original.id)}
              title="삭제"
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 size={14} />
            </Button>
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
    <div className="p-2">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">자산 목록</h1>
          <p className="text-sm text-muted-foreground">총 {totalElements}개</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => syncAllAssets.mutate()}
            disabled={syncAllAssets.isPending}
          >
            <RefreshCw size={14} className={syncAllAssets.isPending ? 'animate-spin' : ''} />
            동기화
          </Button>
          <Button onClick={() => setModalOpen(true)}>+ 자산 등록</Button>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
          등록된 자산이 없습니다
        </div>
      ) : (
        <>
          {/* 모바일 카드 */}
          <div className="space-y-3 md:hidden">
            {assets.map((asset, index) => (
              <div key={asset.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{asset.category}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{asset.owner}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${ASSET_TYPE_META[asset.type]?.badgeClass ?? 'bg-muted text-muted-foreground'}`}
                  >
                    {formatAssetType(asset.type)}
                  </span>
                </div>
                <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">금액</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-foreground">{formatAmount(asset.amount)}</p>
                      {asset.linkedToInvestment && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleSync(asset.id)}
                          disabled={syncAsset.isPending && syncAsset.variables === asset.id}
                        >
                          <RefreshCw
                            size={12}
                            className={syncAsset.isPending && syncAsset.variables === asset.id ? 'animate-spin' : ''}
                          />
                        </Button>
                      )}
                    </div>
                  </div>
                  {asset.monthlyPayment && (
                    <div>
                      <p className="text-xs text-muted-foreground">월 납입금</p>
                      <p className="text-muted-foreground">{formatAmount(asset.monthlyPayment)}</p>
                    </div>
                  )}
                  {asset.paymentDay && (
                    <div>
                      <p className="text-xs text-muted-foreground">납입일</p>
                      <p className="text-muted-foreground">매달 {asset.paymentDay}일</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">투자연동</p>
                    <p>
                      {asset.linkedToInvestment ? (
                        <span className="text-success">●</span>
                      ) : (
                        <span className="text-border">●</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 border-t border-border pt-3">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleMoveUp(asset, index)} disabled={index === 0 && page === 0}>
                    <ChevronUp size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleMoveDown(asset, index)} disabled={index === assets.length - 1 && page === totalPages - 1}>
                    <ChevronDown size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleEdit(asset)}>
                    <Pencil size={13} />
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(asset.id)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* 데스크탑 테이블 */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs text-muted-foreground">
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
              <tbody className="divide-y divide-border">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-muted/50">
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
