import { OWNER_OPTIONS } from '@/constants/options'

type Owner = '유호빈' | '허선주' | '공통'

interface OwnerSelectProps {
  value: string
  onChange: (value: Owner) => void
}

export default function OwnerSelect({ value, onChange }: OwnerSelectProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">소유자</label>
      <select
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value as Owner)}
      >
        <option value="" disabled>
          소유자 선택
        </option>
        {OWNER_OPTIONS.map((owner) => (
          <option key={owner} value={owner}>
            {owner}
          </option>
        ))}
      </select>
    </div>
  )
}
