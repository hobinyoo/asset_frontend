interface ModalActionsProps {
  onClose: () => void
  onSubmit: () => void
  isPending: boolean
  isEdit: boolean
  disabled?: boolean
  color?: 'blue' | 'red'
  className?: string
}

export default function ModalActions({
  onClose,
  onSubmit,
  isPending,
  isEdit,
  disabled,
  color = 'blue',
  className = 'mt-4',
}: ModalActionsProps) {
  const submitClass =
    color === 'red'
      ? 'flex-1 rounded-lg bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50'
      : 'flex-1 rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50'

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={onClose}
        className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        취소
      </button>
      <button onClick={onSubmit} disabled={isPending || disabled} className={submitClass}>
        {isPending ? '저장 중...' : isEdit ? '수정' : '등록'}
      </button>
    </div>
  )
}
