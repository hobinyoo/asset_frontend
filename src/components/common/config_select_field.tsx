'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { ConfigItem } from '@/types/config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  label: string
  value: string
  onChange: (value: string) => void
  items: ConfigItem[]
  onAdd: (value: string, onSuccess: (item: ConfigItem) => void) => void
  onDelete?: (id: number | null) => void
  isPending?: boolean
  placeholder?: string
}

export default function ConfigSelectField({
  label,
  value,
  onChange,
  items,
  onAdd,
  onDelete,
  isPending = false,
  placeholder = '선택',
}: Props) {
  const [adding, setAdding] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (!inputValue.trim()) return
    onAdd(inputValue.trim(), (item) => {
      onChange(item.value)
      setInputValue('')
      setAdding(false)
    })
  }

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {adding ? (
        <div className="flex gap-2">
          <Input
            className="rounded-lg"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="새 항목 입력"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd()
              }
            }}
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            disabled={isPending || !inputValue.trim()}
          >
            추가
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setAdding(false)
              setInputValue('')
            }}
          >
            취소
          </Button>
        </div>
      ) : (
        <>
          <Select value={value || undefined} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent position="popper" className="w-full">
              {items.map((item) => (
                // div wrapper: SelectItem 외부에 삭제 버튼 배치 (SelectPrimitive.ItemText 오염 방지)
                <div key={item.id ?? item.value} className="relative flex items-center">
                  <SelectItem value={item.value} className={onDelete ? 'w-full pr-14' : 'w-full'}>
                    {item.value}
                  </SelectItem>
                  {onDelete && item.id && (
                    <button
                      type="button"
                      className="absolute right-7 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-border hover:text-destructive"
                      // onPointerDown: Radix Select 가 이 클릭을 선택 이벤트로 처리하지 못하게 막음
                      onPointerDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onDelete(item.id)
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-0.5 h-auto p-0 text-xs"
            onClick={() => setAdding(true)}
          >
            + 직접 추가
          </Button>
        </>
      )}
    </div>
  )
}
