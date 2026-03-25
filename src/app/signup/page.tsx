'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSignup, useMe } from '@/queries/auth'

export default function SignupPage() {
  const router = useRouter()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const { mutate: signup, isPending, error, isSuccess } = useSignup()
  const { data: user } = useMe()

  useEffect(() => {
    if (user) router.replace('/')
  }, [user, router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    signup({ loginId, password })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl">회원가입</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">아이디</label>
              <Input
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="사용할 아이디를 입력하세요"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">비밀번호</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="사용할 비밀번호를 입력하세요"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">회원가입에 실패했습니다. 다시 시도해주세요.</p>
            )}
            {isSuccess && (
              <p className="text-sm text-green-600">회원가입이 완료되었습니다. 로그인해주세요.</p>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? '처리 중...' : '회원가입'}
            </Button>
            <p className="text-center text-sm text-gray-500">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                로그인
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
