import { Button } from '@/components/ui/button'

interface ModalActionsProps {
  onClose: () => void
  onSubmit: () => void
  isPending: boolean
  isEdit: boolean
  disabled?: boolean
  color?: 'blue' | 'red'
  className?: string
  /** 지정 시 isEdit 기반 기본 라벨('수정'/'등록') 대신 사용 */
  submitLabel?: string
}

export default function ModalActions({
  onClose,
  onSubmit,
  isPending,
  isEdit,
  disabled,
  color = 'blue',
  className = 'mt-4',
  submitLabel,
}: ModalActionsProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button type="button" variant="outline" onClick={onClose} className="flex-1">
        취소
      </Button>
      <Button
        type="button"
        variant={color === 'red' ? 'destructive' : 'default'}
        onClick={onSubmit}
        disabled={isPending || disabled}
        className="flex-1"
      >
        {isPending ? '저장 중...' : (submitLabel ?? (isEdit ? '수정' : '등록'))}
      </Button>
    </div>
  )
}
