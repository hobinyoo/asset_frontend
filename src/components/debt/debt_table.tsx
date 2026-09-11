'use client'

import { useState } from 'react'
import { useDeleteDebt, useGetDebts, useGetDebtsSummary } from '@/queries/debt'
import { formatAmount, formatDebtType } from '@/utils/format'
import { DEBT_TYPE_META } from '@/constants/debt_type'
import type { Debt } from '@/types/debt'
import DebtModal from '@/components/debt/debt_modal'
import TablePagination from '@/components/common/table_pagination'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 10

export default function DebtTable() {
  const [page, setPage] = useState(0)
  const { data, isPending, isError } = useGetDebts(page, PAGE_SIZE)
  const { data: summary } = useGetDebtsSummary()
  const deleteDebt = useDeleteDebt()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Debt | undefined>()

  const debts = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const handleEdit = (debt: Debt) => {
    setEditTarget(debt)
    setModalOpen(true)
  }
  const handleDelete = (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    deleteDebt.mutate(id)
  }
  const handleClose = () => {
    setModalOpen(false)
    setEditTarget(undefined)
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
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">부채</h1>
          <p className="text-sm text-muted-foreground">총 {data?.totalElements ?? 0}건</p>
        </div>
        <Button variant="destructive" onClick={() => setModalOpen(true)}>
          + 부채 등록
        </Button>
      </div>

      {/* 요약 카드 */}
      {debts.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-xs text-destructive/70">총 부채</p>
            <p className="mt-1 text-lg font-bold text-destructive">
              {formatAmount(summary?.totalAmount ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-4">
            <p className="text-xs text-amber-600">월 상환 합계</p>
            <p className="mt-1 text-lg font-bold text-amber-700">
              {formatAmount(summary?.totalMonthlyPayment ?? 0)}
            </p>
          </div>
        </div>
      )}

      {debts.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
          등록된 부채가 없습니다
        </div>
      ) : (
        <>
          {/* 모바일 카드 */}
          <div className="space-y-3 md:hidden">
            {debts.map((debt) => (
              <div
                key={debt.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{debt.category}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{debt.owner}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${DEBT_TYPE_META[debt.type].badgeClass}`}
                  >
                    {formatDebtType(debt.type)}
                  </span>
                </div>
                <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">잔액</p>
                    <p className="font-medium text-destructive">{formatAmount(debt.amount)}</p>
                  </div>
                  {debt.monthlyPayment && (
                    <div>
                      <p className="text-xs text-muted-foreground">월 상환액</p>
                      <p className="text-muted-foreground">{formatAmount(debt.monthlyPayment)}</p>
                    </div>
                  )}
                  {debt.paymentDay && (
                    <div>
                      <p className="text-xs text-muted-foreground">상환일</p>
                      <p className="text-muted-foreground">매달 {debt.paymentDay}일</p>
                    </div>
                  )}
                  {debt.purpose && (
                    <div>
                      <p className="text-xs text-muted-foreground">목적</p>
                      <p className="text-muted-foreground">{debt.purpose}</p>
                    </div>
                  )}
                  {debt.note && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">메모</p>
                      <p className="text-muted-foreground">{debt.note}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 border-t border-border pt-3">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleEdit(debt)}>
                    <Pencil size={13} />
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(debt.id)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* 데스크탑 테이블 */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">카테고리</th>
                    <th className="px-4 py-3 text-left font-medium">명의</th>
                    <th className="px-4 py-3 text-left font-medium">유형</th>
                    <th className="px-4 py-3 text-right font-medium">잔액</th>
                    <th className="px-4 py-3 text-right font-medium">월 상환액</th>
                    <th className="px-4 py-3 text-center font-medium">상환일</th>
                    <th className="px-4 py-3 text-left font-medium">목적</th>
                    <th className="px-4 py-3 text-center font-medium">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {debts.map((debt) => (
                    <tr key={debt.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium text-foreground">{debt.category}</td>
                      <td className="px-4 py-3 text-muted-foreground">{debt.owner}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${DEBT_TYPE_META[debt.type].badgeClass}`}
                        >
                          {formatDebtType(debt.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-destructive">
                        {formatAmount(debt.amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {debt.monthlyPayment ? formatAmount(debt.monthlyPayment) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {debt.paymentDay ? `${debt.paymentDay}일` : '-'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{debt.purpose ?? '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-0.5">
                          <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(debt)} title="수정">
                            <Pencil size={14} />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(debt.id)} title="삭제" className="hover:bg-destructive/10 hover:text-destructive">
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

      {modalOpen && <DebtModal debt={editTarget} onClose={handleClose} />}
    </div>
  )
}
