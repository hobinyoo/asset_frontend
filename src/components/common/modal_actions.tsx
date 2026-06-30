import { Button } from '@/components/ui/button'

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
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button variant="outline" onClick={onClose} className="flex-1">
        취소
      </Button>
      <Button
        variant={color === 'red' ? 'destructive' : 'default'}
        onClick={onSubmit}
        disabled={isPending || disabled}
        className="flex-1"
      >
        {isPending ? '저장 중...' : isEdit ? '수정' : '등록'}
      </Button>
    </div>
  )
}
