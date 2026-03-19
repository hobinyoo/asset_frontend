'use client'

import { useState, useEffect } from 'react'

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
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₩</span>
      <input
        className="w-full rounded-lg border border-gray-200 py-2 pl-7 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400"
        value={display}
        onChange={handleChange}
        placeholder={placeholder ?? '0'}
        disabled={disabled}
      />
    </div>
  )
}
