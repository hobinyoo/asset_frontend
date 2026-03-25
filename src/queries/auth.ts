import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { getMe, login, logout, signup } from '@/api/auth'
import { LoginRequest, SignupRequest } from '@/types/auth'

export const AUTH_KEYS = {
  me: () => ['me'] as const,
}

export function useMe() {
  return useQuery({
    queryKey: AUTH_KEYS.me(),
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogin() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (req: LoginRequest) => login(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.me() })
      router.push('/')
    },
  })
}

export function useSignup() {
  const router = useRouter()

  return useMutation({
    mutationFn: (req: SignupRequest) => signup(req),
    onSuccess: () => {
      router.push('/login')
    },
  })
}

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
      router.push('/login')
    },
  })
}
