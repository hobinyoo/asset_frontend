'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'

const formatWon = (value: number | undefined): string => {
  if (!value) return ''
  return value.toLocaleString('ko-KR')
}

interface WonInputProps {
  value: number | undefined
  onChange: (val: number | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export default function WonInput({ value, onChange, placeholder, disabled }: WonInputProps) {
  const [display, setDisplay] = useState(formatWon(value))

  useEffect(() => {
    setDisplay(formatWon(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '')
    if (raw === '' || /^\d+$/.test(raw)) {
      setDisplay(raw ? Number(raw).toLocaleString('ko-KR') : '')
      onChange(raw ? Number(raw) : undefined)
    }
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₩</span>
      <Input
        className="rounded-lg pl-7"
        value={display}
        onChange={handleChange}
        placeholder={placeholder ?? '0'}
        disabled={disabled}
      />
    </div>
  )
}
