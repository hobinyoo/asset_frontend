'use client'

import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useAllInvestments } from '@/queries/investment'
import type { Investment } from '@/types/investment'
import { formatAmount } from '@/utils/format'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

// 한국 주식시장 관례: 상승=빨강, 하락=파랑
const plClass = (n: number) => (n >= 0 ? 'text-red-500' : 'text-blue-500')
const withPercentSign = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
const withAmountSign = (n: number) => `${n >= 0 ? '+' : ''}${formatAmount(n)}`

function SortableHeader({
  column,
  label,
  align = 'left',
}: {
  column: Column<Investment, unknown>
  label: string
  align?: 'left' | 'right'
}) {
  const sorted = column.getIsSorted()
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={`flex w-full items-center gap-1 text-xs font-medium text-muted-foreground ${
        align === 'right' ? 'justify-end' : ''
      }`}
    >
      {label}
      {sorted === 'asc' ? (
        <ChevronUp size={12} />
      ) : sorted === 'desc' ? (
        <ChevronDown size={12} />
      ) : (
        <ChevronsUpDown size={12} className="text-muted-foreground/40" />
      )}
    </button>
  )
}

export default function InvestmentDetailTable() {
  const { data: investments = [], isPending, isError } = useAllInvestments()
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<Investment>[] = [
    {
      accessorKey: 'stockName',
      header: ({ column }) => <SortableHeader column={column} label="종목명" />,
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.stockName}</span>
      ),
    },
    {
      accessorKey: 'owner',
      header: ({ column }) => <SortableHeader column={column} label="소유주" />,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.owner}</span>,
    },
    {
      accessorKey: 'evaluationAmount',
      header: ({ column }) => <SortableHeader column={column} label="평가금액" align="right" />,
      cell: ({ row }) => (
        <span className="block text-right font-medium text-foreground">
          {row.original.evaluationAmount != null ? formatAmount(row.original.evaluationAmount) : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'profitRate',
      header: ({ column }) => <SortableHeader column={column} label="수익률" align="right" />,
      cell: ({ row }) => {
        const v = row.original.profitRate
        return (
          <span
            className={`block text-right font-medium ${v != null ? plClass(v) : 'text-muted-foreground'}`}
          >
            {v != null ? withPercentSign(v) : '-'}
          </span>
        )
      },
    },
    {
      accessorKey: 'changeRate',
      header: ({ column }) => <SortableHeader column={column} label="등락률" align="right" />,
      cell: ({ row }) => {
        const v = row.original.changeRate
        return (
          <span className={`block text-right ${v != null ? plClass(v) : 'text-muted-foreground'}`}>
            {v != null ? withPercentSign(v) : '-'}
          </span>
        )
      },
    },
    {
      accessorKey: 'purchasePrice',
      header: ({ column }) => <SortableHeader column={column} label="매입단가" align="right" />,
      cell: ({ row }) => (
        <span className="block text-right text-muted-foreground">
          {row.original.purchasePrice != null ? formatAmount(row.original.purchasePrice) : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => <SortableHeader column={column} label="보유수량" align="right" />,
      cell: ({ row }) => (
        <span className="block text-right text-muted-foreground">
          {row.original.quantity != null ? `${row.original.quantity.toLocaleString()}주` : '-'}
        </span>
      ),
    },
    {
      id: 'profit',
      accessorFn: (row) =>
        row.evaluationAmount != null && row.purchaseAmount != null
          ? row.evaluationAmount - row.purchaseAmount
          : null,
      header: ({ column }) => <SortableHeader column={column} label="평가손익" align="right" />,
      cell: ({ getValue }) => {
        const v = getValue<number | null>()
        return (
          <span
            className={`block text-right font-medium ${v != null ? plClass(v) : 'text-muted-foreground'}`}
          >
            {v != null ? withAmountSign(v) : '-'}
          </span>
        )
      },
    },
  ]

  const table = useReactTable({
    data: investments,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-foreground">투자상세</h1>

      {isPending ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          로딩 중...
        </div>
      ) : isError ? (
        <div className="flex h-40 items-center justify-center text-sm text-destructive">
          에러가 발생했습니다.
        </div>
      ) : investments.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
          보유 종목이 없습니다
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-3 py-2 text-left">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
