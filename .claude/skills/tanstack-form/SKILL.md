---
name: tanstack-form
description: TanStack Form + Zod 유효성 검증 패턴. 폼 작성, 유효성 검증 추가, 필드 에러 표시 시 사용.
---

# TanStack Form + Zod 패턴

## 설치 패키지

```bash
pnpm add zod @tanstack/zod-form-adapter
```

## 기본 구조

```tsx
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'

// 1. Zod 스키마 정의
const schema = z.object({
  category: z.string().min(1, '카테고리를 선택해주세요'),
  amount: z.number({ invalid_type_error: '금액을 입력해주세요' }).positive('0보다 커야 합니다'),
  note: z.string().optional(),
})

// 2. useForm에 validatorAdapter 추가
const form = useForm({
  defaultValues: { category: '', amount: 0, note: '' },
  validatorAdapter: zodValidator(),
  validators: {
    onSubmit: schema,  // submit 시 전체 검증
  },
  onSubmit: async ({ value }) => {
    postAsset.mutate(value, { onSuccess: onClose })
  },
})
```

## 필드별 검증 + 에러 표시

```tsx
<form.Field
  name="category"
  validators={{
    onBlur: z.string().min(1, '카테고리를 선택해주세요'),
  }}
  children={(field) => (
    <FormField label="카테고리">
      <ConfigSelectField
        value={field.state.value}
        onChange={field.handleChange}
        onBlur={field.handleBlur}
        // ...
      />
      {field.state.meta.errors.length > 0 && (
        <p className="mt-1 text-xs text-red-500">
          {field.state.meta.errors[0]}
        </p>
      )}
    </FormField>
  )}
/>
```

## Zod 스키마 패턴

```tsx
// 필수 문자열
z.string().min(1, '필수 항목입니다')

// 숫자 (양수)
z.number().positive('0보다 커야 합니다')

// 선택 필드
z.string().optional()
z.number().optional()

// 조건부 필드 (monthlyPayment 있을 때만 paymentDay 필수)
z.object({
  hasMonthlyPayment: z.boolean(),
  monthlyPayment: z.number().optional(),
  paymentDay: z.number().optional(),
}).refine(
  (data) => !data.hasMonthlyPayment || !!data.monthlyPayment,
  { message: '월 납입금을 입력해주세요', path: ['monthlyPayment'] }
)

// 날짜 범위 (납입일 1~31)
z.number().min(1, '1일 이상').max(31, '31일 이하')

// enum
z.enum(['HOUSING', 'SAVINGS', 'RETIREMENT', 'INVESTMENT'])
```

## 검증 시점 선택

| 시점 | 언제 |
|------|------|
| `onChange` | 타이핑할 때마다 (UX 부담됨, 잘 안 씀) |
| `onBlur` | 필드에서 포커스 벗어날 때 (권장) |
| `onSubmit` | 제출할 때만 (전체 스키마 검증) |

```tsx
// 권장 패턴: onBlur로 필드 검증 + onSubmit으로 전체 검증
validators: {
  onSubmit: schema,  // useForm 레벨
}

// 각 field 레벨
validators={{
  onBlur: z.string().min(1, '필수입니다'),
}}
```

## submit 버튼 disabled 처리

```tsx
<ModalActions
  onClose={onClose}
  onSubmit={() => form.handleSubmit()}
  isPending={isPending}
  // form.state.canSubmit: 검증 통과 여부
  disabled={!form.state.canSubmit || isPending}
/>
```

## 에러 메시지 공통 컴포넌트

에러 표시가 반복되면 FormField에 통합:

```tsx
export function FormField({
  label,
  error,
  children,
}: {
  label: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// 사용
<form.Field
  name="category"
  children={(field) => (
    <FormField
      label="카테고리"
      error={field.state.meta.errors[0]}
    >
      <FormInput ... />
    </FormField>
  )}
/>
```