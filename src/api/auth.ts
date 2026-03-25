import api from '@/api/axios'
import { LoginRequest, UserResponse, SignupRequest } from '@/types/auth'
import { DataResponse } from '@/types/response'

export async function signup(req: SignupRequest): Promise<void> {
  await api.post<DataResponse<null>>('/api/auth/signup', req)
}

export async function login(req: LoginRequest): Promise<void> {
  await api.post<DataResponse<null>>('/api/auth/login', req)
}

export async function logout(): Promise<void> {
  await api.post('/api/auth/logout')
}

export async function getMe(): Promise<UserResponse> {
  const { data } = await api.get<DataResponse<UserResponse>>('/api/auth/me')
  return data.data
}
