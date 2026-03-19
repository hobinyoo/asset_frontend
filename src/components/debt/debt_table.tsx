'use client'

import { useState } from 'react'
import { useDeleteDebt, useGetDebts, useGetDebtsSummary } from '@/queries/debt'
import { formatAmount } from '@/utils/format'
import type { Debt, DebtType } from '@/types/debt'
import DebtModal from '@/components/debt/debt_modal'
import TablePagination from '@/components/common/table_pagination'
import { Pencil, Trash2 } from 'lucide-react'

const DEBT_TYPE_LABEL: Record<DebtType, string> = {
  FIXED: '거치',
  REGULAR: '정기',
  VARIABLE: '변동',
}

const DEBT_TYPE_COLOR: Record<DebtType, string> = {
  FIXED: 'bg-orange-50 text-orange-600',
  REGULAR: 'bg-blue-50 text-blue-600',
  VARIABLE: 'bg-purple-50 text-purple-600',
}

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
          <h1 className="text-xl font-semibold text-gray-900">부채</h1>
          <p className="text-sm text-gray-400">총 {data?.totalElements ?? 0}건</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
        >
          + 부채 등록
        </button>
      </div>

      {/* 요약 카드 */}
      {debts.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-xs text-red-400">총 부채</p>
            <p className="mt-1 text-lg font-bold text-red-600">
              {' '}
              {formatAmount(summary?.totalAmount ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
            <p className="text-xs text-orange-400">월 상환 합계</p>
            <p className="mt-1 text-lg font-bold text-orange-600">
              {formatAmount(summary?.totalMonthlyPayment ?? 0)}
            </p>
          </div>
        </div>
      )}

      {debts.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
          등록된 부채가 없습니다
        </div>
      ) : (
        <>
          {/* 모바일 카드 */}
          <div className="space-y-3 md:hidden">
            {debts.map((debt) => (
              <div
                key={debt.id}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{debt.category}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{debt.owner}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${DEBT_TYPE_COLOR[debt.type]}`}
                  >
                    {DEBT_TYPE_LABEL[debt.type]}
                  </span>
                </div>
                <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">잔액</p>
                    <p className="font-medium text-red-600">{formatAmount(debt.amount)}</p>
                  </div>
                  {debt.monthlyPayment && (
                    <div>
                      <p className="text-xs text-gray-400">월 상환액</p>
                      <p className="text-gray-600">{formatAmount(debt.monthlyPayment)}</p>
                    </div>
                  )}
                  {debt.paymentDay && (
                    <div>
                      <p className="text-xs text-gray-400">상환일</p>
                      <p className="text-gray-600">매달 {debt.paymentDay}일</p>
                    </div>
                  )}
                  {debt.purpose && (
                    <div>
                      <p className="text-xs text-gray-400">목적</p>
                      <p className="text-gray-600">{debt.purpose}</p>
                    </div>
                  )}
                  {debt.note && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400">메모</p>
                      <p className="text-gray-400">{debt.note}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 border-t border-gray-50 pt-3">
                  <button
                    onClick={() => handleEdit(debt)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs text-gray-500 hover:bg-gray-100"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(debt.id)}
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500">
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
                <tbody className="divide-y divide-gray-50">
                  {debts.map((debt) => (
                    <tr key={debt.id} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-800">{debt.category}</td>
                      <td className="px-4 py-3 text-gray-600">{debt.owner}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${DEBT_TYPE_COLOR[debt.type]}`}
                        >
                          {DEBT_TYPE_LABEL[debt.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">
                        {formatAmount(debt.amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {debt.monthlyPayment ? formatAmount(debt.monthlyPayment) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">
                        {debt.paymentDay ? `${debt.paymentDay}일` : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{debt.purpose ?? '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => handleEdit(debt)}
                            className="rounded p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-blue-500"
                            title="수정"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(debt.id)}
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
          </div>

          <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {modalOpen && <DebtModal debt={editTarget} onClose={handleClose} />}
    </div>
  )
}
